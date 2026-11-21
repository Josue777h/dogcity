import { useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Tag, Package, LayoutGrid, List, Settings, Save, RotateCcw } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import { updateBusiness } from '../../../lib/supabase';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import SettingsDrawer from '../../../components/ui/SettingsDrawer';
import { useBusinessStore, useToastStore } from '../../../stores';
import PageLoading from '../../../components/common/PageLoading';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const PRODUCT_VIEW_MODE_KEY = 'negu_admin_products_view_mode';
const DEFAULT_INVENTORY_CONFIG = {
  lowStockThreshold: 5,
  autoDeductStock: true,
  hideOutOfStock: true,
  showLowStockBadge: true,
  showDiscountBadge: true,
};

function resolveInventoryConfig(business) {
  const fromDb = business?.catalog_design?.inventory_config;
  if (fromDb && typeof fromDb === 'object') {
    return { ...DEFAULT_INVENTORY_CONFIG, ...fromDb };
  }
  return { ...DEFAULT_INVENTORY_CONFIG };
}

export default function ProductsView(props) {
  const outletCtx = useOutletContext() || {};
  const products = useMemo(() => props.products ?? outletCtx.products ?? [], [props.products, outletCtx.products]);
  const onAdd = props.onAdd ?? (() => outletCtx.setEditingProduct?.({}));
  const onEdit = props.onEdit ?? ((p) => outletCtx.setEditingProduct?.(p));
  const onDelete = props.onDelete ?? ((id) => outletCtx.handleDeleteProduct?.(id));
  const onToggleAvailability = props.onToggleAvailability ?? outletCtx.handleToggleProductAvailability;
  const loading = props.loading ?? false;

  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(PRODUCT_VIEW_MODE_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, business } = useBusinessStore();
  const addToast = useToastStore(s => s.addToast);
  const [invConfig, setInvConfig] = useState(() => resolveInventoryConfig(business));
  const [showInvModal, setShowInvModal] = useState(false);
  const [invDraft, setInvDraft] = useState(() => resolveInventoryConfig(business));
  const [savingInv, setSavingInv] = useState(false);

  const lowStockThreshold = Math.max(1, Number(invConfig.lowStockThreshold) || 5);

  const handleSaveInvConfig = async (e) => {
    e.preventDefault();
    const clean = {
      lowStockThreshold: Math.max(1, Math.min(500, Number(invDraft.lowStockThreshold) || 5)),
      autoDeductStock: Boolean(invDraft.autoDeductStock),
      hideOutOfStock: Boolean(invDraft.hideOutOfStock),
      showLowStockBadge: Boolean(invDraft.showLowStockBadge),
      showDiscountBadge: Boolean(invDraft.showDiscountBadge),
    };
    setSavingInv(true);
    try {
      if (business?.id) {
        const nextDesign = {
          ...(business.catalog_design && typeof business.catalog_design === 'object' ? business.catalog_design : {}),
          inventory_config: clean,
        };
        await updateBusiness(business.id, { catalog_design: nextDesign });
        outletCtx.reloadOrders?.();
      }
      setInvConfig(clean);
      setShowInvModal(false);
      addToast('Configuración de inventario guardada', 'success');
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Error al guardar configuración', 'error');
    } finally {
      setSavingInv(false);
    }
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(PRODUCT_VIEW_MODE_KEY, mode);
    } catch {
      // La vista actual sigue funcionando aunque el navegador bloquee el almacenamiento local.
    }
  };

  const getCategoryName = useCallback((id, fallbackName) => {
    if (!id) return fallbackName || 'General';
    const cat = categories.find(c => String(c.id) === String(id));
    return cat ? cat.nombre : (fallbackName || 'General');
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter(p => {
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchCat = getCategoryName(p.categoria_id, p.categoria).toLowerCase().includes(q);
      return matchName || matchCat;
    });
  }, [products, searchTerm, getCategoryName]);

  return (
    <div className="space-y-4 pb-10 animate-fade-in-up">
      {/* Encabezado limpio y profesional */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package size={19} className="text-brand shrink-0" />
              <span>Catálogo de Productos</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {products.length} {products.length === 1 ? 'producto' : 'productos'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Administra precios, disponibilidad, fotografías y grupos de opciones de tu tienda.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => { setInvDraft({ ...invConfig }); setShowInvModal(true); }}
            className="btn-secondary py-2.5 px-3 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            title="Configurar inventario y stock"
            aria-label="Configurar inventario y stock"
          >
            <Settings size={15} />
            <span className="sm:hidden">Configurar</span>
          </button>
          <button
            type="button"
            onClick={onAdd}
            className="btn-primary flex-1 sm:flex-initial py-2.5 px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {/* Buscador + Selector de vista */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Buscar productos o categorías..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9"
          />
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => changeViewMode('grid')}
              aria-label="Mostrar productos en tarjetas"
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-brand/10 text-brand font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              type="button"
              onClick={() => changeViewMode('list')}
              aria-label="Mostrar productos en lista"
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-brand/10 text-brand font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              title="Vista en lista"
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoading fullscreen={false} label="Cargando productos" />
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3'
          : 'space-y-2'
        }>
          {filteredProducts.map(p => (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => onEdit(p)}
              onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) onEdit(p); }}
              title="Editar producto"
              className={`bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs cursor-pointer transition-all duration-150
                ${viewMode === 'grid' ? 'p-3.5 flex flex-col justify-between' : 'px-3.5 py-2.5 flex items-center justify-between gap-3'}`}
            >
              <div className={`flex gap-3 ${viewMode === 'list' ? 'flex-1 items-center min-w-0' : ''}`}>
                <div className={`bg-slate-50 rounded-xl border border-slate-200/80 overflow-hidden relative shrink-0 ${viewMode === 'grid' ? 'w-16 h-16' : 'w-11 h-11'}`}>
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    decoding="async"
                    onError={e => { e.target.src = '/images/taza.svg'; }}
                    className="w-full h-full object-cover"
                  />
                  {(!p.disponible || (p.stock !== null && p.stock !== undefined && Number(p.stock) <= 0)) && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded bg-red-600">Agotado</span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} className="text-slate-400" />
                      {getCategoryName(p.categoria_id, p.categoria)}
                    </span>
                    {p.disponible && !(p.stock !== null && p.stock !== undefined && Number(p.stock) <= 0) ? (
                      <span className="badge badge-success text-[10px]">Disponible</span>
                    ) : (
                      <span className="badge badge-error text-[10px]">Agotado</span>
                    )}
                    {p.stock !== null && p.stock !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded-md border text-[10px] font-semibold tabular-nums ${
                        Number(p.stock) <= 0
                          ? 'bg-rose-50 border-rose-200 text-rose-700'
                          : Number(p.stock) <= lowStockThreshold
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                      }`}>
                        {Number(p.stock) <= 0 ? 'Sin stock' : `Stock: ${p.stock}`}
                      </span>
                    )}
                    {Array.isArray(p.opciones) && p.opciones.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[10px] font-semibold text-slate-700">
                        {p.opciones.length} opc.
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-950 truncate leading-tight">
                    {p.name}
                  </h4>
                  {viewMode === 'grid' && p.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 break-words overflow-hidden text-ellipsis mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-1.5 flex-wrap mt-1">
                    <p className="text-sm font-bold text-slate-950 tabular-nums">
                      {formatMoney(p.price)}
                    </p>
                    {p.comparePrice > p.price && (
                      <>
                        <span className="text-xs text-slate-400 line-through tabular-nums">
                          {formatMoney(p.comparePrice)}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                          -{Math.round(((p.comparePrice - p.price) / p.comparePrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 ${viewMode === 'grid' ? 'border-t border-slate-100 pt-2.5 mt-3 justify-end' : 'shrink-0'}`}>
                {onToggleAvailability && <button
                  type="button"
                  role="switch"
                  aria-checked={!!p.disponible}
                  aria-label={`${p.disponible ? 'Pausar' : 'Activar'} ${p.name}`}
                  onClick={(e) => { e.stopPropagation(); onToggleAvailability(p); }}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${p.disponible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                ><span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${p.disponible ? 'translate-x-5' : 'translate-x-0'}`} /></button>}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                  className="btn-ghost p-1.5 tap-target text-slate-500 hover:text-slate-950"
                  title="Editar producto"
                >
                  <Edit size={16} />
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setItemToDelete(p); }}
                  className="btn-ghost p-1.5 tap-target text-slate-500 hover:text-red-600"
                  title="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Package size={22} className="text-slate-400" />
              </div>
              <h5 className="text-sm font-bold text-slate-800">
                {searchTerm ? 'No se encontraron productos' : 'Catálogo vacío'}
              </h5>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {searchTerm ? 'Prueba con otro término de búsqueda' : 'Comienza agregando tu primer producto para vender'}
              </p>
              {!searchTerm && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="btn-primary mt-4 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                >
                  <Plus size={14} /> Agregar primer producto
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Eliminar Producto"
        message={`¿Seguro que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => {
          onDelete(itemToDelete.id);
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />

      <SettingsDrawer
        isOpen={showInvModal}
        onClose={() => setShowInvModal(false)}
        title="Ajustes de Productos e Inventario"
        subtitle="Controla cómo se comporta el stock y qué ven tus clientes en el catálogo."
        icon={Package}
        onSubmit={handleSaveInvConfig}
        footer={(
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setInvDraft({ ...DEFAULT_INVENTORY_CONFIG })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw size={13} /> Restaurar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowInvModal(false)}
                className="btn-secondary py-2 px-3.5 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingInv}
                className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
              >
                {savingInv ? <LoadingSpinner size={14} /> : <><Save size={14} /> Guardar cambios</>}
              </button>
            </div>
          </div>
        )}
      >
        {/* Grupo 1: Inventario */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Control de inventario
          </h4>

          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Descuento automático de stock</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Descuenta unidades al confirmar un pedido y las repone si se cancela.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(invDraft.autoDeductStock)}
                onClick={() => setInvDraft(prev => ({ ...prev, autoDeductStock: !prev.autoDeductStock }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${invDraft.autoDeductStock ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${invDraft.autoDeductStock ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Ocultar productos agotados</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Si lo desactivas, los productos sin stock seguirán visibles con etiqueta &ldquo;Agotado&rdquo;.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(invDraft.hideOutOfStock)}
                onClick={() => setInvDraft(prev => ({ ...prev, hideOutOfStock: !prev.hideOutOfStock }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${invDraft.hideOutOfStock ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${invDraft.hideOutOfStock ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="inv-low-threshold" className="text-xs font-bold text-slate-900">
                  Alerta de stock bajo
                </label>
                <div className="flex items-center gap-1">
                  {[3, 5, 10].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setInvDraft(prev => ({ ...prev, lowStockThreshold: n }))}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border transition-colors cursor-pointer ${
                        Number(invDraft.lowStockThreshold) === n
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {n} uds
                    </button>
                  ))}
                </div>
              </div>
              <input
                id="inv-low-threshold"
                type="number"
                min={1}
                max={500}
                value={invDraft.lowStockThreshold}
                onChange={e => setInvDraft(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                className="input-field text-xs font-semibold tabular-nums"
              />
              <p className="text-[11px] text-slate-500 leading-snug">
                Resalta en ámbar los productos que lleguen a este nivel o menos.
              </p>
            </div>
          </div>
        </section>

        {/* Grupo 2: Presentación en tienda */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Presentación en tu tienda pública
          </h4>

          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Mostrar aviso &ldquo;Quedan pocas unidades&rdquo;</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Muestra al cliente cuántas unidades quedan cuando un producto tiene stock bajo.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(invDraft.showLowStockBadge)}
                onClick={() => setInvDraft(prev => ({ ...prev, showLowStockBadge: !prev.showLowStockBadge }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${invDraft.showLowStockBadge ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${invDraft.showLowStockBadge ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Mostrar etiqueta de descuento (-%)</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Muestra el porcentaje de ahorro sobre la foto cuando el producto tiene precio anterior.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={Boolean(invDraft.showDiscountBadge)}
                onClick={() => setInvDraft(prev => ({ ...prev, showDiscountBadge: !prev.showDiscountBadge }))}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors cursor-pointer ${invDraft.showDiscountBadge ? 'bg-emerald-500' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${invDraft.showDiscountBadge ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </section>
      </SettingsDrawer>
    </div>
  );
}
