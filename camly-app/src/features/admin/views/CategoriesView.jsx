import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Tag, Plus, Edit, Trash2, Save, X, Search, Package, Check } from 'lucide-react';
import { getSupabase, updateCategory, createCategory, deleteCategory, fetchCategories } from '../../../lib/supabase';
import { useToastStore, useBusinessStore } from '../../../stores';
import PremiumLock from '../../../components/ui/PremiumLock';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const SUGGESTED_CATEGORIES = [
  'Hamburguesas',
  'Carnes',
  'Perros Calientes',
  'Salchipapas',
  'Bebidas',
  'Entradas',
  'Adicionales',
  'Postres',
  'Combos'
];

export default function CategoriesView(props) {
  const outletCtx = useOutletContext() || {};
  const businessId = props.businessId ?? outletCtx.business?.id;

  const { categories, setCategories, products: storeProducts } = useBusinessStore();
  const products = outletCtx.products?.length ? outletCtx.products : storeProducts || [];

  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  const [itemToDelete, setItemToDelete] = useState(null);
  const addToast = useToastStore(s => s.addToast);

  useEffect(() => {
    if (!businessId) return undefined;
    let active = true;
    fetchCategories(businessId)
      .then(data => { if (active) setCategories(data); })
      .catch(err => {
        console.error(err);
        if (active) addToast('Error actualizando categorías.', 'error');
      });
    return () => { active = false; };
  }, [businessId, setCategories, addToast]);

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
    if (e) e.preventDefault();
    const cleanName = newCatName.trim();
    if (!cleanName) return;
    setLoading(true);
    try {
      const createdCategory = await createCategory({ nombre: cleanName, negocio_id: businessId });
      setCategories(current => [
        ...current.filter(category => String(category.id) !== String(createdCategory.id)),
        createdCategory,
      ].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      addToast(`Categoría "${cleanName}" creada`, 'success');
      setNewCatName('');
      setIsAdding(false);
      await fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
        addToast('Esta categoría ya existe', 'error');
      } else {
        addToast('Error al crear categoría', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    const cleanName = editingName.trim();
    if (!cleanName) return;
    setLoading(true);
    try {
      await updateCategory(id, { nombre: cleanName }, businessId);
      addToast('Categoría actualizada', 'success');
      setEditingId(null);
      fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      if (err.code === '23505') {
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
      await deleteCategory(id, businessId);
      addToast('Categoría eliminada', 'info');
      fetchCategoriasLocally();
    } catch (err) {
      console.error(err);
      addToast('No se puede eliminar porque hay productos vinculados', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Obtener productos que pertenecen a una categoría (por ID relacional o por nombre)
  const getCategoryProducts = (cat) => {
    const catNameLower = (cat.nombre || '').trim().toLowerCase();
    return products.filter(p => {
      if (p.categoria_id && String(p.categoria_id) === String(cat.id)) return true;
      const pCat = (p.categoria || p.category || '').trim().toLowerCase();
      return catNameLower && pCat === catNameLower;
    });
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c => (c.nombre || '').toLowerCase().includes(q));
  }, [categories, searchQuery]);

  const availableSuggestions = useMemo(() => {
    const existingLower = new Set(categories.map(c => (c.nombre || '').trim().toLowerCase()));
    return SUGGESTED_CATEGORIES.filter(s => !existingLower.has(s.toLowerCase()));
  }, [categories]);

  return (
    <div className="space-y-4 pb-10 animate-fade-in-up font-sans">
      {/* Encabezado limpio y profesional */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Tag size={19} className="text-slate-700 shrink-0" />
              <span>Categorías del Menú</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Estructura tu carta y el comandero en secciones claras para tus clientes y meseros.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            isAdding
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              : 'bg-slate-900 hover:bg-black text-white shadow-2xs'
          }`}
        >
          {isAdding ? (
            <>
              <X size={15} />
              <span>Cerrar</span>
            </>
          ) : (
            <>
              <Plus size={15} />
              <span>Nueva categoría</span>
            </>
          )}
        </button>
      </div>

      <PremiumLock featureName="Gestión de Categorías Relacionales">
        <div className="space-y-4">
          {/* Panel de creación rápida */}
          {isAdding && (
            <form
              onSubmit={handleAdd}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-300 shadow-xs space-y-3.5 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Nombre de la nueva categoría
                </label>
                <span className="text-[11px] text-slate-500">Se mostrará en tienda y comandero</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  autoFocus
                  type="text"
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Ej: Hamburguesas, Carnes, Bebidas..."
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  required
                />
                <button
                  type="submit"
                  disabled={loading || !newCatName.trim()}
                  className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  {loading ? <LoadingSpinner size={15} /> : <><Check size={15} /> Crear categoría</>}
                </button>
              </div>

              {/* Sugerencias rápidas a 1 toque */}
              {availableSuggestions.length > 0 && (
                <div className="pt-1 space-y-1.5">
                  <span className="block text-[11px] font-semibold text-slate-500">
                    Sugerencias rápidas (toca para usar):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSuggestions.map(sug => (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => setNewCatName(sug)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          newCatName.trim().toLowerCase() === sug.toLowerCase()
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        + {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Buscador cuando hay más de 4 categorías */}
          {categories.length > 4 && (
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar categoría..."
                className="w-full pl-10 pr-9 py-2.5 bg-white rounded-xl border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-900 focus:outline-hidden focus:border-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}

          {/* Grilla de categorías */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredCategories.map(cat => {
              const catProducts = getCategoryProducts(cat);
              const count = catProducts.length;
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`bg-white rounded-2xl border p-4 transition-all flex flex-col justify-between gap-3 ${
                    isEditing
                      ? 'border-slate-900 ring-2 ring-slate-900/10 shadow-xs'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  {isEditing ? (
                    <div className="space-y-2.5">
                      <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Renombrar categoría
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          autoFocus
                          type="text"
                          value={editingName}
                          onChange={e => setEditingName(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleUpdate(cat.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                          className="flex-1 min-w-0 px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 focus:outline-hidden focus:border-slate-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdate(cat.id)}
                          className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-black text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          title="Guardar cambios"
                          aria-label="Guardar cambios"
                        >
                          <Save size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          title="Cancelar edición"
                          aria-label="Cancelar edición"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-700 flex items-center justify-center shrink-0">
                            <Tag size={17} />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate leading-tight">
                              {cat.nombre}
                            </h4>
                            <span className={`inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                              count > 0
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                                : 'bg-slate-50 text-slate-500 border-slate-200/80'
                            }`}>
                              <Package size={11} />
                              {count} {count === 1 ? 'producto' : 'productos'}
                            </span>
                          </div>
                        </div>

                        {/* Botones de acción claros y cómodos para móvil */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => { setEditingId(cat.id); setEditingName(cat.nombre); }}
                            className="w-8.5 h-8.5 rounded-xl border border-transparent hover:border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                            title="Renombrar categoría"
                            aria-label="Renombrar categoría"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemToDelete(cat)}
                            className="w-8.5 h-8.5 rounded-xl border border-transparent hover:border-rose-200 bg-rose-50/50 hover:bg-rose-100 text-rose-500 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
                            title="Eliminar categoría"
                            aria-label="Eliminar categoría"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Vista previa de platos en esta categoría */}
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        {count > 0 ? (
                          <p className="text-[11px] text-slate-500 truncate">
                            {catProducts.slice(0, 3).map(p => p.name || p.nombre).join(', ')}
                            {count > 3 ? ` +${count - 3} más` : ''}
                          </p>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Sin productos asignados aún
                          </span>
                        )}
                        <Link
                          to="/admin/productos"
                          className="text-[11px] font-bold text-slate-700 hover:text-slate-950 shrink-0 hover:underline"
                        >
                          Ver platos →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              );
            })}

            {!categories.length && !loading && !isAdding && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Tag size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">Aún no tienes categorías creadas</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Organiza tu menú en grupos como Hamburguesas, Carnes o Bebidas para facilitar la búsqueda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Crear primera categoría</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </PremiumLock>

      <ConfirmModal
        isOpen={!!itemToDelete}
        title="Eliminar Categoría"
        message={`¿Seguro que deseas eliminar "${itemToDelete?.nombre}"? Los productos asociados conservarán sus datos, pero quedarán sin esta categoría.`}
        onConfirm={() => {
          handleDelete(itemToDelete.id);
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
