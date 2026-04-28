import { useState, useEffect } from 'react';
import { Tag, Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';
import { getSupabase, updateCategory, createCategory, deleteCategory } from '../../../lib/supabase';
import { useToastStore, useBusinessStore } from '../../../stores';
import PremiumLock from '../../../components/ui/PremiumLock';
import ConfirmModal from '../../../components/ui/ConfirmModal';

export default function CategoriesView({ businessId }) {
  const { categories, setCategories, products } = useBusinessStore();
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  
  const [itemToDelete, setItemToDelete] = useState(null);
  const addToast = useToastStore(s => s.addToast);

  const fetchCategoriasLocally = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSupabase()
        .from('categorias')
        .select('*')
        .eq('negocio_id', businessId)
        .order('nombre', { ascending: true });
      if (error && error.code !== '42P01') throw error;
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      addToast('Error actualizando categorías. Verifica SQL.', 'error');
    } finally {
       setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setLoading(true);
    try {
      await createCategory({ nombre: newCatName, negocio_id: businessId });
      addToast('Categoría creada', 'success');
      setNewCatName('');
      setIsAdding(false);
      fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      if(err.code === '23505') {
         addToast('Esta categoría ya existe', 'error');
      } else {
         addToast('Error al crear. ¿Corriste el Script SQL en Supabase?', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editingName.trim()) return;
    setLoading(true);
    try {
      await updateCategory(id, { nombre: editingName });
      addToast('Categoría actualizada', 'success');
      setEditingId(null);
      fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      if(err.code === '23505') {
         addToast('Esta categoría ya existe', 'error');
      } else {
         addToast('Error al actualizar', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteCategory(id);
      addToast('Categoría eliminada limpiamente', 'info');
      fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      addToast('No se puede eliminar porque hay productos usándola', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProductCount = (catId) => {
    return products.filter(p => p.categoria_id === catId).length;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-white p-6 rounded-[2rem] border border-border">
        <div>
           <h4 className="text-xl font-black text-dark uppercase tracking-tight">Gestor de Categorías</h4>
           <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Organiza tu catálogo sin duplicados</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary !py-3 !px-6 shadow-lg shadow-brand/20 w-full sm:w-auto flex justify-center"
        >
          {isAdding ? <X size={18} /> : <><Plus size={18} /> NUEVA CATEGORÍA</>}
        </button>
      </div>

      <PremiumLock featureName="Gestión de Categorías Relacionales">
        <div className="space-y-8 mt-8">
          {isAdding && (
            <form onSubmit={handleAdd} className="bg-brand/5 border border-brand/20 p-8 rounded-[2.5rem] animate-in zoom-in-95 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full lg:w-2/3">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre</label>
                  <input 
                    autoFocus
                    type="text" 
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="Ej: Snacks, Bebidas..."
                    className="w-full p-4 bg-white border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand" 
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" disabled={loading} className="w-full btn-primary !py-4 shadow-xl shadow-brand/20">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> GUARDAR</>}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map(cat => (
              <div key={cat.id} className="bg-white border border-border rounded-[2.5rem] p-6 hover:shadow-xl transition-all group flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl flex items-center justify-center bg-brand/10 text-brand">
                    <Tag size={24} />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingId(cat.id); setEditingName(cat.nombre); }}
                      className="p-2 text-muted hover:text-brand hover:bg-brand/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => setItemToDelete(cat)}
                      className="p-2 text-error/40 hover:text-error hover:bg-error/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editingId === cat.id ? (
                  <div className="flex gap-2 w-full mt-2">
                    <input 
                      autoFocus
                      type="text" 
                      value={editingName} 
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                         if (e.key === 'Enter') handleUpdate(cat.id);
                         if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="flex-1 bg-bg-alt border border-brand/50 rounded-xl px-3 py-2 text-sm font-bold w-full outline-none"
                    />
                    <button onClick={() => handleUpdate(cat.id)} className="bg-brand text-white px-3 py-2 rounded-xl">
                       <Save size={14}/>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <h5 className="text-xl font-black text-dark tracking-tight leading-none break-words pr-2">{cat.nombre}</h5>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest flex items-center gap-1">
                       <span className="text-brand font-black">{getProductCount(cat.id)}</span> Productos
                    </p>
                  </div>
                )}
              </div>
            ))}

            {!categories.length && !loading && !isAdding && (
              <div className="md:col-span-2 lg:col-span-3 py-16 text-center border-2 border-dashed border-border rounded-[2.5rem]">
                 <Tag className="mx-auto text-muted mb-4 opacity-20" size={48} />
                 <p className="text-sm font-black text-muted uppercase tracking-widest leading-none">No hay categorías relacionales</p>
                 <p className="text-[10px] text-muted font-bold uppercase mt-2">Verifica haber corrido la migración SQL o añade una nueva.</p>
              </div>
            )}
          </div>
        </div>
      </PremiumLock>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Eliminar Categoría"
        message={`¿Seguro que deseas eliminar "${itemToDelete?.nombre}"? Esta acción no afectará tus productos, pero se desvincularán.`}
        onConfirm={() => handleDelete(itemToDelete.id)}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
