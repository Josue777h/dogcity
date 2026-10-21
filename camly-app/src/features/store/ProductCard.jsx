import { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Minus, X, PackageCheck, Check, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';

export default function ProductCard({ 
  product, 
  index = 0, 
  isStoreOpen = true, 
  storeClosedMessage = '' 
}) {
  const business = useBusinessStore(s => s.business);
  const bid      = business?.id;
  const addToast = useToastStore(s => s.addToast);

  const { addItem, increment, decrement } = useCartStore();
  const totalProductQty = useCartStore(s => s.getProductTotalQuantity(bid, product.id));
  const isSelected = totalProductQty > 0;

  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(!product.image);

  // Opciones y toppings configurados en este producto
  const hasOptions = Array.isArray(product.opciones) && product.opciones.length > 0;

  const getDefaultOptions = () => {
    const initial = {};
    if (hasOptions) {
      product.opciones.forEach(group => {
        initial[group.id] = [];
      });
    }
    return initial;
  };

  // Estado de selecciones dentro del modal de personalización (100% limpio desde cero)
  const [selectedOptions, setSelectedOptions] = useState(getDefaultOptions);
  const [tempNote, setTempNote] = useState('');

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

  if (!bid) return null;

  const openCustomizationModal = () => {
    setSelectedOptions(getDefaultOptions());
    setTempNote('');
    setShowModal(true);
  };

  // Cálculo de precio acumulado con toppings
  const extraToppingsCost = Object.values(selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + (Number(opt?.precio) || 0), 0);

  const finalUnitPrice = Number(product.price) + extraToppingsCost;

  // Manejar selección única (radio / sabores)
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
      addToast(`¡${product.name} agregado al pedido!`, 'success');
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
    addItem(bid, product, { options: flatOptions, note: tempNote.trim(), quantity: 1 });
    setShowModal(false);
    addToast(`¡${product.name} agregado al pedido!`, 'success');
  };

  const getAddButtonProps = () => {
    switch (buttonStyle) {
      case 'square':
        return {
          className: "py-1 px-2 sm:py-1.5 sm:px-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-none shrink-0 text-white cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-none",
          style: { backgroundColor: brandColor }
        };
      case 'soft':
        return {
          className: "py-1 px-2.5 sm:py-1.5 sm:px-3 text-[11px] sm:text-xs font-semibold rounded-md shrink-0 text-white cursor-pointer transition-all shadow-2xs active:scale-95 flex items-center justify-center",
          style: { backgroundColor: brandColor }
        };
      case 'outline':
        return {
          className: "py-0.5 px-2.5 sm:py-1 sm:px-3 text-[11px] sm:text-xs font-bold rounded-lg border-2 shrink-0 bg-white cursor-pointer transition-all active:scale-95 flex items-center justify-center shadow-2xs",
          style: { borderColor: brandColor, color: brandColor }
        };
      default: // pill
        return {
          className: "py-1 px-2.5 sm:py-1.5 sm:px-3.5 text-[11px] sm:text-xs font-bold rounded-full shrink-0 text-white cursor-pointer transition-all shadow-sm active:scale-95 flex items-center justify-center",
          style: { backgroundColor: brandColor }
        };
    }
  };

  const getModalButtonProps = () => {
    switch (buttonStyle) {
      case 'square':
        return {
          className: "py-2.5 px-4 sm:py-3 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-wider rounded-none shadow-none text-white flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0",
          style: { backgroundColor: brandColor }
        };
      case 'soft':
        return {
          className: "py-2.5 px-4 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold rounded-md shadow-2xs text-white flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0",
          style: { backgroundColor: brandColor }
        };
      case 'outline':
        return {
          className: "py-2 px-4 sm:py-2.5 sm:px-6 text-xs sm:text-sm font-bold rounded-lg border-2 bg-white flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0",
          style: { borderColor: brandColor, color: brandColor }
        };
      default: // pill
        return {
          className: "py-2.5 px-4 sm:py-3 sm:px-6 text-xs sm:text-sm font-bold rounded-full shadow-md text-white flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0",
          style: { backgroundColor: brandColor }
        };
    }
  };

  const btnProps = getAddButtonProps();
  const modalBtnProps = getModalButtonProps();

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
          className="group relative aspect-[8/5] cursor-pointer overflow-hidden bg-[#e8dfd1]"
          onClick={() => hasOptions ? openCustomizationModal() : handleCardAdd()}
        >
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-[#e8dfd1] p-4 text-slate-600">
              <PackageCheck size={21} strokeWidth={1.5} />
              <span className="text-[10px] font-medium">Foto no disponible</span>
            </div>
          )}

          {/* Badge si tiene opciones o personalizaciones */}
          {hasOptions && (
            <div 
              className="absolute left-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white"
              style={{ backgroundColor: brandColor }}
            >
              <Layers size={10} />
              <span>Personalizable</span>
            </div>
          )}

          {/* Quantity pill on image */}
          {isSelected && (
            <div 
              className="absolute right-2 top-2 flex h-7 min-w-7 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              {totalProductQty}
            </div>
          )}

          {/* Category pill if any */}
          {product.categoria && (
            <div className="absolute bottom-2 left-2 max-w-[calc(100%-1rem)] truncate rounded-md bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
              {product.categoria}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-2.5 font-sans sm:p-3">
          <div className="mb-2 min-w-0 flex-1 cursor-pointer" onClick={() => hasOptions ? openCustomizationModal() : handleCardAdd()}>
            <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-tight text-slate-900 sm:text-base">
              {product.name}
            </h3>
            {product.description && (
              <p className="line-clamp-2 text-xs leading-snug text-slate-600 sm:text-[13px]">
                {product.description}
              </p>
            )}
          </div>

          <div className="mt-auto flex flex-col gap-2 border-t border-[#f0ede7] pt-2.5">
            <span className="truncate text-sm font-bold tabular-nums text-slate-900 sm:text-base">
              {formatMoney(product.price)}
            </span>

            {!isStoreOpen ? (
              <button
                type="button"
                onClick={handleCardAdd}
                className="flex min-h-11 w-full items-center justify-center rounded-lg border border-[#e4e1da] bg-[#f2f0eb] px-3 text-xs font-semibold text-slate-500 cursor-not-allowed"
                title={storeClosedMessage || 'Tienda en pausa o cerrada temporalmente'}
              >
                Pausado
              </button>
            ) : !isSelected ? (
              <button
                onClick={handleCardAdd}
                className={`${btnProps.className} min-h-11 w-full gap-1 rounded-lg px-3 text-sm font-semibold shadow-none`}
                style={btnProps.style}
                aria-label={`Agregar ${product.name}`}
              >
                <Plus size={13} className="shrink-0" />
                <span>{hasOptions ? 'Elegir' : 'Agregar'}</span>
              </button>
            ) : (
              <div className="flex min-h-11 w-full items-center justify-between overflow-hidden rounded-lg border border-[#e1ddd5] bg-[#f7f6f2]">
                <button
                  onClick={() => decrement(bid, product.id)}
                  className="flex h-11 w-12 items-center justify-center text-slate-700 transition-colors hover:bg-black/5 active:bg-black/10"
                  aria-label="Restar una unidad"
                >
                  <Minus size={16} />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold tabular-nums text-slate-900">
                  {totalProductQty}
                </span>
                <button
                  onClick={() => {
                    if (hasOptions) openCustomizationModal();
                    else increment(bid, product.id);
                  }}
                  className="flex h-11 w-12 items-center justify-center text-slate-700 transition-colors hover:bg-black/5 active:bg-black/10"
                  aria-label="Sumar una unidad o personalizar otra"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Modal de Detalle y Personalización (Sabores & Toppings) */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-hidden p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#e1ddd5] bg-white shadow-2xl animate-scale-in max-h-[calc(100dvh-env(safe-area-inset-top,0px)-2rem)] sm:max-h-[min(88dvh,48rem)]">
            
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#e1ddd5] bg-white text-slate-600 transition-colors hover:bg-[#f7f6f2]"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            {/* Cabecera con imagen si existe */}
            <div className="flex min-h-[5.5rem] shrink-0 items-center gap-3 border-b border-[#f0ede7] bg-white px-4 py-3 pr-16 sm:min-h-28 sm:gap-4 sm:px-5">
              {!imgError && product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 shrink-0 rounded-xl border border-[#e7e3db] object-cover sm:h-20 sm:w-20"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-[#e7e3db] bg-[#f2eee7] text-slate-500 sm:h-20 sm:w-20">
                  <PackageCheck size={22} strokeWidth={1.5} />
                  <span className="text-center text-[9px] font-medium leading-tight">Sin foto</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <span className="mb-1 inline-block max-w-full truncate rounded-md bg-[#f2f0eb] px-2 py-1 text-[10px] font-semibold text-slate-600">
                  {product.categoria || 'Menú'}
                </span>
                <h2 className="line-clamp-2 text-base font-semibold leading-tight text-slate-900 sm:text-lg">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description}</p>
                )}
              </div>
            </div>

            {/* Cuerpo desplazable con opciones */}
            <div className="min-h-0 max-h-[min(48dvh,26rem)] space-y-3 overflow-y-auto overscroll-contain px-4 py-4 text-xs sm:space-y-3.5 sm:px-5 sm:py-5">
              {/* Grupos de opciones (Sabores / Toppings) */}
              {hasOptions && (
                <div className="space-y-3 pt-0.5 font-sans">
                  {product.opciones.map(group => {
                    const isRadio = group.tipo === 'unica';
                    const currentSelected = selectedOptions[group.id] || [];
                    const maxLimit = Number(group.max_opciones) || null;

                    return (
                      <div key={group.id} className="space-y-2.5 rounded-xl border border-[#e7e3db] bg-[#fbfaf8] p-3 sm:p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900">
                              {group.titulo}
                            </h4>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {isRadio 
                                ? 'Elige 1 opción' 
                                : maxLimit 
                                  ? `Hasta ${maxLimit} opciones (${currentSelected.length}/${maxLimit})` 
                                  : 'Elige las que desees'}
                            </p>
                          </div>
                          <span className={`rounded-md border px-2 py-1 text-[10px] font-semibold ${
                            group.requerido 
                              ? 'border-amber-200 bg-amber-50 text-amber-800'
                              : 'border-[#e7e3db] bg-white text-slate-600'
                          }`}>
                            {group.requerido ? 'Obligatorio' : 'Opcional'}
                          </span>
                        </div>

                        {/* Opciones dentro del grupo */}
                        <div className="space-y-1.5">
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
                                className={`flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 transition-colors select-none ${
                                  isMaxReached 
                                    ? 'cursor-not-allowed border-[#e7e3db] bg-[#f2f0eb] opacity-60'
                                    : 'cursor-pointer bg-white hover:border-slate-400'
                                } ${
                                  isChecked 
                                    ? 'font-medium text-slate-950'
                                    : 'border-[#e7e3db] text-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div 
                                    style={isChecked ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-${isRadio ? 'full' : 'sm'} border transition-colors ${
                                      isChecked ? 'text-white' : 'border-[#c9c4bb] bg-white'
                                    }`}
                                  >
                                    {isChecked && (
                                      isRadio 
                                        ? <div className="w-1.5 h-1.5 rounded-full bg-white" /> 
                                        : <Check size={11} strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className="truncate text-sm text-slate-900">
                                    {opt.nombre}
                                  </span>
                                </div>

                                <span className={`text-xs tabular-nums shrink-0 ml-2 ${
                                  Number(opt.precio) > 0 ? 'font-semibold text-slate-900' : 'font-normal text-slate-500'
                                }`}>
                                  {Number(opt.precio) > 0 ? `+${formatMoney(opt.precio)}` : 'Incluido'}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Instrucción o nota especial */}
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
            </div>

            {/* Footer con precio dinámico y botón de confirmación */}
            <div className="flex shrink-0 items-center justify-between gap-2.5 border-t border-[#e7e3db] bg-white px-4 py-3 sm:gap-4 sm:p-5 pb-safe">
              <div className="shrink-0 min-w-0 pr-1">
                <span className="text-[10px] sm:text-[11px] text-gray-400 font-semibold block uppercase tracking-wider">
                  Total producto
                </span>
                <span className="text-base sm:text-xl font-black text-gray-950 tabular-nums">
                  {formatMoney(finalUnitPrice)}
                </span>
              </div>

              {!isStoreOpen ? (
                <button
                  type="button"
                  disabled
                  className="py-2.5 px-4 text-xs font-bold rounded-xl bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed shrink-0"
                >
                  Tienda en pausa
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmCustomization}
                  style={modalBtnProps.style}
                  className={`${modalBtnProps.className} min-h-12 rounded-lg px-3 text-xs shadow-none sm:min-h-12 sm:px-5 sm:text-sm cursor-pointer hover:opacity-95`}
                >
                  <Plus size={15} className="shrink-0" />
                  <span>Agregar al pedido</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
