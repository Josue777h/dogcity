import { useState, useRef } from 'react';
import { X, Save, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { uploadImage } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';

export default function ProductModal({ product, products = [], businessId, onSave, onClose }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCategorySugg, setShowCategorySugg] = useState(false);
  
  const existingCategories = Array.from(new Set(products.map(p => p.categoria).filter(Boolean)));
  const [formData, setFormData] = useState({
    id: product?.id || null,
    name: product?.name || '',
    price: product?.price || '',
    categoria: product?.categoria || '',
    description: product?.description || '',
    image: product?.image || '',
    disponible: product?.disponible ?? true,
    negocio_id: businessId
  });

  const filteredCategories = existingCategories.filter(c => 
    c.toLowerCase().includes((formData.categoria || '').toLowerCase()) && 
    c !== formData.categoria
  );

  const fileInputRef = useRef(null);
  const addToast = useToastStore(s => s.addToast);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('La imagen es muy pesada (max 2MB)', 'error');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      addToast('Nombre y Precio son requeridos', 'error');
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
      <div className="absolute inset-0 bg-dark/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-200">
        <div className="bg-brand p-6 sm:p-8 text-white relative shrink-0">
          <h3 className="text-2xl font-black italic tracking-tighter uppercase">
            {product?.id ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <p className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Completa los detalles para actualizar el catálogo
          </p>
          <button onClick={onClose} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
          {/* Image Upload Area */}
          <div className="flex gap-6 items-start">
            <div 
              className={`w-32 h-32 rounded-3xl bg-bg-alt border-2 border-dashed border-border overflow-hidden flex flex-col items-center justify-center group relative cursor-pointer
                ${uploading ? 'opacity-50' : 'hover:border-brand/40'}`}
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.image ? (
                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <>
                  <ImageIcon size={24} className="text-muted group-hover:text-brand transition-colors" />
                  <span className="text-[10px] font-black text-muted mt-2 uppercase">Subir Foto</span>
                </>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-dark/20 text-white">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">Nombre del Producto</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ej: Hamburguesa Especial"
                  className="w-full p-3 bg-bg-alt border border-border rounded-xl font-bold text-sm outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-muted uppercase tracking-widest">Precio</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  className="w-full p-3 bg-brand/5 border border-brand/20 rounded-xl font-black text-brand text-sm outline-none focus:bg-brand/10"
                />
              </div>
            </div>
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest">Categoría</label>
              <input 
                type="text" 
                value={formData.categoria}
                onFocus={() => setShowCategorySugg(true)}
                onBlur={() => setTimeout(() => setShowCategorySugg(false), 200)}
                onChange={e => {
                  setFormData({...formData, categoria: e.target.value});
                  setShowCategorySugg(true);
                }}
                placeholder="Ej: Snacks, Bebidas..."
                className="w-full p-3 bg-bg-alt border border-border rounded-xl font-bold text-sm outline-none focus:border-brand"
              />
              {showCategorySugg && filteredCategories.length > 0 && (
                <div className="absolute top-[100%] left-0 w-full mt-1 bg-white border border-border rounded-xl shadow-xl z-[100] max-h-40 overflow-y-auto scrollbar-thin">
                  {filteredCategories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onMouseDown={(e) => { 
                        e.preventDefault(); 
                        setFormData({...formData, categoria: cat}); 
                        setShowCategorySugg(false); 
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-dark hover:bg-bg-alt hover:text-brand transition-colors border-b last:border-0 border-border/50"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest">Disponibilidad</label>
              <select 
                value={formData.disponible ? 'true' : 'false'}
                onChange={e => setFormData({...formData, disponible: e.target.value === 'true'})}
                className="w-full p-3 bg-bg-alt border border-border rounded-xl font-bold text-sm outline-none focus:border-brand"
              >
                <option value="true">Disponible</option>
                <option value="false">Agotado</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-muted uppercase tracking-widest">Descripción (Opcional)</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Ingredientes, detalles importantes..."
              className="w-full p-3 bg-bg-alt border border-border rounded-xl font-medium text-xs outline-none focus:border-brand min-h-[80px]"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button 
              type="submit"
              disabled={loading || uploading}
              className="flex-1 btn-primary !py-4 shadow-xl shadow-brand/20 disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> GUARDAR PRODUCTO</>}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="px-6 border-2 border-border text-muted rounded-xl hover:bg-bg-alt transition-colors font-black text-xs"
            >
              CANCELAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
