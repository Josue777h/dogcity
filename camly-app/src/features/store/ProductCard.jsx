import { useState, useMemo, useEffect, memo } from 'react';
import { Plus, Minus, X, PackageCheck, Check, Layers, ChevronDown } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';

const ProductCard = memo(function ProductCard({ 
  product, 
  isStoreOpen = true, 
  storeClosedMessage = '',
  isTableMode = false
}) {
  const business = useBusinessStore(s => s.business);
  const bid      = business?.id;
  const addToast = useToastStore(s => s.addToast);

  const addItem   = useCartStore(s => s.addItem);
  const increment = useCartStore(s => s.increment);
  const decrement = useCartStore(s => s.decrement);
  const totalProductQty = useCartStore(s => s.getProductTotalQuantity(bid, product.id));
  const isSelected = totalProductQty > 0;

  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(!product.image);

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);

  // Opciones y toppings configurados en este producto
  const hasOptions = Array.isArray(product.opciones) && product.opciones.length > 0;
  const hasPaidRequiredOptions = hasOptions && product.opciones.some(g =>
    g.requerido && Array.isArray(g.opciones) && g.opciones.some(o => Number(o?.precio) > 0)
  );

  const getDefaultOptions = () => {
    const initial = {};
    if (hasOptions) {
      product.opciones.forEach(group => {
        initial[group.id] = [];
      });
    }
    return initial;
  };

  // Estado de selecciones dentro del modal de personalización y detalle
  const [selectedOptions, setSelectedOptions] = useState(getDefaultOptions);
  const [tempNote, setTempNote] = useState('');
  const [modalQty, setModalQty] = useState(1);
  const [expandedGroups, setExpandedGroups] = useState({});

  const brandColor = business?.theme_color || '#0284C7';

  const designConfig = useMemo(() => {
    const base = { button_style: 'pill', font_family: 'sans' };
    if (business?.catalog_design && typeof business.catalog_design === 'object' && Object.keys(business.catalog_design).length) return { ...base, ...business.catalog_design };
    if (typeof business?.footer_message === 'string' && /<!--(?:NEGU|CAMLY)_DESIGN:/.test(business.footer_message)) {
      try {
        const match = business.footer_message.match(/<!--(?:NEGU|CAMLY)_DESIGN:(.*?)-->/);
        if (match && match[1]) return { ...base, ...JSON.parse(match[1]) };
      } catch (err) {
        console.warn('Error parsing design config:', err);
      }
    }
    return base;
  }, [business?.catalog_design, business?.footer_message]);

  const buttonStyle = designConfig.button_style || 'pill';
  const secondaryColor = business?.color_secundario || designConfig?.color_secundario || '#F0F9FF';

  if (!bid) return null;

  // Inicializar grupos desplegados de forma inteligente
  const initializeExpandedGroups = () => {
    if (!hasOptions) return {};
    const total = product.opciones.length;
    const initial = {};
    if (total <= 2) {
      // 1 o 2 grupos: todos abiertos de inmediato
      product.opciones.forEach(g => { initial[g.id] = true; });
    } else {
      // 3 o más grupos (ej. 5 toppings): abrir el primero o el primero obligatorio
      const firstReqIndex = product.opciones.findIndex(g => g.requerido);
      const targetIndex = firstReqIndex !== -1 ? firstReqIndex : 0;
      product.opciones.forEach((g, idx) => {
        initial[g.id] = idx === targetIndex;
      });
    }
    return initial;
  };

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const openCustomizationModal = () => {
    setSelectedOptions(getDefaultOptions());
    setExpandedGroups(initializeExpandedGroups());
    setTempNote('');
    setModalQty(1);
    setShowModal(true);
  };

  // Cálculo de precio acumulado con toppings
  const extraToppingsCost = Object.values(selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + (Number(opt?.precio) || 0), 0);

  const finalUnitPrice = Number(product.price) + extraToppingsCost;

  // Manejar selección única (radio / sabores) con auto-avance inteligente
  const handleSelectRadio = (group, option) => {
    setSelectedOptions(prev => {
      const current = prev[group.id] || [];
      const isSame = current.length > 0 && current[0].id === option.id;
      if (isSame && !group?.requerido) {
        return { ...prev, [group.id]: [] };
      }
      return { 
        ...prev, 
        [group.id]: [{
          id: option.id,
          nombre: option.nombre,
          precio: Number(option.precio) || 0,
          grupo_id: group.id,
          grupo_titulo: group.titulo
        }] 
      };
    });

    // Si tiene 3 o más grupos, auto-avanzar al siguiente grupo que aún no tenga selecciones
    if (hasOptions && product.opciones.length > 2) {
      const currentIndex = product.opciones.findIndex(g => g.id === group.id);
      const nextGroup = product.opciones.slice(currentIndex + 1).find(g => {
        const sel = selectedOptions[g.id] || [];
        return sel.length === 0;
      });
      if (nextGroup) {
        setTimeout(() => {
          setExpandedGroups(prev => ({
            ...prev,
            [group.id]: false,
            [nextGroup.id]: true
          }));
        }, 120);
      }
    }
  };

  // Manejar selección múltiple (checkbox / toppings) con control estricto de máximo
  const handleToggleCheckbox = (group, option) => {
    setSelectedOptions(prev => {
      const current = prev[group.id] || [];
      const exists = current.some(o => o.id === option.id);
      if (exists) {
        return { ...prev, [group.id]: current.filter(o => o.id !== option.id) };
      }

      const maxLimit = Number(group.max_opciones) || null;
      if (maxLimit && current.length >= maxLimit) {
        addToast(`Máximo ${maxLimit} ${maxLimit === 1 ? 'opción' : 'opciones'} en "${group.titulo}"`, 'warning');
        return prev;
      }

      const newOption = {
        id: option.id,
        nombre: option.nombre,
        precio: Number(option.precio) || 0,
        grupo_id: group.id,
        grupo_titulo: group.titulo
      };
      return { ...prev, [group.id]: [...current, newOption] };
    });
  };

  // Botón rápido en la tarjeta
  const handleCardAdd = (e) => {
    e?.stopPropagation?.();
    if (!isStoreOpen) {
      addToast(storeClosedMessage || 'La tienda se encuentra temporalmente en pausa o cerrada.', 'warning');
      return;
    }
    if (hasOptions) {
      openCustomizationModal();
    } else {
      addItem(bid, product, { options: [], note: '', quantity: 1 });
    }
  };

  // Confirmar y agregar desde el modal con validación estricta
  const handleConfirmCustomization = () => {
    if (!isStoreOpen) {
      addToast(storeClosedMessage || 'La tienda se encuentra temporalmente en pausa o cerrada.', 'warning');
      return;
    }

    // Validar grupos requeridos y límites mínimos
    if (hasOptions) {
      for (const group of product.opciones) {
        const selections = selectedOptions[group.id] || [];
        if (group.requerido && selections.length === 0) {
          addToast(`Debes elegir al menos una opción en "${group.titulo}"`, 'warning');
          return;
        }
        if (group.min_opciones && selections.length < Number(group.min_opciones)) {
          addToast(`Debes elegir al menos ${group.min_opciones} opciones en "${group.titulo}"`, 'warning');
          return;
        }
      }
    }

    const flatOptions = Object.values(selectedOptions).flat();
    addItem(bid, product, { 
      options: flatOptions, 
      note: tempNote.trim(), 
      quantity: modalQty 
    });
    setShowModal(false);
  };

  const getAddButtonProps = () => {
    switch (buttonStyle) {
      case 'square':
        return {
          className: "py-1.5 px-3 text-xs sm:text-sm font-black uppercase tracking-wider rounded-none shrink-0 text-white cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-none min-h-[34px]",
          style: { backgroundColor: brandColor }
        };
      case 'soft':
        return {
          className: "py-1.5 px-3 sm:px-3.5 text-xs sm:text-sm font-semibold rounded-md shrink-0 text-white cursor-pointer transition-all shadow-2xs active:scale-95 flex items-center justify-center min-h-[34px]",
          style: { backgroundColor: brandColor }
        };
      case 'outline':
        return {
          className: "py-1 px-3 sm:px-3.5 text-xs sm:text-sm font-bold rounded-lg border-2 shrink-0 bg-white cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-2xs min-h-[34px]",
          style: { borderColor: brandColor, color: brandColor }
        };
      default: // pill
        return {
          className: "py-1.5 px-3.5 sm:px-4 text-xs sm:text-sm font-bold rounded-full shrink-0 text-white cursor-pointer transition-all shadow-sm active:scale-95 flex items-center justify-center min-h-[34px]",
          style: { backgroundColor: brandColor }
        };
    }
  };

  const btnProps = getAddButtonProps();

  return (
    <>
      <article
        className={`flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-white transition-colors ${
          isSelected ? 'border-slate-400' : 'border-[#e1ddd5] hover:border-[#c9c4bb]'
        }`}
        style={isSelected ? { borderColor: brandColor } : {}}
      >
        {/* Product Image */}
        <div
          style={{ backgroundColor: secondaryColor }}
          className="group relative aspect-[8/5] cursor-pointer overflow-hidden"
          onClick={openCustomizationModal}
        >
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              width="400"
              height="250"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-slate-600">
              <PackageCheck size={21} strokeWidth={1.5} />
              <span className="text-xs font-medium">Foto no disponible</span>
            </div>
          )}

          {/* Micro-tag legible cuando el producto tiene variantes o adicionales */}
          {hasOptions && (
            <div
              className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm shadow-2xs"
              title="Producto personalizable"
            >
              <Layers size={11} aria-hidden="true" />
              <span>Opciones</span>
            </div>
          )}

          {/* Quantity pill on image */}
          {isSelected && (
            <div 
              className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              {totalProductQty}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-2.5 sm:p-3 font-sans min-w-0 overflow-hidden">
          <div className="mb-2 min-w-0 flex-1 cursor-pointer overflow-hidden" onClick={openCustomizationModal}>
            <h3 className="mb-1 line-clamp-2 break-words text-sm font-bold leading-snug text-slate-900 sm:text-base hover:text-blue-600 transition-colors">
              {product.name}
            </h3>
            {product.description && (
              <p className="line-clamp-2 break-words text-ellipsis overflow-hidden text-xs leading-relaxed text-slate-500">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-[#f0ede7] pt-2.5">
            <div className="flex items-baseline gap-1 min-w-0">
              {hasPaidRequiredOptions && (
                <span className="text-[11px] font-medium text-slate-500 shrink-0">Desde</span>
              )}
              <span className="truncate text-sm font-extrabold tabular-nums text-slate-900 sm:text-base">
                {formatMoney(product.price)}
              </span>
              {product.unit && product.unit.toLowerCase() !== 'unidad' && (
                <span className="truncate text-[11px] font-medium text-slate-500">
                  / {product.unit}
                </span>
              )}
            </div>

            {isTableMode ? (
              <button
                type="button"
                onClick={openCustomizationModal}
                className="flex h-10 min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 px-3 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
              >
                <span>Ver plato</span>
                <ChevronDown size={14} className="text-slate-400 -rotate-90" />
              </button>
            ) : !isStoreOpen ? (
              <button
                type="button"
                onClick={handleCardAdd}
                className="flex h-10 min-h-[40px] w-full items-center justify-center rounded-xl border border-[#e4e1da] bg-[#f2f0eb] px-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                title={storeClosedMessage || 'Tienda en pausa o cerrada temporalmente'}
              >
                Pausado
              </button>
            ) : !isSelected ? (
              <button
                onClick={handleCardAdd}
                className={`${btnProps.className} h-10 min-h-[40px] w-full gap-1.5 rounded-xl px-3 text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all`}
                style={btnProps.style}
                aria-label={`Agregar ${product.name}`}
              >
                <Plus size={14} strokeWidth={2.5} className="shrink-0" />
                <span>{hasOptions ? 'Elegir' : 'Agregar'}</span>
              </button>
            ) : (
              <div
                style={{
                  backgroundColor: secondaryColor,
                  borderColor: `color-mix(in srgb, ${brandColor} 25%, #cbd5e1)`,
                }}
                className="flex h-10 min-h-[40px] w-full items-center justify-between overflow-hidden rounded-xl border"
              >
                <button
                  onClick={() => decrement(bid, product.id)}
                  className="flex h-10 w-10 items-center justify-center text-slate-700 transition-colors hover:bg-black/5 active:scale-95"
                  aria-label="Restar una unidad"
                >
                  <Minus size={15} />
                </button>
                <span className="min-w-8 text-center text-sm font-bold tabular-nums text-slate-900">
                  {totalProductQty}
                </span>
                <button
                  onClick={() => {
                    if (hasOptions) openCustomizationModal();
                    else increment(bid, product.id);
                  }}
                  className="flex h-10 w-10 items-center justify-center text-slate-700 transition-colors hover:bg-black/5 active:scale-95"
                  aria-label="Sumar una unidad o personalizar otra"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Modal de Detalle y Personalización (Sabores & Toppings) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de ${product.name}`}
          className="fixed inset-0 z-[160] flex items-center justify-center overflow-hidden p-3 sm:p-4"
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e1ddd5] bg-white shadow-2xl animate-scale-in max-h-[82dvh] sm:max-h-[min(80dvh,44rem)]">
            
            {/* Botón cerrar flotante */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 z-30 flex h-8.5 w-8.5 cursor-pointer items-center justify-center rounded-full bg-black/65 hover:bg-black/85 text-white transition-colors backdrop-blur-xs shadow-md"
              aria-label="Cerrar"
            >
              <X size={17} />
            </button>

            {/* CONTENEDOR DESPLAZABLE ÚNICO (TODO HACE SCROLL SUAVE Y NATURAL) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

              {/* Hero Image del producto si existe */}
              {!imgError && product.image ? (
                <div className="relative aspect-[16/9] max-h-36 sm:max-h-44 w-full bg-[#f2eee7] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                  />
                </div>
              ) : null}

              {/* Cabecera con Título, Precio y Descripción limpia */}
              <div className="p-4 sm:p-5 border-b border-[#f0ede7] space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg sm:text-xl font-bold leading-tight text-slate-900 break-words">
                      {product.name}
                    </h2>
                  </div>
                  <span className="text-base sm:text-lg font-extrabold text-slate-900 shrink-0 tabular-nums">
                    {formatMoney(product.price)}
                  </span>
                </div>

                {/* Descripción e ingredientes legible y sin recuadros pesados */}
                {product.description && (
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line break-words pt-0.5">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Opciones y notas en el mismo flujo de scroll */}
              <div className="p-4 sm:p-5 space-y-4">
                {/* Grupos de opciones (Sabores / Toppings) con Acordeón Inteligente */}
                {hasOptions && (
                <div className="space-y-2.5 pt-0.5 font-sans">
                  {product.opciones.map((group, groupIdx) => {
                    const isRadio = group.tipo === 'unica';
                    const currentSelected = selectedOptions[group.id] || [];
                    const maxLimit = Number(group.max_opciones) || null;
                    const isOpen = expandedGroups[group.id] ?? (product.opciones.length <= 2 || groupIdx === 0);
                    const isCompleted = isRadio ? currentSelected.length > 0 : (group.min_opciones ? currentSelected.length >= Number(group.min_opciones) : currentSelected.length > 0);
                    const isRequiredPending = group.requerido && currentSelected.length === 0;

                    return (
                      <div 
                        key={group.id} 
                        style={!isOpen && !isRequiredPending ? { backgroundColor: secondaryColor, borderColor: `color-mix(in srgb, ${brandColor} 25%, #cbd5e1)` } : undefined}
                        className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                          isOpen 
                            ? 'border-slate-300 bg-white shadow-2xs ring-1 ring-black/[0.03]' 
                            : isRequiredPending
                              ? 'border-amber-200/90 bg-amber-50/20'
                              : 'hover:opacity-95'
                        }`}
                      >
                        {/* Cabecera interactiva del grupo */}
                        <button
                          type="button"
                          onClick={() => toggleGroup(group.id)}
                          className="w-full flex items-center justify-between gap-2.5 p-3 sm:p-3.5 text-left cursor-pointer transition-colors select-none"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                                {group.titulo}
                              </h4>
                              
                              {/* Badge de estado del grupo */}
                              {isRequiredPending ? (
                                <span className="rounded-md border border-amber-200 bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                  Obligatorio
                                </span>
                              ) : isCompleted ? (
                                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                                  <Check size={10} strokeWidth={3} />
                                  Listo
                                </span>
                              ) : (
                                <span className="rounded-md border border-[#e7e3db] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                                  Opcional
                                </span>
                              )}
                            </div>

                            {/* Resumen dinámico en vivo */}
                            {!isOpen && currentSelected.length > 0 ? (
                              <p className="mt-1 text-xs font-semibold text-emerald-700 flex items-center gap-1 truncate">
                                <span className="truncate">
                                  {/mitad/i.test(group.titulo || '') && currentSelected.length === 2
                                    ? `1/2 ${currentSelected[0].nombre} + 1/2 ${currentSelected[1].nombre}`
                                    : currentSelected.map(o => o.nombre).join(', ')}
                                </span>
                              </p>
                            ) : (
                              <p className="mt-0.5 text-xs text-slate-500">
                                {isRadio
                                  ? 'Elige 1 opción'
                                  : !isRadio && maxLimit === 2 && (group.requerido || /(mitad|combin)/i.test(group.titulo || ''))
                                    ? (currentSelected.length === 0
                                        ? 'Elige 1 opción (entera) o 2 opciones (mitad y mitad)'
                                        : currentSelected.length === 1
                                          ? '1 elegido (Entera) · Puedes marcar 1 más para Mitad y Mitad'
                                          : 'Mitad y Mitad: 2/2 seleccionados')
                                    : maxLimit
                                      ? `Hasta ${maxLimit} opciones (${currentSelected.length}/${maxLimit})`
                                      : 'Elige las que desees'}
                              </p>
                            )}
                          </div>

                          {/* Indicador numérico y flecha acordeón */}
                          <div className="flex items-center gap-2 shrink-0">
                            {currentSelected.length > 0 && (
                              <span 
                                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                                className="text-[11px] font-extrabold px-2 py-0.5 rounded-full tabular-nums"
                              >
                                {isRadio ? '1/1' : `${currentSelected.length}${maxLimit ? `/${maxLimit}` : ''}`}
                              </span>
                            )}
                            <div className={`p-1 rounded-md text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : ''}`}>
                              <ChevronDown size={17} />
                            </div>
                          </div>
                        </button>

                        {/* Opciones dentro del grupo (se despliega si está abierto) */}
                        {isOpen && (
                          <div className="p-2.5 sm:p-3 pt-0 border-t border-slate-100/80 animate-fade-in">
                            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {group.opciones?.map(opt => {
                                const isChecked = currentSelected.some(o => o.id === opt.id);
                                const isMaxReached = !isRadio && maxLimit && currentSelected.length >= maxLimit && !isChecked;

                                return (
                                  <label
                                    key={opt.id}
                                    onClick={() => {
                                      if (isMaxReached) {
                                        addToast(`Límite de ${maxLimit} opciones alcanzado en "${group.titulo}"`, 'warning');
                                        return;
                                      }
                                      if (isRadio) {
                                        handleSelectRadio(group, opt);
                                      } else {
                                        handleToggleCheckbox(group, opt);
                                      }
                                    }}
                                    style={{
                                      borderColor: isChecked ? brandColor : undefined,
                                      backgroundColor: isChecked ? `${brandColor}08` : undefined
                                    }}
                                    className={`flex min-h-9.5 items-center justify-between gap-1.5 rounded-lg border px-2.5 py-1.5 transition-colors select-none ${
                                      isMaxReached 
                                        ? 'cursor-not-allowed border-[#e7e3db] bg-[#f2f0eb] opacity-60'
                                        : 'cursor-pointer bg-white hover:border-slate-400'
                                    } ${
                                      isChecked 
                                        ? 'font-semibold text-slate-950'
                                        : 'border-[#e7e3db] text-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div 
                                        style={isChecked ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-${isRadio ? 'full' : 'sm'} border transition-colors ${
                                          isChecked ? 'text-white' : 'border-[#c9c4bb] bg-white'
                                        }`}
                                      >
                                        {isChecked && (
                                          isRadio 
                                            ? <div className="w-1.5 h-1.5 rounded-full bg-white" /> 
                                            : <Check size={10} strokeWidth={3} />
                                        )}
                                      </div>
                                      <span className="truncate text-xs sm:text-sm text-slate-900">
                                        {opt.nombre}
                                      </span>
                                    </div>

                                    <span className={`text-[11px] tabular-nums shrink-0 ${
                                      Number(opt.precio) > 0 ? 'font-bold text-slate-900' : 'font-normal text-slate-400'
                                    }`}>
                                      {Number(opt.precio) > 0 ? `+${formatMoney(opt.precio)}` : 'Inc.'}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Instrucción o nota especial (Solo para delivery/online) */}
              {!isTableMode ? (
                <div className="pt-1">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-800">
                    Notas especiales o instrucciones:
                  </label>
                  <input
                    type="text"
                    value={tempNote}
                    onChange={e => setTempNote(e.target.value)}
                    placeholder="Escribe indicaciones para la tienda"
                    className="min-h-11 w-full rounded-lg border border-[#d9d5cd] bg-white p-2.5 text-xs text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-900/5 sm:text-sm"
                  />
                </div>
              ) : hasOptions ? (
                <p className="text-[11px] text-slate-500 italic pt-1">
                  Indícale a tu mesero tus preferencias de ingredientes o adiciones al momento de ordenar en tu mesa.
                </p>
              ) : null}
            </div>
          </div>

          {/* Footer: En Mesa es botón Cerrar; En Tienda online es Stepper y Agregar */}
          {isTableMode ? (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e7e3db] bg-white px-4 py-3 sm:px-5 pb-safe">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Precio</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                  {formatMoney(product.price)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
              >
                Cerrar detalle
              </button>
            </div>
          ) : (
            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#e7e3db] bg-white px-4 py-3 sm:p-5 pb-safe">
              {/* Stepper de cantidad */}
              <div className="flex items-center rounded-xl border border-[#d9d5cd] bg-[#f7f6f2] p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setModalQty(q => Math.max(1, q - 1))}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-black/5 active:scale-95 cursor-pointer"
                  aria-label="Disminuir cantidad"
                >
                  <Minus size={15} />
                </button>
                <span className="w-8 text-center text-sm font-bold text-slate-900 tabular-nums">
                  {modalQty}
                </span>
                <button
                  type="button"
                  onClick={() => setModalQty(q => q + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-black/5 active:scale-95 cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={15} />
                </button>
              </div>

              {!isStoreOpen ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed shrink-0"
                >
                  Tienda en pausa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmCustomization}
                  style={{ backgroundColor: brandColor }}
                  className="flex-1 min-h-11 sm:min-h-12 rounded-xl text-white font-bold text-xs sm:text-sm px-4 flex items-center justify-between gap-2 shadow-sm hover:opacity-95 active:scale-98 cursor-pointer transition-all"
                >
                  <span>Agregar al pedido</span>
                  <span className="tabular-nums font-extrabold text-sm sm:text-base">
                    {formatMoney(finalUnitPrice * modalQty)}
                  </span>
                </button>
              )}
            </div>
          )}

          </div>
        </div>
      )}
    </>
  );
});

export default ProductCard;
