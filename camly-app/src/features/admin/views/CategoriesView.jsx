import { useState } from 'react';
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
      addToast('Error actualizando categorías.', 'error');
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
         addToast('Error al crear categoría', 'error');
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
      addToast('Categoría eliminada', 'info');
      fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      addToast('No se puede eliminar porque hay productos vinculados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getProductCount = (catId) => {
    return products.filter(p => p.categoria_id === catId).length;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
           <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Categorías</h3>
           <p className="text-sm text-gray-600 mt-1 leading-relaxed">Organiza los productos de tu menú por grupos claros</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary py-2 px-4 text-xs font-semibold"
        >
          {isAdding ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Nueva categoría</>}
        </button>
      </div>

      <PremiumLock featureName="Gestión de Categorías Relacionales">
        <div className="space-y-5">
          {/* Add Category Form */}
          {isAdding && (
            <form onSubmit={handleAdd} className="card p-4 border-orange-200 bg-orange-50/40 animate-fade-in">
              <p className="text-xs font-semibold text-gray-800 mb-2">Crear nueva categoría</p>
              <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                <input 
                  autoFocus
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Ej: Hamburguesas, Bebidas, Postres..."
                  className="input-field text-sm flex-1" 
                  required
                />
                <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-xs font-semibold">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Guardar</>}
                </button>
              </div>
            </form>
          )}

          {/* Grid of categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map(cat => (
              <div key={cat.id} className="card p-4 transition-all hover:border-gray-300 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
                    <Tag size={16} />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => { setEditingId(cat.id); setEditingName(cat.nombre); }}
                      className="btn-ghost p-1 text-gray-400 hover:text-gray-800"
                      title="Editar"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      onClick={() => setItemToDelete(cat)}
                      className="btn-ghost p-1 text-gray-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {editingId === cat.id ? (
                  <div className="flex gap-1.5 w-full mt-1">
                    <input 
                      autoFocus
                      type="text" 
                      value={editingName} 
                      onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => {
                         if (e.key === 'Enter') handleUpdate(cat.id);
                         if (e.key === 'Escape') setEditingId(null);
                      }}
                      className="input-field text-xs py-1 flex-1"
                    />
                    <button onClick={() => handleUpdate(cat.id)} className="btn-primary p-1.5 text-xs">
                       <Save size={13}/>
                    </button>
                    <button onClick={() => setEditingId(null)} className="btn-secondary p-1.5 text-xs">
                       <X size={13}/>
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{cat.nombre}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      <span className="font-medium text-orange-600">{getProductCount(cat.id)}</span> {getProductCount(cat.id) === 1 ? 'producto' : 'productos'}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {!categories.length && !loading && !isAdding && (
              <div className="col-span-full py-16 text-center card border-dashed p-8">
                 <Tag className="mx-auto text-gray-300 mb-2" size={32} />
                 <p className="text-sm font-semibold text-gray-800">No hay categorías creadas</p>
                 <p className="text-xs text-gray-500 mt-1">Crea categorías para organizar mejor tu catálogo.</p>
              </div>
            )}
          </div>
        </div>
      </PremiumLock>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Eliminar Categoría"
        message={`¿Seguro que deseas eliminar "${itemToDelete?.nombre}"? Esta acción no afectará tus productos, pero se desvincularán.`}
        onConfirm={() => {
          handleDelete(itemToDelete.id);
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
