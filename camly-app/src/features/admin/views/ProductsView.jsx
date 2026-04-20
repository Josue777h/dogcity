import { Search, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { formatMoney } from '../../../lib/utils';

export default function ProductsView({ products, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input 
            type="text" 
            placeholder="Buscar productos..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl text-sm font-bold outline-none focus:border-brand shadow-sm transition-all" 
          />
        </div>
        <button 
          onClick={onAdd}
          className="w-full sm:w-auto btn-primary !py-3 !px-6 shadow-xl shadow-brand/20 flex items-center justify-center gap-2"
        >
          <Plus size={20} /> NUEVO PRODUCTO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map(p => (
          <div key={p.id} className="bg-white border border-border rounded-[2rem] p-4 group hover:shadow-xl hover:shadow-dark/5 transition-all duration-300">
            <div className="flex gap-5">
              <div className="w-24 h-24 bg-bg-alt rounded-2xl overflow-hidden relative shrink-0">
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                {!p.disponible && (
                  <div className="absolute inset-0 bg-dark/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="text-[8px] font-black text-white uppercase tracking-widest border border-white/20 px-2 py-1 rounded">Agotado</span>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Tag size={10} className="text-brand" />
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate">{p.categoria || 'Sin Categoría'}</span>
                  </div>
                  <h4 className="text-sm font-black text-dark truncate leading-tight group-hover:text-brand transition-colors">{p.name}</h4>
                  <p className="text-[10px] text-muted font-medium line-clamp-1 mt-1">{p.description || 'Sin descripción'}</p>
                </div>
                <p className="text-lg font-black text-dark tracking-tighter">{formatMoney(p.price)}</p>
              </div>

              <div className="flex flex-col justify-between py-1">
                <button 
                  onClick={() => onEdit(p)}
                  className="p-2.5 text-muted hover:text-brand hover:bg-brand/5 rounded-xl transition-all"
                  title="Editar"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => { if(confirm('¿Seguro que deseas eliminar este producto?')) onDelete(p.id) }}
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
    </div>
  );
}
