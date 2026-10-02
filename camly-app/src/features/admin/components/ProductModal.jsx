import { useState, useRef } from 'react';
import { X, Save, Upload, Loader2, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import { uploadImage, createCategory } from '../../../lib/supabase';
import { useToastStore, useBusinessStore } from '../../../stores';

export default function ProductModal({ product, businessId, onSave, onClose }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const { categories, setCategories } = useBusinessStore();
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);
  const [formData, setFormData] = useState({
    id: product?.id || null,
    name: product?.name || '',
    price: product?.price || '',
    categoria_id: product?.categoria_id || '',
    categoria: product?.categoria || '',
    description: product?.description || '',
    image: product?.image || '',
    disponible: product?.disponible ?? true,
    negocio_id: businessId
  });

  const addToast = useToastStore(s => s.addToast);
  const fileInputRef = useRef(null);

  const handleQuickAddCat = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const newCat = await createCategory({ nombre: newCatName, negocio_id: businessId });
      setCategories([...categories, newCat].sort((a,b) => a.nombre.localeCompare(b.nombre)));
      setFormData(prev => ({ ...prev, categoria_id: newCat.id, categoria: newCat.nombre }));
      setIsAddingCat(false);
      setNewCatName('');
      addToast('Categoría creada', 'success');
    } catch (err) {
      console.error(err);
      addToast(err.code === '23505' ? 'Esta categoría ya existe' : 'Error al crear categoría', 'error');
    } finally {
      setSavingCat(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast('La imagen es muy pesada (máx 2MB)', 'error');
      return;
    }
    setUploading(true);
    try {
      const fileName = `${businessId}/${Date.now()}-${file.name}`;
      const url = await uploadImage(file, fileName);
      setFormData(prev => ({ ...prev, image: url }));
      addToast('Imagen subida correctamente', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error al subir imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = (e) => processFile(e.target.files?.[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      addToast('Nombre y precio son requeridos', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Error al guardar producto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative bg-white w-full max-w-lg rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] border border-border animate-fade-in-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {product?.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Completa los datos de tu producto en el menú
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="btn-ghost p-1.5 text-gray-400 hover:text-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Drag & Drop Image Zone */}
          <div 
            className={`relative rounded-lg border-2 border-dashed transition-colors overflow-hidden
              ${dragOver ? 'border-orange-500 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300'}
              ${formData.image ? 'border-solid border-border' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !formData.image && fileInputRef.current?.click()}
          >
            {formData.image ? (
              <div className="relative group">
                <img src={formData.image} className="w-full h-40 object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="p-2 bg-white rounded-lg text-gray-800 hover:bg-gray-100 transition-colors shadow"
                    title="Cambiar imagen"
                  >
                    <Upload size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: '' })); }}
                    className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors shadow"
                    title="Eliminar imagen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-8 px-4 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-orange-600 mb-2" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-gray-50 border border-border rounded-lg flex items-center justify-center mb-2 text-gray-400">
                      <ImageIcon size={18} />
                    </div>
                    <p className="text-xs font-medium text-gray-700">Arrastra una imagen o haz clic para subir</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG hasta 2MB</p>
                  </>
                )}
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre del producto *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Hamburguesa Artesanal Clásica"
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Precio ($) *</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0.00"
                className="input-field text-sm font-semibold tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Disponibilidad</label>
              <select 
                value={formData.disponible ? 'true' : 'false'}
                onChange={e => setFormData({...formData, disponible: e.target.value === 'true'})}
                className="input-field text-sm"
              >
                <option value="true">Disponible para pedir</option>
                <option value="false">Agotado temporalmente</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-gray-700">Categoría</label>
              {!isAddingCat && (
                <button 
                  type="button" 
                  onClick={() => setIsAddingCat(true)} 
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <Plus size={12} /> Nueva categoría
                </button>
              )}
            </div>
            
            {isAddingCat ? (
              <div className="flex items-center gap-2 p-2 bg-orange-50/50 rounded-lg border border-orange-200">
                <input 
                  autoFocus
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className="input-field text-xs flex-1"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddCat(e); } }}
                />
                <button 
                  type="button" 
                  onClick={handleQuickAddCat} 
                  disabled={savingCat} 
                  className="btn-primary py-1 px-3 text-xs"
                >
                  {savingCat ? <Loader2 size={12} className="animate-spin" /> : 'Crear'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingCat(false)} 
                  className="btn-ghost p-1 text-gray-400"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <select 
                value={formData.categoria_id || ''}
                onChange={e => {
                  const matchedCat = categories.find(c => c.id === e.target.value);
                  setFormData({
                    ...formData, 
                    categoria_id: e.target.value,
                    categoria: matchedCat ? matchedCat.nombre : ''
                  });
                }}
                className="input-field text-sm"
                required
              >
                <option value="" disabled>Selecciona una categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción e ingredientes</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Ej: 180g de carne de res, queso cheddar fundido, tocineta crujiente y salsa de la casa."
              className="input-field text-xs resize-none" 
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button 
              type="submit"
              disabled={loading || uploading}
              className="btn-primary py-2.5 px-4 text-xs font-semibold flex-1 justify-center disabled:opacity-50"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Guardar producto</>}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
