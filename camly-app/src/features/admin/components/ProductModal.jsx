import { useState, useRef, useEffect } from 'react';
import { 
  X, Save, Upload, Loader2, Image as ImageIcon, Plus, 
  Trash2, Layers, AlertCircle, RotateCcw, ChevronRight 
} from 'lucide-react';
import { uploadImage, createCategory } from '../../../lib/supabase';
import { useToastStore, useBusinessStore } from '../../../stores';
import ToppingsManagerModal from './ToppingsManagerModal';

const DRAFT_STORAGE_PREFIX = 'camly_product_draft_';

export default function ProductModal({ product, businessId, onSave, onClose }) {
  const isEditing = Boolean(product?.id);
  const draftKey = `${DRAFT_STORAGE_PREFIX}${businessId || 'default'}`;

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isToppingsModalOpen, setIsToppingsModalOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false);

  const { categories, setCategories } = useBusinessStore();
  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [savingCat, setSavingCat] = useState(false);

  const initialFormData = {
    id: product?.id || null,
    name: product?.name || '',
    price: product?.price || '',
    categoria_id: product?.categoria_id || '',
    categoria: product?.categoria || '',
    description: product?.description || '',
    image: product?.image || '',
    disponible: product?.disponible ?? true,
    negocio_id: businessId,
    opciones: Array.isArray(product?.opciones) ? product.opciones : []
  };

  const [formData, setFormData] = useState(initialFormData);
  const addToast = useToastStore(s => s.addToast);
  const fileInputRef = useRef(null);

  // 1. Recuperar borrador si es creación nueva
  useEffect(() => {
    if (!isEditing) {
      try {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (parsed && (parsed.name || parsed.price || parsed.description || parsed.image || (parsed.opciones && parsed.opciones.length > 0))) {
            setFormData(prev => ({
              ...prev,
              ...parsed,
              id: null,
              negocio_id: businessId
            }));
            setHasRestoredDraft(true);
          }
        }
      } catch (err) {
        console.warn('Error leyendo borrador:', err);
      }
    }
  }, [isEditing, draftKey, businessId]);

  // 2. Auto-guardar borrador al cambiar datos (solo en creación nueva)
  useEffect(() => {
    if (!isEditing) {
      const hasContent = Boolean(
        formData.name?.trim() || 
        formData.price || 
        formData.description?.trim() || 
        formData.image || 
        (formData.opciones && formData.opciones.length > 0)
      );

      if (hasContent) {
        try {
          localStorage.setItem(draftKey, JSON.stringify(formData));
        } catch (err) {
          console.warn('Error guardando borrador:', err);
        }
      }
    }
  }, [formData, isEditing, draftKey]);

  // Descartar borrador manualmente
  const handleClearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    setFormData({
      id: null,
      name: '',
      price: '',
      categoria_id: '',
      categoria: '',
      description: '',
      image: '',
      disponible: true,
      negocio_id: businessId,
      opciones: []
    });
    setHasRestoredDraft(false);
    addToast('Borrador descartado', 'info');
  };

  // Verificar si hay cambios no guardados al intentar salir
  const hasUnsavedChanges = () => {
    return Boolean(
      formData.name?.trim() || 
      formData.price || 
      formData.description?.trim() || 
      formData.image || 
      (formData.opciones && formData.opciones.length > 0)
    );
  };

  const handleRequestClose = () => {
    if (hasUnsavedChanges()) {
      setShowExitConfirm(true);
    } else {
      onClose();
    }
  };

  const handleQuickAddCat = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSavingCat(true);
    try {
      const newCat = await createCategory({ nombre: newCatName, negocio_id: businessId });
      setCategories(current => [
        ...current.filter(category => String(category.id) !== String(newCat.id)),
        newCat,
      ].sort((a, b) => a.nombre.localeCompare(b.nombre)));
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

    // Limpiar opciones sin nombre
    const cleanedOpciones = (formData.opciones || []).map(group => ({
      ...group,
      titulo: group.titulo.trim() || 'Opciones',
      opciones: (group.opciones || [])
        .filter(o => o.nombre && o.nombre.trim())
        .map(o => ({
          id: o.id,
          nombre: o.nombre.trim(),
          precio: Number(o.precio) || 0
        }))
    })).filter(group => group.opciones.length > 0);

    setLoading(true);
    try {
      await onSave({
        ...formData,
        price: Number(formData.price),
        opciones: cleanedOpciones
      });
      // Borrar borrador al guardar con éxito
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Contar toppings/opciones totales para resumen visual compacto
  const totalOptionsCount = (formData.opciones || []).reduce((acc, g) => acc + (g.opciones?.length || 0), 0);

  return (
    <>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={handleRequestClose}
        />

        <div className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in my-auto max-h-[92vh] flex flex-col border border-gray-200">
          
          {/* Header Compacto */}
          <div className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  {formData.id ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                {!isEditing && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Auto-guardado activo
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">Configura detalles, precio, foto y opciones</p>
            </div>
            <button 
              type="button" 
              onClick={handleRequestClose} 
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Cerrar ventana"
            >
              <X size={16} />
            </button>
          </div>

          {/* Banner de borrador recuperado */}
          {hasRestoredDraft && !isEditing && (
            <div className="px-4 py-2 bg-blue-50/90 border-b border-blue-100 flex items-center justify-between gap-2 text-[11px] text-blue-900 shrink-0">
              <span className="truncate">Recuperamos los datos que estabas editando previamente.</span>
              <button
                type="button"
                onClick={handleClearDraft}
                className="font-bold underline text-blue-700 hover:text-blue-900 shrink-0 cursor-pointer"
              >
                Empezar de cero
              </button>
            </div>
          )}

          {/* Scrollable Form Body Compacto */}
          <form onSubmit={handleSubmit} className="p-3.5 sm:p-4 space-y-3 overflow-y-auto flex-1 text-xs">
            
            {/* Fila compacta: Imagen en miniatura a la izquierda + Nombre y Categoría a la derecha */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Dropzone compacto */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !formData.image && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl transition-all w-full sm:w-28 sm:h-28 shrink-0 flex items-center justify-center cursor-pointer ${
                  dragOver ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'
                } ${formData.image ? 'p-1 bg-gray-50' : 'bg-[#FAFAF8] p-2'}`}
              >
                {formData.image ? (
                  <div className="relative w-full h-24 sm:h-full rounded-lg overflow-hidden group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 bg-white/90 rounded-md text-gray-900 hover:bg-white transition-colors cursor-pointer"
                        title="Cambiar imagen"
                      >
                        <Upload size={13} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: '' })); }}
                        className="p-1.5 bg-red-600 rounded-md text-white hover:bg-red-700 transition-colors cursor-pointer"
                        title="Eliminar imagen"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center">
                    {uploading ? (
                      <Loader2 size={18} className="animate-spin text-blue-600" />
                    ) : (
                      <>
                        <ImageIcon size={18} className="text-gray-400 mb-1" />
                        <span className="text-[10px] font-bold text-gray-600 leading-tight">Subir foto</span>
                        <span className="text-[9px] text-gray-400">Máx 2MB</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

              {/* Nombre y Categoría al lado */}
              <div className="flex-1 space-y-2">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-1">Nombre del producto *</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Hamburguesa Doble Queso"
                    className="input-field text-xs font-medium"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-gray-900">Categoría</label>
                    {!isAddingCat && (
                      <button 
                        type="button" 
                        onClick={() => setIsAddingCat(true)} 
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={11} /> Nueva
                      </button>
                    )}
                  </div>
                  
                  {isAddingCat ? (
                    <div className="flex items-center gap-1.5 p-1 bg-blue-50/50 rounded-lg border border-blue-200">
                      <input 
                        autoFocus
                        type="text" 
                        value={newCatName}
                        onChange={e => setNewCatName(e.target.value)}
                        placeholder="Nombre de categoría"
                        className="input-field text-xs flex-1 py-1"
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddCat(e); } }}
                      />
                      <button 
                        type="button" 
                        onClick={handleQuickAddCat} 
                        disabled={savingCat} 
                        className="btn-primary py-1 px-2.5 text-xs shrink-0 cursor-pointer"
                      >
                        {savingCat ? <Loader2 size={11} className="animate-spin" /> : 'Crear'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setIsAddingCat(false)} 
                        className="btn-ghost p-1 text-gray-400 shrink-0 cursor-pointer"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <select 
                      value={formData.categoria_id || ''}
                      onChange={e => {
                        const matchedCat = categories.find(c => String(c.id) === String(e.target.value));
                        setFormData({
                          ...formData, 
                          categoria_id: matchedCat ? matchedCat.id : e.target.value,
                          categoria: matchedCat ? matchedCat.nombre : ''
                        });
                      }}
                      className="input-field text-xs cursor-pointer"
                      required
                    >
                      <option value="" disabled>Selecciona una categoría</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Precio y Disponibilidad en fila compacta */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">Precio base ($) *</label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="0"
                  className="input-field text-xs font-semibold tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 mb-1">Disponibilidad</label>
                <select 
                  value={formData.disponible ? 'true' : 'false'}
                  onChange={e => setFormData({...formData, disponible: e.target.value === 'true'})}
                  className="input-field text-xs font-medium cursor-pointer"
                >
                  <option value="true">🟢 Disponible para pedir</option>
                  <option value="false">🔴 Agotado temporalmente</option>
                </select>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">Descripción e ingredientes</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Ej: Carne 150g, queso cheddar fundido, tocineta y salsa de la casa."
                className="input-field text-xs resize-none" 
                rows={2}
              />
            </div>

            {/* ══════════ SECCIÓN: OPCIONES Y MODIFICADORES ══════════ */}
            <div className="p-3 rounded-xl bg-gray-100 border border-gray-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-300 text-gray-950 flex items-center justify-center shrink-0">
                  <Layers size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-950 truncate">Opciones y Modificadores</p>
                  <p className="text-xs text-gray-700 font-medium truncate">
                    {formData.opciones?.length > 0 
                      ? `${formData.opciones.length} grupo(s) · ${totalOptionsCount} opción(es) configuradas`
                      : 'Sabores, tamaños, salsas o adicionales'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsToppingsModalOpen(true)}
                className="h-8 px-3 text-xs font-bold rounded-lg bg-white border border-gray-300 hover:border-black text-gray-950 hover:bg-gray-50 flex items-center gap-1 shrink-0 transition-colors cursor-pointer shadow-2xs"
              >
                <span>{formData.opciones?.length > 0 ? 'Configurar opciones' : '+ Agregar opciones'}</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Botones de acción del formulario */}
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <button 
                type="submit"
                disabled={loading || uploading}
                className="btn-primary py-2 px-4 text-xs font-bold flex-1 justify-center disabled:opacity-50 cursor-pointer shadow-glow-blue"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Save size={14} />
                    <span>Guardar producto</span>
                  </>
                )}
              </button>
              <button 
                type="button"
                onClick={handleRequestClose} 
                className="btn-secondary py-2 px-3 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>

          </form>
        </div>
      </div>

      {/* Modal Independiente de Toppings */}
      <ToppingsManagerModal
        isOpen={isToppingsModalOpen}
        onClose={() => setIsToppingsModalOpen(false)}
        opciones={formData.opciones || []}
        businessId={businessId}
        onSave={(newOpciones) => {
          setFormData(prev => ({ ...prev, opciones: newOpciones }));
          addToast('Toppings y opciones actualizados', 'success');
        }}
      />

      {/* Modal de confirmación al salir con cambios sin guardar */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setShowExitConfirm(false)}
          />
          <div className="relative bg-white max-w-sm w-full rounded-2xl p-5 shadow-2xl border border-gray-200 z-10 animate-scale-in text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertCircle size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">¿Deseas salir del formulario?</h3>
              <p className="text-xs text-gray-500 mt-1">
                {!isEditing 
                  ? 'Tu borrador se ha guardado automáticamente en tu navegador. Podrás retomarlo cuando vuelvas a abrir el formulario.'
                  : 'Los cambios no guardados se perderán si sales ahora.'}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="btn-secondary flex-1 py-2 text-xs font-semibold cursor-pointer"
              >
                Continuar editando
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
                className="btn-primary flex-1 py-2 text-xs font-semibold bg-gray-900 hover:bg-black cursor-pointer text-white"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
