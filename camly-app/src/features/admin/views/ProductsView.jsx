import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Tag, Package, LayoutGrid, List } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import { useBusinessStore } from '../../../stores';

function ProductSkeleton() {
  return (
    <div className="bg-white border border-border rounded-[2rem] p-4 animate-pulse">
      <div className="flex gap-5">
        <div className="w-24 h-24 skeleton rounded-2xl shrink-0" />
        <div className="flex-1 space-y-3 py-1">
          <div className="h-3 skeleton w-20" />
          <div className="h-4 skeleton w-3/4" />
          <div className="h-3 skeleton w-1/2" />
          <div className="h-5 skeleton w-16" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsView({ products, onAdd, onEdit, onDelete, loading }) {
  const [itemToDelete, setItemToDelete] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const { categories } = useBusinessStore();

  const getCategoryName = (id, fallbackName) => {
    if (!id) return fallbackName || 'Sin Categoría';
    const cat = categories.find(c => c.id === id);
    return cat ? cat.nombre : (fallbackName || 'Sin Categoría');
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm font-bold outline-none focus:border-brand input-glow shadow-sm transition-all" 
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-white border border-border rounded-xl p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-dark'}`}
              title="Vista grid"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand text-white shadow-sm' : 'text-muted hover:text-dark'}`}
              title="Vista lista"
            >
              <List size={16} />
            </button>
          </div>
          <button 
            onClick={onAdd}
            className="flex-1 sm:flex-none btn-primary !py-3 !px-6 shadow-xl shadow-brand/20 flex items-center justify-center gap-2"
          >
            <Plus size={20} /> NUEVO PRODUCTO
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <ProductSkeleton key={i} />)}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
          : 'space-y-3'
        }>
          {products.map(p => (
            <div 
              key={p.id} 
              className={`card-3d bg-white border border-border group transition-all duration-300 hover:shadow-xl hover:shadow-brand/5
                ${viewMode === 'grid' ? 'rounded-[2rem] p-4' : 'rounded-2xl p-4 flex items-center gap-4'}`}
            >
              <div className={`flex gap-5 ${viewMode === 'list' ? 'flex-1 items-center' : ''}`}>
                <div className={`bg-bg-alt rounded-2xl overflow-hidden relative shrink-0 ${viewMode === 'grid' ? 'w-24 h-24' : 'w-16 h-16'}`}>
                  <img 
                    src={p.image} 
                    alt={p.name} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  />
                  {!p.disponible ? (
                    <div className="absolute inset-0 bg-error/80 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-[8px] font-black text-white uppercase tracking-widest px-2 py-1 rounded bg-error/50">Agotado</span>
                    </div>
                  ) : (
                    <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-success rounded-full border border-white shadow-sm" title="Disponible" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Tag size={10} className="text-brand" />
                      <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate">
                        {getCategoryName(p.categoria_id, p.categoria)}
                      </span>
                      {p.disponible && (
                        <span className="text-[8px] font-black text-success bg-success/10 px-1.5 py-0.5 rounded uppercase tracking-widest">Disponible</span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-dark truncate leading-tight group-hover:text-brand transition-colors">{p.name}</h4>
                    {viewMode === 'grid' && (
                      <p className="text-[10px] text-muted font-medium line-clamp-1 mt-1">{p.description || 'Sin descripción'}</p>
                    )}
                  </div>
                  <p className="text-lg font-black text-dark tracking-tighter">{formatMoney(p.price)}</p>
                </div>

                <div className="flex flex-col justify-between py-1 gap-1">
                  <button 
                    onClick={() => onEdit(p)}
                    className="p-2.5 text-muted hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => setItemToDelete(p)}
                    className="p-2.5 text-muted hover:text-error hover:bg-error/5 rounded-xl transition-all"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white border border-dashed border-border rounded-[2.5rem]">
              <div className="w-16 h-16 bg-bg-alt rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-muted" />
              </div>
              <h5 className="text-sm font-black text-dark uppercase tracking-widest">Catálogo Vacío</h5>
              <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Empieza creando tu primer producto</p>
              <button onClick={onAdd} className="mt-6 text-brand text-xs font-black uppercase tracking-widest hover:underline">
                Crear Producto Ahora
              </button>
            </div>
          )}
        </div>
      )}

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Eliminar Producto"
        message={`¿Seguro que deseas eliminar "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        onConfirm={() => onDelete(itemToDelete.id)}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
