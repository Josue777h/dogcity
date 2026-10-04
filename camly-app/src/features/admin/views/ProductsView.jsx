import { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Tag, Package, LayoutGrid, List } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useBusinessStore } from '../../../stores';

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

export default function ProductsView({ products, onAdd, onEdit, onDelete, loading }) {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const { categories } = useBusinessStore();

  const getCategoryName = (id, fallbackName) => {
    if (!id) return fallbackName || 'General';
    const cat = categories.find(c => c.id === id);
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
    <div className="space-y-6 animate-fade-in-up">
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
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
              title="Vista en cuadrícula"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-gray-500 hover:text-gray-800'}`}
              title="Vista en lista"
            >
              <List size={16} />
            </button>
          </div>

          <button 
            onClick={onAdd}
            className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold flex-1 sm:flex-initial justify-center"
          >
            <Plus size={16} /> <span>Nuevo producto</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-2'
        }>
          {filteredProducts.map(p => (
            <div 
              key={p.id} 
              className={`card p-4 transition-all duration-150 hover:border-gray-300
                ${viewMode === 'grid' ? 'flex flex-col justify-between' : 'flex items-center justify-between gap-4'}`}
            >
              <div className={`flex gap-3.5 ${viewMode === 'list' ? 'flex-1 items-center min-w-0' : ''}`}>
                <div className={`bg-gray-50 rounded-lg border border-border overflow-hidden relative shrink-0 ${viewMode === 'grid' ? 'w-20 h-20' : 'w-14 h-14'}`}>
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
                
                <div className="flex-1 min-w-0 py-0.5">
                  <div className="flex items-center gap-2 mb-1">
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
                  <p className="text-sm font-black text-gray-900 mt-1.5 tabular-nums">
                    {formatMoney(p.price)}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-1 ${viewMode === 'grid' ? 'border-t border-border pt-3 mt-3 justify-end' : 'shrink-0'}`}>
                <button 
                  onClick={() => onEdit(p)}
                  className="btn-ghost p-1.5 tap-target text-gray-500 hover:text-gray-900"
                  title="Editar producto"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => setItemToDelete(p)}
                  className="btn-ghost p-1.5 tap-target text-gray-500 hover:text-red-600"
                  title="Eliminar producto"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && (
            <div className="col-span-full py-16 text-center card border-dashed p-8">
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
