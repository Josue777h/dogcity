import { useState, useMemo, useEffect } from 'react';
import { X, Plus, Trash2, Bookmark, Check, Layers } from 'lucide-react';
import { useBusinessStore, useToastStore } from '../../../stores';
import { readMigratedLocalStorage } from '../../../lib/localStorage';

const OPTIONS_LIBRARY_STORAGE_PREFIX = 'negu_options_lib_';
const MULTIPLE_TITLE_HINT_RE = /(adicional|salsa|topping|extra|\bsin\b|agrega|complemento)/i;

const FOOD_QUICK_TEMPLATES = [
  {
    id: 'tpl_tamano',
    label: 'Tamaño / Porciones',
    titulo: 'Tamaño',
    tipo: 'unica',
    requerido: true,
    max_opciones: null,
    opciones: ['Personal (4 porciones)', 'Mediana (6 porciones)', 'Familiar (8 porciones)'],
  },
  {
    id: 'tpl_borde',
    label: 'Borde / Masa',
    titulo: 'Borde o tipo de masa',
    tipo: 'unica',
    requerido: false,
    max_opciones: null,
    opciones: ['Masa tradicional', 'Masa delgada', 'Borde relleno de queso'],
  },
  {
    id: 'tpl_mitad',
    label: 'Mitad y Mitad (2 sabores)',
    titulo: 'Sabores (Mitad y Mitad)',
    tipo: 'multiple',
    requerido: true,
    max_opciones: 2,
    opciones: ['Pepperoni', 'Hawaiana', 'Pollo con champiñones', 'Carnes'],
  },
  {
    id: 'tpl_proteina',
    label: 'Proteína / Sabor',
    titulo: 'Proteína o sabor',
    tipo: 'unica',
    requerido: true,
    max_opciones: null,
    opciones: ['Res', 'Pollo', 'Cerdo'],
  },
  {
    id: 'tpl_adicionales',
    label: 'Adicionales',
    titulo: 'Adicionales',
    tipo: 'multiple',
    requerido: false,
    max_opciones: null,
    opciones: ['Queso mozzarella extra', 'Pepperoni extra', 'Tocineta', 'Champiñones', 'Maíz tierno'],
  },
  {
    id: 'tpl_salsas',
    label: 'Salsas',
    titulo: 'Salsas',
    tipo: 'multiple',
    requerido: false,
    max_opciones: 3,
    opciones: ['Ajo de la casa', 'Napolitana', 'Picante', 'Piña'],
  },
  {
    id: 'tpl_quitar',
    label: 'Quitar ingredientes',
    titulo: 'Quitar ingredientes',
    tipo: 'multiple',
    requerido: false,
    max_opciones: null,
    opciones: ['Sin cebolla', 'Sin pimentón', 'Sin aceitunas', 'Sin salsas'],
  },
];

function createGroupId() {
  return `g_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

function createOptionId() {
  return `opt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
}

function createLibraryId() {
  return `lib_${Date.now()}`;
}

export default function ToppingsManagerModal({ isOpen, onClose, opciones = [], onSave, businessId }) {
  const [localGroups, setLocalGroups] = useState(() => (Array.isArray(opciones) ? opciones : []));
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'biblioteca'
  const [savedGroupIds, setSavedGroupIds] = useState({});
  const [focusedOptionId, setFocusedOptionId] = useState(null);

  const products = useBusinessStore(s => s.products);
  const business = useBusinessStore(s => s.business);
  const addToast = useToastStore(s => s.addToast);

  const activeBizId = businessId || business?.id || 'default';
  const libStorageKey = `${OPTIONS_LIBRARY_STORAGE_PREFIX}${activeBizId}`;
  const dismissedStorageKey = `negu_options_dismissed_${activeBizId}`;

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [savedLibrary, setSavedLibrary] = useState(() => {
    try {
      const data = readMigratedLocalStorage(libStorageKey, [`camly_options_lib_${activeBizId}`, `camly_toppings_lib_${activeBizId}`]);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [dismissedTitles, setDismissedTitles] = useState(() => {
    try {
      const data = localStorage.getItem(dismissedStorageKey);
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

  // Lista combinada de biblioteca filtrando elementos descartados
  const allLibraryItems = useMemo(() => {
    const dismissedSet = new Set(dismissedTitles.map(t => t.trim().toLowerCase()));
    const items = savedLibrary.filter(i => !dismissedSet.has(i.titulo.trim().toLowerCase()));
    const existingTitles = new Set(items.map(i => i.titulo.trim().toLowerCase()));

    existingProductGroups.forEach(eg => {
      const normTitle = eg.titulo.trim().toLowerCase();
      if (!existingTitles.has(normTitle) && !dismissedSet.has(normTitle)) {
        items.push({
          ...eg,
          id: `prod_${normTitle.replace(/\s+/g, '_')}`,
          isFromProduct: true
        });
      }
    });
    return items;
  }, [savedLibrary, existingProductGroups, dismissedTitles]);

  if (!isOpen) return null;

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
        id: createLibraryId(),
        titulo: group.titulo.trim(),
        tipo: group.tipo || 'unica',
        requerido: Boolean(group.requerido),
        max_opciones: group.tipo === 'multiple' ? (Number(group.max_opciones) || null) : null,
        opciones: validOptions.map(o => ({
          id: o.id || createOptionId(),
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

  const handleDeleteFromLibrary = (item) => {
    const normTitle = (item.titulo || '').trim().toLowerCase();
    if (!item.isFromProduct) {
      const updated = savedLibrary.filter(libItem => libItem.id !== item.id && libItem.titulo.trim().toLowerCase() !== normTitle);
      setSavedLibrary(updated);
      try {
        localStorage.setItem(libStorageKey, JSON.stringify(updated));
      } catch (err) {
        console.debug('localStorage no disponible:', err);
      }
    } else {
      const updatedDismissed = Array.from(new Set([...dismissedTitles, normTitle]));
      setDismissedTitles(updatedDismissed);
      try {
        localStorage.setItem(dismissedStorageKey, JSON.stringify(updatedDismissed));
      } catch (err) {
        console.debug('localStorage no disponible:', err);
      }
    }
    addToast(`"${item.titulo}" eliminado de la biblioteca`, 'info');
  };

  const handleUseFromLibrary = (item) => {
    const newGroup = {
      id: createGroupId(),
      titulo: item.titulo,
      tipo: item.tipo || 'unica',
      requerido: Boolean(item.requerido),
      max_opciones: item.tipo === 'multiple' ? (Number(item.max_opciones) || null) : null,
      opciones: (item.opciones || []).map(o => ({
        id: createOptionId(),
        nombre: o.nombre,
        precio: Number(o.precio) || 0
      }))
    };

    setLocalGroups(prev => [...prev, newGroup]);
    setActiveTab('editor');
    addToast(`"${item.titulo}" añadido al producto`, 'success');
  };

  const handleApplyTemplate = (tpl) => {
    const newGroup = {
      id: createGroupId(),
      titulo: tpl.titulo,
      tipo: tpl.tipo,
      requerido: Boolean(tpl.requerido),
      max_opciones: tpl.max_opciones || null,
      _manualType: true,
      opciones: tpl.opciones.map(name => ({
        id: createOptionId(),
        nombre: name,
        precio: 0
      }))
    };
    setLocalGroups(prev => [...prev, newGroup]);
    addToast(`Plantilla "${tpl.titulo}" añadida`, 'success');
  };

  const handleAddGroup = () => {
    const firstOptId = createOptionId();
    const newGroup = {
      id: createGroupId(),
      titulo: '',
      tipo: 'unica',
      requerido: false,
      max_opciones: null,
      opciones: [
        { id: firstOptId, nombre: '', precio: 0 }
      ]
    };
    setLocalGroups(prev => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId) => {
    setLocalGroups(prev => prev.filter(g => g.id !== groupId));
  };

  const handleUpdateGroup = (groupId, field, value) => {
    setLocalGroups(prev => prev.map(g => {
      if (g.id !== groupId) return g;
      if (field === 'tipo') {
        return {
          ...g,
          tipo: value,
          _manualType: true,
          max_opciones: value === 'multiple' ? (g.max_opciones || null) : null,
        };
      }
      if (field === 'titulo') {
        const hasNamedOption = (g.opciones || []).some(o => o.nombre?.trim());
        const shouldAutoMultiple = !g._manualType && !hasNamedOption && g.tipo === 'unica' && MULTIPLE_TITLE_HINT_RE.test(value);
        return {
          ...g,
          titulo: value,
          ...(shouldAutoMultiple ? { tipo: 'multiple' } : {}),
        };
      }
      return { ...g, [field]: value };
    }));
  };

  const handleAddItem = (groupId) => {
    const newItemId = createOptionId();
    const newItem = {
      id: newItemId,
      nombre: '',
      precio: 0
    };
    setFocusedOptionId(newItemId);
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
        id: g.id,
        titulo: g.titulo?.trim() || 'Opciones',
        tipo: g.tipo || 'unica',
        requerido: Boolean(g.requerido),
        ...(g.tipo === 'multiple' && Number(g.max_opciones) > 0 ? { max_opciones: Number(g.max_opciones) } : {}),
        opciones: (g.opciones || [])
          .filter(o => o.nombre && o.nombre.trim())
          .map(o => ({
            id: o.id,
            nombre: o.nombre.trim(),
            precio: Number(o.precio) || 0,
          }))
      }))
      .filter(g => g.opciones.length > 0);

    onSave(cleaned);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Opciones y adicionales del producto"
      className="fixed inset-0 z-[180] flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden z-10 animate-scale-in my-auto max-h-[92vh] flex flex-col border border-slate-200">
        {/* Cabecera limpia */}
        <div className="px-4 py-3.5 sm:px-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white shrink-0">
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-950 leading-tight">
              Opciones y adicionales
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configura sabores, tamaños, salsas o adicionales para este producto
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pestañas limpias */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-5 shrink-0 gap-1 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-t border-x ${
              activeTab === 'editor'
                ? 'bg-white text-slate-950 border-slate-200 -mb-px'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            Opciones del producto ({localGroups.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('biblioteca')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-colors cursor-pointer border-t border-x flex items-center gap-1.5 ${
              activeTab === 'biblioteca'
                ? 'bg-white text-slate-950 border-slate-200 -mb-px'
                : 'bg-transparent text-slate-600 border-transparent hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <span>Biblioteca guardada</span>
            {allLibraryItems.length > 0 && (
              <span className="text-[11px] bg-brand text-white font-bold px-1.5 py-0.2 rounded-md tabular-nums">
                {allLibraryItems.length}
              </span>
            )}
          </button>
        </div>

        {/* Contenido */}
        {activeTab === 'editor' ? (
          <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 font-sans bg-slate-50/70">
            {/* Barra de acción + plantillas rápidas */}
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleAddGroup}
                  className="btn-primary h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>Agregar grupo de opciones</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-500 mr-0.5">
                  Plantillas rápidas:
                </span>
                {FOOD_QUICK_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-xs font-medium text-slate-700 hover:text-slate-950 transition-colors cursor-pointer"
                  >
                    <Plus size={12} className="text-slate-400" />
                    <span>{tpl.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {localGroups.length === 0 && (
              <div className="py-9 text-center border border-dashed border-slate-300 rounded-xl bg-white px-5 space-y-1.5">
                <p className="text-sm font-semibold text-slate-900">
                  Sin opciones configuradas todavía
                </p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Usa una plantilla rápida arriba o crea un grupo nuevo. Al escribir opciones, pulsa <strong>Enter</strong> para añadir la siguiente al instante.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {localGroups.map((group, gIdx) => {
                const isSaved = Boolean(savedGroupIds[group.id]);

                return (
                  <div
                    key={group.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    {/* Fila 1: Título del grupo y Acciones */}
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <label
                          htmlFor={`group-title-${group.id}`}
                          className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1"
                        >
                          Grupo #{gIdx + 1}
                        </label>
                        <input
                          id={`group-title-${group.id}`}
                          type="text"
                          value={group.titulo}
                          onChange={(e) => handleUpdateGroup(group.id, 'titulo', e.target.value)}
                          placeholder="Ej: Tamaño, Borde o tipo de masa, Adicionales..."
                          className="w-full text-xs sm:text-sm font-semibold text-slate-950 bg-slate-50 focus:bg-white px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-brand placeholder:text-slate-400 placeholder:font-normal"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSaveSingleGroupToLibrary(group)}
                          className={`h-9 px-2.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-400 hover:bg-slate-50'
                          }`}
                          title="Guardar este grupo en tu biblioteca para reutilizarlo en otros productos"
                        >
                          {isSaved ? <Check size={13} strokeWidth={2.5} /> : <Bookmark size={13} />}
                          <span className="hidden sm:inline">{isSaved ? 'Guardado' : 'Guardar'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveGroup(group.id)}
                          className="w-9 h-9 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                          title="Eliminar este grupo"
                          aria-label={`Eliminar grupo ${group.titulo || gIdx + 1}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Fila 2: Tipo (Única / Múltiple), Límite máximo y Obligatorio */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleUpdateGroup(group.id, 'tipo', 'unica')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                              group.tipo === 'unica'
                                ? 'bg-brand text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-950'
                            }`}
                          >
                            Elige 1
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateGroup(group.id, 'tipo', 'multiple')}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                              group.tipo === 'multiple'
                                ? 'bg-brand text-white shadow-2xs'
                                : 'text-slate-600 hover:text-slate-950'
                            }`}
                          >
                            Elige varias
                          </button>
                        </div>

                        {group.tipo === 'multiple' && (
                          <select
                            aria-label="Máximo de opciones a elegir"
                            value={group.max_opciones || ''}
                            onChange={(e) => handleUpdateGroup(group.id, 'max_opciones', e.target.value ? Number(e.target.value) : null)}
                            className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-800 focus:border-brand focus:outline-none cursor-pointer"
                          >
                            <option value="">Sin límite</option>
                            <option value="2">Máx. 2</option>
                            <option value="3">Máx. 3</option>
                            <option value="4">Máx. 4</option>
                            <option value="5">Máx. 5</option>
                          </select>
                        )}
                      </div>

                      <label className="flex items-center gap-2 text-xs text-slate-800 font-semibold cursor-pointer select-none bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          checked={Boolean(group.requerido)}
                          onChange={(e) => handleUpdateGroup(group.id, 'requerido', e.target.checked)}
                          className="w-4 h-4 rounded accent-brand cursor-pointer"
                        />
                        <span>Obligatorio</span>
                      </label>
                    </div>

                    {/* Fila 3: Lista de opciones */}
                    <div className="space-y-1.5 pt-1">
                      <div className="grid grid-cols-12 gap-2 px-1 text-[11px] font-semibold text-slate-500">
                        <div className="col-span-7">Opción</div>
                        <div className="col-span-4 text-right pr-1">Costo extra</div>
                        <div className="col-span-1"></div>
                      </div>

                      {(group.opciones || []).map((opt) => (
                        <div key={opt.id} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-7">
                            <input
                              type="text"
                              autoFocus={opt.id === focusedOptionId}
                              value={opt.nombre}
                              onChange={(e) => handleUpdateItem(group.id, opt.id, 'nombre', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddItem(group.id);
                                }
                              }}
                              placeholder="Ej: Queso extra, Sin cebolla..."
                              className="w-full text-xs sm:text-sm font-medium text-slate-950 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 placeholder:text-slate-400"
                            />
                          </div>

                          <div className="col-span-4 flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 focus-within:border-slate-900">
                            <span className="text-xs text-slate-400 font-semibold shrink-0">+$</span>
                            <input
                              type="number"
                              min="0"
                              step="100"
                              value={opt.precio === 0 ? '' : opt.precio}
                              onChange={(e) => handleUpdateItem(group.id, opt.id, 'precio', Number(e.target.value) || 0)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddItem(group.id);
                                }
                              }}
                              placeholder="0"
                              className="w-full text-xs sm:text-sm font-semibold tabular-nums text-slate-950 bg-transparent focus:outline-none text-right placeholder:text-slate-400"
                            />
                          </div>

                          <div className="col-span-1 flex justify-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(group.id, opt.id)}
                              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Eliminar opción"
                              aria-label="Eliminar opción"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => handleAddItem(group.id)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-1.5 pt-1.5 cursor-pointer select-none"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                        <span>Agregar opción</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Pestaña: Biblioteca */
          <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1 font-sans bg-slate-50/70">
            {allLibraryItems.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-300 rounded-xl bg-white p-5 space-y-2">
                <Layers size={24} className="mx-auto text-slate-400 mb-1" />
                <p className="text-sm font-semibold text-slate-900">Tu biblioteca está vacía</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Cuando crees un grupo de opciones en la pestaña principal, pulsa <strong>&quot;Guardar&quot;</strong> para reutilizarlo aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-xs font-semibold text-slate-600">
                  Grupos listos para reutilizar en este producto:
                </p>

                {allLibraryItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:border-slate-400 transition-colors shadow-2xs"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-950 truncate">
                          {item.titulo}
                        </span>
                        <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {item.tipo === 'unica' ? 'Elige 1' : 'Múltiple'}
                        </span>
                        {item.requerido && (
                          <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md">
                            Obligatorio
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 truncate mt-1">
                        {(item.opciones || []).map(o => o.nombre).filter(Boolean).join(', ') || 'Sin opciones'}
                      </p>

                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {(item.opciones || []).length} opciones{item.fromProduct ? ` · Usado en "${item.fromProduct}"` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleUseFromLibrary(item)}
                        className="btn-primary h-8 px-3 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <Plus size={13} />
                        <span>Usar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteFromLibrary(item)}
                        className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
                        title="Eliminar de la biblioteca"
                        aria-label={`Eliminar ${item.titulo} de la biblioteca`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer limpio */}
        <div className="px-4 py-3 sm:px-5 border-t border-slate-200 flex items-center justify-between bg-white shrink-0">
          <span className="text-xs text-slate-600 font-semibold tabular-nums">
            {localGroups.length} {localGroups.length === 1 ? 'grupo' : 'grupos'} en este producto
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-3.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="btn-primary h-9 px-4 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Aplicar opciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
