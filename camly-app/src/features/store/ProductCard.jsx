import { useState, useMemo, useEffect, memo } from 'react';
import { Plus, Minus, X, PackageCheck, Check, ChevronDown, ChevronLeft, ChevronRight, Images } from 'lucide-react';
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
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const galleryImages = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images.filter(Boolean);
    }
    return product.image ? [product.image] : [];
  }, [product.images, product.image]);
  const hasGallery = galleryImages.length > 1;

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

  // Stock y descuento (respetando configuración de inventario del negocio)
  const invCfg = business?.catalog_design?.inventory_config || {};
  const lowStockThreshold = Math.max(1, Number(invCfg.lowStockThreshold) || 5);
  const showLowStockBadge = invCfg.showLowStockBadge !== false;
  const showDiscountBadge = invCfg.showDiscountBadge !== false;

  const hasStockLimit = product.stock !== null && product.stock !== undefined && Number.isFinite(Number(product.stock));
  const maxStock = hasStockLimit ? Math.max(0, Math.floor(Number(product.stock))) : Infinity;
  const isOutOfStock = product.disponible === false || (hasStockLimit && maxStock <= 0);
  const isLowStock = showLowStockBadge && hasStockLimit && maxStock > 0 && maxStock <= lowStockThreshold;
  const comparePrice = Number(product.comparePrice) > Number(product.price) ? Number(product.comparePrice) : null;
  const discountPercent = showDiscountBadge && comparePrice && Number(product.price) > 0
    ? Math.round(((comparePrice - Number(product.price)) / comparePrice) * 100)
    : 0;

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
    setActivePhotoIdx(0);
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
      addToast(storeClosedMessage || 'Tienda cerrada', 'warning');
      return;
    }
    if (isOutOfStock) {
      addToast('Producto agotado', 'warning');
      return;
    }
    if (hasStockLimit && totalProductQty >= maxStock) {
      addToast(`Solo quedan ${maxStock} uds.`, 'warning');
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
      addToast(storeClosedMessage || 'Tienda cerrada', 'warning');
      return;
    }
    if (isOutOfStock) {
      addToast('Producto agotado', 'warning');
      return;
    }
    if (hasStockLimit && totalProductQty + modalQty > maxStock) {
      const remaining = Math.max(0, maxStock - totalProductQty);
      addToast(
        remaining > 0
          ? `Solo puedes agregar ${remaining} ${remaining === 1 ? 'unidad más' : 'unidades más'} (stock: ${maxStock}).`
          : `Ya agregaste el máximo disponible (${maxStock}) de "${product.name}".`,
        'warning'
      );
      return;
    }

    // Validar grupos requeridos y límites mínimos
    if (hasOptions) {
      for (const group of product.opciones) {
        const selections = selectedOptions[group.id] || [];
        if (group.requerido && selections.length === 0) {
          addToast(`Elige una opción en ${group.titulo}`, 'warning');
          return;
        }
        if (group.min_opciones && selections.length < Number(group.min_opciones)) {
          addToast(`Elige mínimo ${group.min_opciones} en ${group.titulo}`, 'warning');
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

          {/* Etiqueta compacta solo de descuento si aplica (sin tapar la foto con "Opciones") */}
          {discountPercent > 0 && !isOutOfStock && (
            <span className="absolute left-2 top-2 inline-flex items-center rounded-md bg-emerald-600/95 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow-xs tabular-nums">
              -{discountPercent}%
            </span>
          )}

          {/* Overlay si está sin stock */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex items-center justify-center">
              <span className="rounded-full bg-slate-950/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
                Agotado
              </span>
            </div>
          )}

          {/* Quantity pill on image */}
          {isSelected && !isOutOfStock && (
            <div 
              className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              {totalProductQty}
            </div>
          )}

          {/* Indicador discreto de galería múltiple */}
          {hasGallery && !isOutOfStock && (
            <div className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs tabular-nums">
              <Images size={10} aria-hidden="true" />
              <span>{galleryImages.length}</span>
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
            <div className="flex items-baseline justify-between gap-1.5 min-w-0">
              <div className="flex items-baseline gap-1.5 min-w-0 flex-wrap">
                {hasPaidRequiredOptions && (
                  <span className="text-[11px] font-medium text-slate-500 shrink-0">Desde</span>
                )}
                <span className="truncate text-sm font-extrabold tabular-nums text-slate-900 sm:text-base">
                  {formatMoney(product.price)}
                </span>
                {comparePrice && (
                  <span className="truncate text-xs font-medium text-slate-400 line-through tabular-nums">
                    {formatMoney(comparePrice)}
                  </span>
                )}
                {product.unit && product.unit.toLowerCase() !== 'unidad' && (
                  <span className="truncate text-[11px] font-medium text-slate-500">
                    / {product.unit}
                  </span>
                )}
              </div>
              {isLowStock && !isOutOfStock && (
                <span className="shrink-0 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md tabular-nums">
                  {maxStock === 1 ? 'Última ud.' : `Quedan ${maxStock}`}
                </span>
              )}
            </div>

            {isTableMode ? (
              <button
                type="button"
                onClick={openCustomizationModal}
                className="flex h-10 min-h-[40px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 px-3 text-xs font-semibold text-slate-700 transition-all shadow-2xs"
              >
                <span>Ver detalle</span>
                <ChevronDown size={14} className="text-slate-400 -rotate-90" />
              </button>
            ) : isOutOfStock ? (
              <button
                type="button"
                disabled
                className="flex h-10 min-h-[40px] w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-xs font-semibold text-slate-400 cursor-not-allowed"
              >
                Agotado
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
                    if (hasStockLimit && totalProductQty >= maxStock) {
                      addToast(`Solo quedan ${maxStock} uds.`, 'warning');
                      return;
                    }
                    if (hasOptions) openCustomizationModal();
                    else increment(bid, product.id);
                  }}
                  disabled={hasStockLimit && totalProductQty >= maxStock}
                  className="flex h-10 w-10 items-center justify-center text-slate-700 transition-colors hover:bg-black/5 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Sumar una unidad o personalizar otra"
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Sheet / Modal de Detalle y Personalización (Nordic Precision) */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle de ${product.name}`}
          className="fixed inset-0 z-[160] flex items-end sm:items-center justify-center overflow-hidden p-0 sm:p-4"
        >
          <div
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-slate-200/90 bg-white shadow-xl animate-scale-in max-h-[90dvh] sm:max-h-[min(84dvh,46rem)]">
            
            {/* Indicador sutil de bottom sheet en móvil */}
            <div className="sm:hidden flex justify-center pt-2.5 pb-1 bg-white shrink-0">
              <span className="h-1 w-10 rounded-full bg-slate-200" aria-hidden="true" />
            </div>

            {/* Botón cerrar minimalista */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3.5 top-3.5 z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-600 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 transition-colors backdrop-blur-xs"
              aria-label="Cerrar"
            >
              <X size={16} strokeWidth={1.75} />
            </button>

            {/* CONTENEDOR DESPLAZABLE ÚNICO (TODO HACE SCROLL SUAVE Y NATURAL) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">

              {/* Galería / Hero Image del producto */}
              {!imgError && galleryImages.length > 0 ? (
                <div className="bg-[#f2eee7]">
                  <div className="relative aspect-[16/10] max-h-56 sm:max-h-64 w-full overflow-hidden">
                    <img
                      src={galleryImages[activePhotoIdx] || galleryImages[0]}
                      alt={`${product.name}${hasGallery ? ` (${activePhotoIdx + 1}/${galleryImages.length})` : ''}`}
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                    {hasGallery && (
                      <>
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 hover:bg-black/75 text-white backdrop-blur-xs cursor-pointer transition-colors"
                          aria-label="Foto anterior"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePhotoIdx(i => (i + 1) % galleryImages.length)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 hover:bg-black/75 text-white backdrop-blur-xs cursor-pointer transition-colors"
                          aria-label="Foto siguiente"
                        >
                          <ChevronRight size={16} />
                        </button>
                        <span className="absolute bottom-2.5 right-3 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs tabular-nums">
                          {activePhotoIdx + 1} / {galleryImages.length}
                        </span>
                      </>
                    )}
                  </div>

                  {hasGallery && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-[#f0ede7] overflow-x-auto no-scrollbar">
                      {galleryImages.map((src, idx) => (
                        <button
                          key={`${src}_${idx}`}
                          type="button"
                          onClick={() => setActivePhotoIdx(idx)}
                          className={`w-12 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                            idx === activePhotoIdx
                              ? 'border-slate-900 opacity-100'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          aria-label={`Ver foto ${idx + 1}`}
                        >
                          <img src={src} alt={`${product.name} miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Cabecera con Título, Precio y Descripción limpia */}
              <div className="px-4 sm:px-5 pt-4 pb-3.5 border-b border-slate-100 space-y-1.5">
                <div className="pr-9">
                  <h2 className="text-lg sm:text-xl font-semibold tracking-tight leading-snug text-slate-950 break-words">
                    {product.name}
                  </h2>
                </div>
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {formatMoney(product.price)}
                  </span>
                  {comparePrice && (
                    <span className="text-xs font-normal text-slate-400 line-through tabular-nums">
                      {formatMoney(comparePrice)}
                    </span>
                  )}
                  {product.description && (
                    <span className="text-xs text-slate-500 leading-relaxed whitespace-pre-line break-words">
                      · {product.description}
                    </span>
                  )}
                </div>
              </div>

              {/* Opciones y notas estilo Nordic Precision (limpio, 1 columna, sin cajas pesadas) */}
              <div className="p-4 sm:p-5 space-y-5">
                {hasOptions && (
                <div className="space-y-5 font-sans">
                  {product.opciones.map((group, groupIdx) => {
                    const isRadio = group.tipo === 'unica';
                    const currentSelected = selectedOptions[group.id] || [];
                    const maxLimit = Number(group.max_opciones) || null;
                    const canCollapse = product.opciones.length > 3;
                    const isOpen = canCollapse
                      ? (expandedGroups[group.id] ?? groupIdx < 2)
                      : true;
                    const isCompleted = isRadio
                      ? currentSelected.length > 0
                      : (group.min_opciones ? currentSelected.length >= Number(group.min_opciones) : currentSelected.length > 0);
                    const isRequiredPending = group.requerido && currentSelected.length === 0;

                    const rightHint = isRadio
                      ? 'Elige 1'
                      : maxLimit
                        ? (currentSelected.length > 0 ? `${currentSelected.length}/${maxLimit}` : `Hasta ${maxLimit}`)
                        : 'Personaliza';

                    return (
                      <section key={group.id} className="space-y-2.5">
                        {/* Cabecera limpia del grupo */}
                        <div
                          role={canCollapse ? 'button' : undefined}
                          tabIndex={canCollapse ? 0 : undefined}
                          onClick={canCollapse ? () => toggleGroup(group.id) : undefined}
                          onKeyDown={canCollapse ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(group.id); } } : undefined}
                          className={`flex items-center justify-between gap-2 select-none ${canCollapse ? 'cursor-pointer' : ''}`}
                        >
                          <div className="flex items-center gap-2 flex-wrap min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 leading-snug">
                              {group.titulo}
                            </h4>
                            {isRequiredPending ? (
                              <span className="rounded-md bg-amber-100/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                                Obligatorio
                              </span>
                            ) : isCompleted && group.requerido ? (
                              <span className="rounded-md bg-emerald-100/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 inline-flex items-center gap-0.5">
                                <Check size={10} strokeWidth={3} />
                                Listo
                              </span>
                            ) : (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                                Opcional
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-xs font-medium text-slate-500 tabular-nums">
                              {rightHint}
                            </span>
                            {canCollapse && (
                              <ChevronDown
                                size={15}
                                className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-slate-700' : ''}`}
                              />
                            )}
                          </div>
                        </div>

                        {/* Resumen compacto solo cuando hay >3 grupos y está plegado */}
                        {!isOpen && currentSelected.length > 0 && (
                          <p className="text-xs font-medium text-emerald-700 truncate">
                            {currentSelected.map(o => o.nombre).join(', ')}
                          </p>
                        )}

                        {/* Filas limpias de opciones en 1 columna (estilo Nordic Precision) */}
                        {isOpen && (
                          <div className="space-y-2 animate-fade-in">
                            {group.opciones?.map(opt => {
                              const isChecked = currentSelected.some(o => o.id === opt.id);
                              const isMaxReached = !isRadio && maxLimit && currentSelected.length >= maxLimit && !isChecked;
                              const optPrice = Number(opt.precio) || 0;

                              return (
                                <label
                                  key={opt.id}
                                  onClick={() => {
                                    if (isMaxReached) {
                                      addToast(`Máximo ${maxLimit} en ${group.titulo}`, 'warning');
                                      return;
                                    }
                                    if (isRadio) {
                                      handleSelectRadio(group, opt);
                                    } else {
                                      handleToggleCheckbox(group, opt);
                                    }
                                  }}
                                  style={isChecked ? {
                                    borderColor: `${brandColor}55`,
                                    backgroundColor: `${brandColor}0D`
                                  } : undefined}
                                  className={`flex min-h-11 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 transition-colors select-none ${
                                    isMaxReached
                                      ? 'cursor-not-allowed border-transparent bg-slate-100/70 opacity-50'
                                      : isChecked
                                        ? 'cursor-pointer font-semibold text-slate-950'
                                        : 'cursor-pointer border-transparent bg-[#f3f6fb] hover:bg-[#eaeff8] text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span
                                      style={isChecked ? (isRadio ? { borderColor: brandColor } : { backgroundColor: brandColor, borderColor: brandColor }) : undefined}
                                      className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center ${isRadio ? 'rounded-full' : 'rounded-[4px]'} border transition-colors ${
                                        isChecked
                                          ? (isRadio ? 'bg-white border-[1.5px]' : 'text-white')
                                          : 'border-slate-300 bg-white'
                                      }`}
                                    >
                                      {isChecked && (
                                        isRadio
                                          ? <span style={{ backgroundColor: brandColor }} className="h-2.5 w-2.5 rounded-full" />
                                          : <Check size={12} strokeWidth={3} />
                                      )}
                                    </span>
                                    <span className="text-xs sm:text-sm leading-snug text-slate-900 break-words">
                                      {!isRadio && optPrice > 0 && !String(opt.nombre || '').trim().startsWith('+')
                                        ? `+ ${opt.nombre}`
                                        : opt.nombre}
                                    </span>
                                  </div>

                                  {optPrice > 0 && (
                                    <span className="text-xs font-medium text-slate-600 tabular-nums shrink-0">
                                      +{formatMoney(optPrice)}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </section>
                    );
                  })}
                </div>
              )}

              {/* Instrucción o nota especial (Solo para delivery/online) */}
              {!isTableMode ? (
                <div className="pt-1">
                  <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    Notas o instrucciones
                  </label>
                  <input
                    type="text"
                    value={tempNote}
                    onChange={e => setTempNote(e.target.value)}
                    placeholder="Ej: salsa aparte, sin cebolla..."
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/5 sm:text-sm"
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
                  onClick={() => {
                    const remaining = hasStockLimit ? Math.max(1, maxStock - totalProductQty) : Infinity;
                    if (modalQty >= remaining) {
                      addToast(`Solo quedan ${maxStock} uds.`, 'warning');
                      return;
                    }
                    setModalQty(q => q + 1);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-black/5 active:scale-95 cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={15} />
                </button>
              </div>

              {isOutOfStock ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-2.5 px-4 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shrink-0"
                >
                  Producto agotado
                </button>
              ) : !isStoreOpen ? (
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
