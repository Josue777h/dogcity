import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, Tag, Package, LayoutGrid, List } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useBusinessStore } from '../../../stores';

const PRODUCT_VIEW_MODE_KEY = 'negu_admin_products_view_mode';

function ProductSkeleton() {
  return (
    <div className="card p-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 skeleton rounded-lg shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3 skeleton w-16" />
          <div className="h-4 skeleton w-3/4" />
          <div className="h-3 skeleton w-1/2" />
          <div className="h-4 skeleton w-20" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsView(props) {
  const outletCtx = useOutletContext() || {};
  const products = props.products ?? outletCtx.products ?? [];
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

  const getCategoryName = (id, fallbackName) => {
    if (!id) return fallbackName || 'General';
    const cat = categories.find(c => String(c.id) === String(id));
    return cat ? cat.nombre : (fallbackName || 'General');
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const q = searchTerm.toLowerCase();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchCat = getCategoryName(p.categoria_id, p.categoria).toLowerCase().includes(q);
      return matchName || matchCat;
    });
  }, [products, searchTerm, categories]);

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Top Bar: Search + Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Buscar productos o categorías..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-9" 
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View toggle */}
          <div className="flex bg-white border border-border rounded-lg p-0.5 shrink-0">
            <button 
              onClick={() => changeViewMode('grid')}
              aria-label="Mostrar productos en tarjetas"
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => changeViewMode('list')}
              aria-label="Mostrar productos en lista"
              aria-pressed={viewMode === 'list'}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
              title="Vista en lista"
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={onAdd}
            className="btn-primary py-2 px-3.5 text-xs font-semibold flex-1 sm:flex-initial justify-center"
          >
            <Plus size={15} /> <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-3' 
          : 'space-y-1.5'
        }>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              role="button"
              tabIndex={0}
              onClick={() => onEdit(p)}
              onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) onEdit(p); }}
              title="Editar producto"
              className={`card cursor-pointer transition-all duration-150 hover:border-orange-300 hover:shadow-xs active:scale-[0.99]
                ${viewMode === 'grid' ? 'p-3 flex flex-col justify-between' : 'px-3 py-2 flex items-center justify-between gap-3'}`}
            >
              <div className={`flex gap-3 ${viewMode === 'list' ? 'flex-1 items-center min-w-0' : ''}`}>
                <div className={`bg-gray-50 rounded-lg border border-border overflow-hidden relative shrink-0 ${viewMode === 'grid' ? 'w-16 h-16' : 'w-11 h-11'}`}>
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    loading="lazy"
                    decoding="async"
                    onError={e => { e.target.src = '/images/taza.svg'; }}
                    className="w-full h-full object-cover" 
                  />
                  {!p.disponible && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-white px-1.5 py-0.5 rounded bg-red-600">Agotado</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Tag size={10} className="text-gray-400" />
                      {getCategoryName(p.categoria_id, p.categoria)}
                    </span>
                    {p.disponible ? (
                      <span className="badge badge-success text-[10px]">Disponible</span>
                    ) : (
                      <span className="badge badge-error text-[10px]">Agotado</span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 truncate leading-tight">
                    {p.name}
                  </h4>
                  {viewMode === 'grid' && p.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                  <p className="text-sm font-black text-gray-900 mt-1 tabular-nums">
                    {formatMoney(p.price)}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-1 ${viewMode === 'grid' ? 'border-t border-border pt-2 mt-2 justify-end' : 'shrink-0'}`}>
                {onToggleAvailability && <button
                  type="button"
                  role="switch"
                  aria-checked={!!p.disponible}
                  aria-label={`${p.disponible ? 'Pausar' : 'Activar'} ${p.name}`}
                  onClick={(e) => { e.stopPropagation(); onToggleAvailability(p); }}
                  className={`relative h-6 w-11 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${p.disponible ? 'bg-emerald-500' : 'bg-slate-300'}`}
                ><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${p.disponible ? 'left-[22px]' : 'left-0.5'}`} /></button>}
                <button 
                  onClick={(e) => { e.stopPropagation(); onEdit(p); }}
                  className="btn-ghost p-1.5 tap-target text-gray-500 hover:text-gray-900"
                  title="Editar producto"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setItemToDelete(p); }}
                  className="btn-ghost p-1.5 tap-target text-gray-500 hover:text-red-600"
                  title="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-10 text-center card border-dashed p-6">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={22} className="text-gray-400" />
              </div>
              <h5 className="text-sm font-semibold text-gray-800">
                {searchTerm ? 'No se encontraron productos' : 'Catálogo vacío'}
              </h5>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                {searchTerm ? 'Prueba con otro término de búsqueda' : 'Comienza agregando tu primer producto para vender'}
              </p>
              {!searchTerm && (
                <button onClick={onAdd} className="btn-primary mt-4 py-2 px-4 text-xs">
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
