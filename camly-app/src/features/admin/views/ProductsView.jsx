import { useState, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Tag, Package, LayoutGrid, List } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useBusinessStore } from '../../../stores';
import PageLoading from '../../../components/common/PageLoading';

const PRODUCT_VIEW_MODE_KEY = 'negu_admin_products_view_mode';

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
  const { categories } = useBusinessStore();

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

        <button
          type="button"
          onClick={onAdd}
          className="btn-primary w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
        >
          <Plus size={15} />
          <span>Nuevo producto</span>
        </button>
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
                  {!p.disponible && (
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
                    {p.disponible ? (
                      <span className="badge badge-success text-[10px]">Disponible</span>
                    ) : (
                      <span className="badge badge-error text-[10px]">Agotado</span>
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
                  <p className="text-sm font-bold text-slate-950 mt-1 tabular-nums">
                    {formatMoney(p.price)}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-1.5 ${viewMode === 'grid' ? 'border-t border-slate-100 pt-2.5 mt-3 justify-end' : 'shrink-0'}`}>
                {onToggleAvailability && <button
                  type="button"
                  role="switch"
                  aria-checked={!!p.disponible}
                  aria-label={`${p.disponible ? 'Pausar' : 'Activar'} ${p.name}`}
                  onClick={(e) => { e.stopPropagation(); onToggleAvailability(p); }}
                  className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${p.disponible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                ><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${p.disponible ? 'left-[22px]' : 'left-0.5'}`} /></button>}
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
    </div>
  );
}
