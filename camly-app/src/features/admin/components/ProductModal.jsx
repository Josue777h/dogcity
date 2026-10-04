import { useState, useRef } from 'react';
import { X, Save, Upload, Loader2, Image as ImageIcon, Plus, Trash2, Layers, CheckSquare, CircleDot, Sparkles } from 'lucide-react';
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
    negocio_id: businessId,
    opciones: Array.isArray(product?.opciones) ? product.opciones : []
  });

  const addToast = useToastStore(s => s.addToast);
  const fileInputRef = useRef(null);

  // ── Handlers de Grupos de Opciones / Toppings ──
  const handleAddOptionGroup = () => {
    const newGroup = {
      id: `g_${Date.now()}`,
      titulo: 'Elige tu opción',
      tipo: 'unica', // 'unica' (radio/sabor) o 'multiple' (checkbox/toppings)
      requerido: false,
      opciones: [
        { id: `opt_${Date.now()}_1`, nombre: 'Opción 1', precio: 0 }
      ]
    };
    setFormData(prev => ({ ...prev, opciones: [...prev.opciones, newGroup] }));
  };

  const handleRemoveOptionGroup = (groupId) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.filter(g => g.id !== groupId)
    }));
  };

  const handleUpdateGroup = (groupId, field, value) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.map(g => g.id === groupId ? { ...g, [field]: value } : g)
    }));
  };

  const handleAddOptionItem = (groupId) => {
    const newItem = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nombre: '',
      precio: 0
    };
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, opciones: [...g.opciones, newItem] };
      })
    }));
  };

  const handleRemoveOptionItem = (groupId, optionId) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, opciones: g.opciones.filter(o => o.id !== optionId) };
      })
    }));
  };

  const handleUpdateOptionItem = (groupId, optionId, field, value) => {
    setFormData(prev => ({
      ...prev,
      opciones: prev.opciones.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          opciones: g.opciones.map(o => o.id === optionId ? { ...o, [field]: value } : o)
        };
      })
    }));
  };

  const handleApplyPreset = (presetType) => {
    if (presetType === 'heladeria') {
      const presetGroups = [
        {
          id: `g_${Date.now()}_1`,
          titulo: 'Elige tu sabor de helado',
          tipo: 'unica',
          requerido: true,
          opciones: [
            { id: `opt_1`, nombre: 'Vainilla Francesa', precio: 0 },
            { id: `opt_2`, nombre: 'Chocolate Belga', precio: 0 },
            { id: `opt_3`, nombre: 'Arequipe con Veteado', precio: 0 },
            { id: `opt_4`, nombre: 'Fresa Silvestre', precio: 0 }
          ]
        },
        {
          id: `g_${Date.now()}_2`,
          titulo: 'Toppings y Salsas adicionales',
          tipo: 'multiple',
          requerido: false,
          opciones: [
            { id: `opt_5`, nombre: 'Salsa de Chocolate caliente', precio: 1500 },
            { id: `opt_6`, nombre: 'Brownie en trozos', precio: 2500 },
            { id: `opt_7`, nombre: 'Maní triturado crocante', precio: 1000 },
            { id: `opt_8`, nombre: 'Gomitas dulces', precio: 1200 }
          ]
        }
      ];
      setFormData(prev => ({ ...prev, opciones: [...prev.opciones, ...presetGroups] }));
      addToast('Plantilla de heladería aplicada', 'success');
    } else if (presetType === 'restaurante') {
      const presetGroups = [
        {
          id: `g_${Date.now()}_1`,
          titulo: 'Término de la carne',
          tipo: 'unica',
          requerido: true,
          opciones: [
            { id: `opt_1`, nombre: 'Término Medio', precio: 0 },
            { id: `opt_2`, nombre: 'Tres Cuartos', precio: 0 },
            { id: `opt_3`, nombre: 'Bien Cocido', precio: 0 }
          ]
        },
        {
          id: `g_${Date.now()}_2`,
          titulo: 'Adicionales de la casa',
          tipo: 'multiple',
          requerido: false,
          opciones: [
            { id: `opt_4`, nombre: 'Tocineta ahumada extra', precio: 3500 },
            { id: `opt_5`, nombre: 'Queso cheddar fundido extra', precio: 2500 },
            { id: `opt_6`, nombre: 'Papas a la francesa pequeñas', precio: 4000 }
          ]
        }
      ];
      setFormData(prev => ({ ...prev, opciones: [...prev.opciones, ...presetGroups] }));
      addToast('Plantilla de restaurante aplicada', 'success');
    }
  };

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
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in my-auto max-h-[92vh] flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
              {formData.id ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Configura detalles, precio, foto y opciones</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* Imagen Dropzone */}
          <div 
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !formData.image && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl transition-all ${
              dragOver ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'
            } ${formData.image ? 'p-1 bg-gray-50' : 'bg-[#FAFAF8]'}`}
          >
            {formData.image ? (
              <div className="relative h-40 sm:h-48 w-full rounded-xl overflow-hidden group">
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/90 rounded-lg text-gray-900 hover:bg-white transition-colors shadow-xs"
                    title="Cambiar imagen"
                  >
                    <Upload size={16} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, image: '' })); }}
                    className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors shadow-xs"
                    title="Eliminar imagen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center py-7 px-4 cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? (
                  <Loader2 size={24} className="animate-spin text-blue-600 mb-2" />
                ) : (
                  <>
                    <div className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center mb-2 text-gray-400 shadow-2xs">
                      <ImageIcon size={18} />
                    </div>
                    <p className="text-xs font-semibold text-gray-700">Arrastra una imagen o haz clic para subir</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG hasta 2MB</p>
                  </>
                )}
              </div>
            )}
          </div>

          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

          {/* Nombre y Precio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-900 mb-1">Nombre del producto *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Helado Especial 2 Bolas o Hamburguesa Doble"
                className="input-field text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">Precio base ($) *</label>
              <input 
                type="number" 
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="0"
                className="input-field text-sm font-semibold tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1">Disponibilidad</label>
              <select 
                value={formData.disponible ? 'true' : 'false'}
                onChange={e => setFormData({...formData, disponible: e.target.value === 'true'})}
                className="input-field text-sm font-medium"
              >
                <option value="true">Disponible para pedir</option>
                <option value="false">Agotado temporalmente</option>
              </select>
            </div>
          </div>

          {/* Categoría */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-gray-900">Categoría</label>
              {!isAddingCat && (
                <button 
                  type="button" 
                  onClick={() => setIsAddingCat(true)} 
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={12} /> Nueva categoría
                </button>
              )}
            </div>
            
            {isAddingCat ? (
              <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-xl border border-blue-200">
                <input 
                  autoFocus
                  type="text" 
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className="input-field text-xs flex-1 min-w-0"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleQuickAddCat(e); } }}
                />
                <button 
                  type="button" 
                  onClick={handleQuickAddCat} 
                  disabled={savingCat} 
                  className="btn-primary py-1.5 px-3 text-xs shrink-0"
                >
                  {savingCat ? <Loader2 size={12} className="animate-spin" /> : 'Crear'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsAddingCat(false)} 
                  className="btn-ghost p-1.5 text-gray-400 shrink-0"
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

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1">Descripción e ingredientes</label>
            <textarea 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              placeholder="Ej: Acompañado de barquillo artesanal y doble porción de sabor a tu elección."
              className="input-field text-xs resize-none" 
              rows={2}
            />
          </div>

          {/* ══════════ SECCIÓN: SABORES, TOPPINGS Y ADICIONALES ══════════ */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Layers size={15} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-gray-900">Sabores, Toppings y Adicionales</h3>
                </div>
                <p className="text-[11px] text-gray-500">
                  Configura elecciones de sabor (sin costo) o toppings/adicionales con valor extra.
                </p>
              </div>

              {/* Botón para agregar nuevo grupo */}
              <button
                type="button"
                onClick={handleAddOptionGroup}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
              >
                <Plus size={13} />
                <span>Agregar grupo</span>
              </button>
            </div>

            {/* Plantillas rápidas */}
            {(!formData.opciones || formData.opciones.length === 0) && (
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 mb-3 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                  <Sparkles size={14} className="text-amber-600" />
                  <span>¿Quieres agregar opciones rápido? Usa una plantilla:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('heladeria')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-medium hover:bg-amber-100/50 transition cursor-pointer"
                  >
                    🍦 Heladería (Sabores + Toppings)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('restaurante')}
                    className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-[11px] font-medium hover:bg-amber-100/50 transition cursor-pointer"
                  >
                    🍔 Restaurante (Término + Adicionales)
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Grupos */}
            <div className="space-y-3">
              {formData.opciones?.map((group, gIdx) => (
                <div 
                  key={group.id} 
                  className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={group.titulo}
                        onChange={(e) => handleUpdateGroup(group.id, 'titulo', e.target.value)}
                        placeholder="Ej: Elige tu sabor de helado o Toppings"
                        className="w-full text-xs font-bold text-gray-900 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOptionGroup(group.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar grupo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Configuración de tipo de selección */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-gray-200">
                      <select
                        value={group.tipo}
                        onChange={(e) => handleUpdateGroup(group.id, 'tipo', e.target.value)}
                        className="w-full text-[11px] font-semibold text-gray-700 bg-transparent focus:outline-none"
                      >
                        <option value="unica">🔘 Selección única (1 sola opción / Sabores)</option>
                        <option value="multiple">☑️ Selección múltiple (Varios / Toppings)</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-gray-200 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!group.requerido}
                        onChange={(e) => handleUpdateGroup(group.id, 'requerido', e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded"
                      />
                      <span className="font-semibold text-gray-700">Obligatorio elegir</span>
                    </label>
                  </div>

                  {/* Lista de opciones individuales dentro del grupo */}
                  <div className="space-y-1.5 pl-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Opciones disponibles:
                    </p>
                    {group.opciones?.map((opt) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <span className="text-gray-300">
                          {group.tipo === 'unica' ? <CircleDot size={13} /> : <CheckSquare size={13} />}
                        </span>
                        <input
                          type="text"
                          value={opt.nombre}
                          onChange={(e) => handleUpdateOptionItem(group.id, opt.id, 'nombre', e.target.value)}
                          placeholder="Nombre (ej. Vainilla, Chocolate, Tocineta)"
                          className="flex-1 text-xs bg-white px-2.5 py-1 rounded-lg border border-gray-200 focus:outline-none focus:border-blue-500"
                        />
                        <div className="flex items-center gap-1 w-28 bg-white px-2 py-1 rounded-lg border border-gray-200">
                          <span className="text-gray-400 text-[11px] font-semibold">+$</span>
                          <input
                            type="number"
                            min="0"
                            step="500"
                            value={opt.precio === 0 ? '' : opt.precio}
                            onChange={(e) => handleUpdateOptionItem(group.id, opt.id, 'precio', Number(e.target.value) || 0)}
                            placeholder="0"
                            className="w-full text-xs font-semibold tabular-nums text-gray-800 bg-transparent focus:outline-none"
                            title="Precio adicional (deja en 0 si está incluido)"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveOptionItem(group.id, opt.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          title="Quitar opción"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleAddOptionItem(group.id)}
                      className="mt-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 p-1"
                    >
                      <Plus size={12} /> Agregar otra opción
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <button 
              type="submit"
              disabled={loading || uploading}
              className="btn-primary py-2.5 px-4 text-xs font-bold flex-1 justify-center disabled:opacity-50 cursor-pointer shadow-glow-blue"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  <Save size={15} />
                  <span>Guardar producto</span>
                </>
              )}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="btn-secondary py-2.5 px-4 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
