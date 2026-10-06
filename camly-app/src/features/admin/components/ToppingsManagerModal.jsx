import { useState, useMemo } from 'react';
import { X, Plus, Trash2, Bookmark, Check, Layers } from 'lucide-react';
import { useBusinessStore, useToastStore } from '../../../stores';

const OPTIONS_LIBRARY_STORAGE_PREFIX = 'camly_options_lib_';

export default function ToppingsManagerModal({ isOpen, onClose, opciones = [], onSave, businessId }) {
  const [localGroups, setLocalGroups] = useState(opciones);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'biblioteca'
  const [savedGroupIds, setSavedGroupIds] = useState({}); // { [groupId]: true } for inline feedback
  
  const { products, business } = useBusinessStore();
  const addToast = useToastStore(s => s.addToast);
  
  const activeBizId = businessId || business?.id || 'default';
  const libStorageKey = `${OPTIONS_LIBRARY_STORAGE_PREFIX}${activeBizId}`;

  // Cargar biblioteca guardada
  const [savedLibrary, setSavedLibrary] = useState(() => {
    try {
      const data = localStorage.getItem(libStorageKey) || localStorage.getItem(`camly_toppings_lib_${activeBizId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  // Opciones detectadas en otros productos del negocio
  const existingProductGroups = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];
    const map = new Map();
    products.forEach(p => {
      if (Array.isArray(p.opciones)) {
        p.opciones.forEach(g => {
          if (g.titulo && g.opciones && g.opciones.length > 0) {
            const key = `${g.titulo.trim().toLowerCase()}_${g.tipo}`;
            if (!map.has(key)) {
              map.set(key, { ...g, fromProduct: p.name });
            }
          }
        });
      }
    });
    return Array.from(map.values());
  }, [products]);

  // Lista combinada de biblioteca
  const allLibraryItems = useMemo(() => {
    const items = [...savedLibrary];
    const existingTitles = new Set(items.map(i => i.titulo.trim().toLowerCase()));
    
    existingProductGroups.forEach(eg => {
      if (!existingTitles.has(eg.titulo.trim().toLowerCase())) {
        items.push({
          ...eg,
          id: `prod_${eg.titulo.toLowerCase().replace(/\s+/g, '_')}`,
          isFromProduct: true
        });
      }
    });
    return items;
  }, [savedLibrary, existingProductGroups]);

  if (!isOpen) return null;

  // Guardar un grupo específico a la biblioteca
  const handleSaveSingleGroupToLibrary = (group) => {
    if (!group.titulo?.trim()) {
      addToast('Escribe un nombre para este grupo antes de guardarlo', 'warning');
      return;
    }
    const validOptions = (group.opciones || []).filter(o => o.nombre && o.nombre.trim());
    if (validOptions.length === 0) {
      addToast('Agrega al menos una opción con nombre en este grupo', 'warning');
      return;
    }

    try {
      const existingIndex = savedLibrary.findIndex(
        item => item.titulo.trim().toLowerCase() === group.titulo.trim().toLowerCase()
      );

      const groupDataToSave = {
        ...group,
        id: `lib_${Date.now()}`,
        titulo: group.titulo.trim(),
        opciones: validOptions.map(o => ({
          id: o.id || `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          nombre: o.nombre.trim(),
          precio: Number(o.precio) || 0
        }))
      };

      let updatedLib;
      if (existingIndex >= 0) {
        updatedLib = [...savedLibrary];
        updatedLib[existingIndex] = groupDataToSave;
      } else {
        updatedLib = [groupDataToSave, ...savedLibrary];
      }

      setSavedLibrary(updatedLib);
      localStorage.setItem(libStorageKey, JSON.stringify(updatedLib));

      // Feedback visual inline directo en el botón
      setSavedGroupIds(prev => ({ ...prev, [group.id]: true }));
      setTimeout(() => {
        setSavedGroupIds(prev => ({ ...prev, [group.id]: false }));
      }, 2000);

      addToast(`"${group.titulo}" guardado en biblioteca`, 'success');
    } catch (err) {
      console.error(err);
      addToast('Error al guardar en biblioteca', 'error');
    }
  };

  // Eliminar de la biblioteca
  const handleDeleteFromLibrary = (libId) => {
    const updated = savedLibrary.filter(item => item.id !== libId);
    setSavedLibrary(updated);
    try {
      localStorage.setItem(libStorageKey, JSON.stringify(updated));
      addToast('Opción eliminada de la biblioteca', 'info');
    } catch {}
  };

  // Usar desde la biblioteca
  const handleUseFromLibrary = (item) => {
    const newGroup = {
      id: `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      titulo: item.titulo,
      tipo: item.tipo || 'unica',
      requerido: Boolean(item.requerido),
      opciones: (item.opciones || []).map(o => ({
        id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        nombre: o.nombre,
        precio: Number(o.precio) || 0
      }))
    };

    setLocalGroups(prev => [...prev, newGroup]);
    setActiveTab('editor');
    addToast(`"${item.titulo}" añadido al producto`, 'success');
  };

  const handleAddGroup = () => {
    const newGroup = {
      id: `g_${Date.now()}`,
      titulo: '',
      tipo: 'unica',
      requerido: false,
      opciones: [
        { id: `opt_${Date.now()}_1`, nombre: '', precio: 0 }
      ]
    };
    setLocalGroups(prev => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId) => {
    setLocalGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleUpdateGroup = (groupId, field, value) => {
    setLocalGroups(prev => prev.map(g => g.id === groupId ? { ...g, [field]: value } : g));
  };

  const handleAddItem = (groupId) => {
    const newItem = {
      id: `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nombre: '',
      precio: 0
    };
    setLocalGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, opciones: [...(g.opciones || []), newItem] };
    }));
  };

  const handleRemoveItem = (groupId, optionId) => {
    setLocalGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return { ...g, opciones: (g.opciones || []).filter(o => o.id !== optionId) };
    }));
  };

  const handleUpdateItem = (groupId, optionId, field, value) => {
    setLocalGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        opciones: (g.opciones || []).map(o => o.id === optionId ? { ...o, [field]: value } : o)
      };
    }));
  };

  const handleConfirm = () => {
    const cleaned = localGroups
      .map(g => ({
        ...g,
        titulo: g.titulo?.trim() || 'Opciones',
        opciones: (g.opciones || []).filter(o => o.nombre && o.nombre.trim())
      }))
      .filter(g => g.opciones.length > 0);

    onSave(cleaned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[180] flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Fondo oscuro */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      {/* Contenedor principal de alto contraste */}
      <div className="relative bg-white w-full max-w-xl rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in my-auto max-h-[92vh] flex flex-col border border-gray-300">
        
        {/* Cabecera nítida */}
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-gray-950 leading-tight">
              Opciones y Adicionales del Producto
            </h3>
            <p className="text-xs text-gray-700 font-medium mt-0.5">
              Configura sabores, tamaños, salsas o adicionales que el cliente podrá elegir
            </p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-700 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas de alto contraste */}
        <div className="flex border-b border-gray-300 bg-gray-100 px-4 shrink-0 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`py-2 px-3.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-t border-x ${
              activeTab === 'editor'
                ? 'bg-white text-gray-950 border-gray-300 -mb-px shadow-2xs'
                : 'bg-transparent text-gray-700 border-transparent hover:text-gray-950 hover:bg-gray-200/60'
            }`}
          >
            Opciones del producto ({localGroups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('biblioteca')}
            className={`py-2 px-3.5 text-xs font-bold rounded-t-lg transition-all cursor-pointer border-t border-x flex items-center gap-1.5 ${
              activeTab === 'biblioteca'
                ? 'bg-white text-gray-950 border-gray-300 -mb-px shadow-2xs'
                : 'bg-transparent text-gray-700 border-transparent hover:text-gray-950 hover:bg-gray-200/60'
            }`}
          >
            <span>Biblioteca guardada</span>
            {allLibraryItems.length > 0 && (
              <span className="text-[11px] bg-gray-900 text-white font-bold px-1.5 py-0.2 rounded-md">
                {allLibraryItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Contenido */}
        {activeTab === 'editor' ? (
          <div className="p-3.5 sm:p-4 space-y-3.5 overflow-y-auto flex-1 font-sans bg-gray-50/50">
            
            {/* Barra superior de acción rápida */}
            <div className="flex items-center justify-between gap-2 pb-0.5">
              <button
                type="button"
                onClick={handleAddGroup}
                className="h-8.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs active:scale-98"
              >
                <Plus size={15} strokeWidth={2.5} />
                <span>+ Agregar grupo de opciones</span>
              </button>

              {allLibraryItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('biblioteca')}
                  className="text-xs text-blue-700 hover:text-blue-900 font-bold underline underline-offset-2 cursor-pointer"
                >
                  Ver biblioteca ({allLibraryItems.length})
                </button>
              )}
            </div>

            {/* Estado Vacío Claro */}
            {localGroups.length === 0 && (
              <div className="py-10 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-5 space-y-2">
                <p className="text-sm font-bold text-gray-900">No hay opciones agregadas a este producto</p>
                <p className="text-xs text-gray-700 max-w-md mx-auto">
                  Pulsa el botón <strong>"+ Agregar grupo de opciones"</strong> para crear grupos como "Sabor de helado", "Tamaño" o "Adicionales".
                </p>
              </div>
            )}

            {/* Lista de Grupos de Opciones */}
            <div className="space-y-3.5">
              {localGroups.map((group, gIdx) => {
                const isSaved = Boolean(savedGroupIds[group.id]);

                return (
                  <div 
                    key={group.id} 
                    className="p-3.5 rounded-xl bg-white border-2 border-gray-200 shadow-xs space-y-3"
                  >
                    {/* Fila 1: Título del grupo y Acciones directas */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <label className="block text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">
                          Título del grupo #{gIdx + 1}
                        </label>
                        <input
                          type="text"
                          value={group.titulo}
                          onChange={(e) => handleUpdateGroup(group.id, 'titulo', e.target.value)}
                          placeholder="Ej: Sabor de helado, Tamaño, Tipo de salsa..."
                          className="w-full text-xs sm:text-sm font-bold text-gray-950 bg-gray-50 focus:bg-white px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600 placeholder:text-gray-400 placeholder:font-normal"
                        />
                      </div>

                      {/* Botón Guardar en Biblioteca & Eliminar Grupo */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end">
                        <button
                          type="button"
                          onClick={() => handleSaveSingleGroupToLibrary(group)}
                          className={`h-8 px-2.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                            isSaved 
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs' 
                              : 'bg-white border-gray-300 text-gray-800 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                          title="Guardar este grupo en la biblioteca para reutilizarlo"
                        >
                          {isSaved ? <Check size={13} strokeWidth={3} /> : <Bookmark size={13} />}
                          <span>{isSaved ? 'Guardado' : 'Guardar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(group.id)}
                          className="w-8 h-8 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar este grupo de opciones"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Fila 2: Controles Rápidos Claros (Única / Múltiple + Obligatorio) */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-gray-100">
                      
                      {/* Segmented Control con Azul de la Marca */}
                      <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg border border-gray-300">
                        <button
                          type="button"
                          onClick={() => handleUpdateGroup(group.id, 'tipo', 'unica')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            group.tipo === 'unica'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-800 hover:text-black hover:bg-gray-300/60'
                          }`}
                        >
                          ● Única (Elige 1 sola)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateGroup(group.id, 'tipo', 'multiple')}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            group.tipo === 'multiple'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-gray-800 hover:text-black hover:bg-gray-300/60'
                          }`}
                        >
                          ■ Múltiple (Elige varias)
                        </button>
                      </div>

                      {/* Checkbox Obligatorio Nítido */}
                      <label className="flex items-center gap-2 text-xs text-gray-900 font-bold cursor-pointer select-none bg-gray-50 hover:bg-gray-100 px-2.5 py-1 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={Boolean(group.requerido)}
                          onChange={(e) => handleUpdateGroup(group.id, 'requerido', e.target.checked)}
                          className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                        />
                        <span>Obligatorio</span>
                      </label>
                    </div>

                    {/* Fila 3: Opciones Individuales Nítidas */}
                    <div className="space-y-2 pt-1">
                      <div className="grid grid-cols-12 gap-2 px-1 text-xs font-bold text-gray-800">
                        <div className="col-span-7">Nombre de la opción</div>
                        <div className="col-span-4 text-right pr-2">Precio adicional</div>
                        <div className="col-span-1"></div>
                      </div>

                      {(group.opciones || []).map((opt) => (
                        <div key={opt.id} className="grid grid-cols-12 gap-2 items-center">
                          {/* Input del Nombre */}
                          <div className="col-span-7">
                            <input
                              type="text"
                              value={opt.nombre}
                              onChange={(e) => handleUpdateItem(group.id, opt.id, 'nombre', e.target.value)}
                              placeholder="Ej: Chocolate, Vainilla, Queso extra..."
                              className="w-full text-xs sm:text-sm font-medium text-gray-950 bg-white px-2.5 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-600 placeholder:text-gray-400"
                            />
                          </div>

                          {/* Input de Precio limpio (sin palabra Gratis) */}
                          <div className="col-span-4 flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-gray-300 focus-within:border-blue-600">
                            <span className="text-xs text-gray-500 font-bold shrink-0">+$</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={opt.precio === 0 ? '' : opt.precio}
                              onChange={(e) => handleUpdateItem(group.id, opt.id, 'precio', Number(e.target.value) || 0)}
                              placeholder="0"
                              className="w-full text-xs sm:text-sm font-bold tabular-nums text-gray-950 bg-transparent focus:outline-none text-right placeholder:text-gray-400"
                            />
                          </div>

                          {/* Botón Eliminar opción */}
                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(group.id, opt.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-gray-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                              title="Eliminar opción"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Botón para añadir otra opción a la lista */}
                      <button
                        type="button"
                        onClick={() => handleAddItem(group.id)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 pt-1.5 cursor-pointer select-none"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                        <span>+ Agregar otra opción a este grupo</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* Pestaña: Biblioteca */
          <div className="p-3.5 sm:p-4 space-y-3.5 overflow-y-auto flex-1 font-sans bg-gray-50/50">
            
            {allLibraryItems.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-white p-5 space-y-2">
                <Layers size={26} className="mx-auto text-gray-600 mb-1" />
                <p className="text-sm font-bold text-gray-900">Tu biblioteca está vacía</p>
                <p className="text-xs text-gray-700 max-w-sm mx-auto">
                  Cuando crees un grupo de opciones en la pestaña principal, pulsa <strong>"Guardar"</strong> para tenerlo siempre disponible aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs font-bold text-gray-800">
                  Opciones guardadas disponibles para reutilizar:
                </p>

                {allLibraryItems.map((item) => (
                  <div 
                    key={item.id}
                    className="p-3 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-between gap-3 hover:border-blue-300 transition-colors shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-gray-950 truncate">
                          {item.titulo}
                        </span>
                        <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200">
                          {item.tipo === 'unica' ? 'Única' : 'Múltiple'}
                        </span>
                        {item.requerido && (
                          <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-md">
                            Obligatorio
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-800 font-medium truncate mt-1">
                        {(item.opciones || []).map(o => o.nombre).filter(Boolean).join(', ') || 'Sin opciones'}
                      </p>

                      <p className="text-[11px] text-gray-600 font-semibold mt-0.5">
                        {(item.opciones || []).length} opciones {item.fromProduct ? `· Creado en "${item.fromProduct}"` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUseFromLibrary(item)}
                        className="h-8 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-98"
                      >
                        + Usar
                      </button>

                      {!item.isFromProduct && (
                        <button
                          type="button"
                          onClick={() => handleDeleteFromLibrary(item.id)}
                          className="w-8 h-8 rounded-lg text-gray-600 hover:text-red-700 hover:bg-red-50 border border-gray-200 hover:border-red-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar de la biblioteca"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Footer nítido */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-white shrink-0">
          <span className="text-xs text-gray-800 font-bold">
            {localGroups.length} grupo(s) en este producto
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-8.5 px-3.5 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-100 text-xs font-bold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="h-8.5 px-4.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs active:scale-98"
            >
              Aplicar opciones
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
