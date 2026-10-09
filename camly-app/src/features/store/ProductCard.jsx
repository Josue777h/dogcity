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
    if (typeof business?.footer_message === 'string' && business.footer_message.includes('CAMLY_DESIGN:')) {
      try {
        const match = business.footer_message.match(/<!--CAMLY_DESIGN:(.*?)-->/);
        if (match && match[1]) return { ...base, ...JSON.parse(match[1]) };
      } catch (err) {
        console.warn('Error parsing design config:', err);
      }
    }
    return base;
  }, [business?.footer_message]);

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
        className={`card flex flex-col h-full bg-white overflow-hidden transition-all duration-200 border-gray-200/80 hover:shadow-md hover:border-gray-300 ${
          isSelected ? 'border-transparent shadow-xs' : ''
        }`}
        style={isSelected ? { borderColor: brandColor, boxShadow: `0 0 0 2px ${brandColor}` } : {}}
      >
        {/* Product Image */}
        <div
          className="relative overflow-hidden cursor-pointer bg-gray-100 aspect-[4/3] group"
          onClick={() => hasOptions ? openCustomizationModal() : handleCardAdd()}
        >
          {!imgError && product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400 p-4">
              <PackageCheck size={28} className="opacity-40 mb-1" />
              <span className="text-[10px] font-medium text-gray-400">Sin foto</span>
            </div>
          )}

          {/* Badge si tiene opciones o personalizaciones */}
          {hasOptions && (
            <div 
              className="absolute top-2 left-2 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-1"
              style={{ backgroundColor: brandColor }}
            >
              <Layers size={10} />
              <span>Personalizable</span>
            </div>
          )}

          {/* Quantity pill on image */}
          {isSelected && (
            <div 
              className="absolute top-2 right-2 text-white text-[11px] font-bold w-5.5 h-5.5 rounded-full flex items-center justify-center shadow-md animate-scale-in"
              style={{ backgroundColor: brandColor }}
            >
              {totalProductQty}
            </div>
          )}

          {/* Category pill if any */}
          {product.categoria && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full">
              {product.categoria}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-3.5 flex flex-col flex-1 justify-between font-sans">
          <div className="cursor-pointer mb-1.5" onClick={() => hasOptions ? openCustomizationModal() : handleCardAdd()}>
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 leading-snug line-clamp-1 mb-0.5">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-[11px] sm:text-[13px] text-gray-500 line-clamp-1 sm:line-clamp-2 leading-snug">
                {product.description}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
            <span className="text-xs sm:text-base font-black text-gray-950 tabular-nums truncate">
              {formatMoney(product.price)}
            </span>

            {!isStoreOpen ? (
              <button
                type="button"
                onClick={handleCardAdd}
                className="py-1 px-2 text-[10px] sm:text-xs font-bold rounded-full shrink-0 bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed hover:bg-gray-200/70 transition-colors"
                title={storeClosedMessage || 'Tienda en pausa o cerrada temporalmente'}
              >
                Pausado
              </button>
            ) : !isSelected ? (
              <button
                onClick={handleCardAdd}
                className={`${btnProps.className} gap-1`}
                style={btnProps.style}
                aria-label={`Agregar ${product.name}`}
              >
                <Plus size={13} className="shrink-0" />
                <span>{hasOptions ? 'Elegir' : 'Agregar'}</span>
              </button>
            ) : (
              <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 overflow-hidden shadow-2xs shrink-0">
                <button
                  onClick={() => decrement(bid, product.id)}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200/60 active:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Restar una unidad"
                >
                  <Minus size={11} />
                </button>
                <span className="w-5 sm:w-6 text-center text-[11px] sm:text-sm font-bold text-gray-900 tabular-nums">
                  {totalProductQty}
                </span>
                <button
                  onClick={() => {
                    if (hasOptions) openCustomizationModal();
                    else increment(bid, product.id);
                  }}
                  className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200/60 active:bg-gray-200 transition-colors cursor-pointer"
                  aria-label="Sumar una unidad o personalizar otra"
                >
                  <Plus size={11} />
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Modal de Detalle y Personalización (Sabores & Toppings) */}
      {showModal && (
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white w-full max-w-lg rounded-t-xl sm:rounded-xl shadow-lg overflow-hidden z-10 animate-scale-in max-h-[90vh] flex flex-col border border-gray-200">
            
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2.5 right-2.5 w-7 h-7 rounded-md bg-black/40 hover:bg-black/60 text-white flex items-center justify-center z-30 transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={16} />
            </button>

            {/* Cabecera con imagen si existe */}
            <div className="relative h-40 sm:h-48 bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
              {!imgError && product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <PackageCheck size={32} className="opacity-30 mb-1" />
                  <span className="text-xs">Sin foto</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-semibold text-white/90 bg-black/40 px-2 py-0.5 rounded inline-block mb-1">
                  {product.categoria || 'Menú'}
                </span>
                <h2 className="text-base sm:text-lg font-bold leading-tight">
                  {product.name}
                </h2>
              </div>
            </div>

            {/* Cuerpo desplazable con opciones */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3.5 text-xs">
              {product.description && (
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Grupos de opciones (Sabores / Toppings) */}
              {hasOptions && (
                <div className="space-y-3 pt-0.5 font-sans">
                  {product.opciones.map(group => {
                    const isRadio = group.tipo === 'unica';
                    const currentSelected = selectedOptions[group.id] || [];
                    const maxLimit = Number(group.max_opciones) || null;

                    return (
                      <div key={group.id} className="p-3 rounded-lg bg-gray-50/70 border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">
                              {group.titulo}
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {isRadio 
                                ? 'Elige 1 opción' 
                                : maxLimit 
                                  ? `Hasta ${maxLimit} opciones (${currentSelected.length}/${maxLimit})` 
                                  : 'Elige las que desees'}
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            group.requerido 
                              ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                              : 'bg-gray-100 text-gray-600 border border-gray-200'
                          }`}>
                            {group.requerido ? 'Obligatorio' : 'Opcional'}
                          </span>
                        </div>

                        {/* Opciones dentro del grupo */}
                        <div className="space-y-1">
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
                                className={`flex items-center justify-between p-2 sm:p-2.5 rounded-md border transition-colors select-none ${
                                  isMaxReached 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-100/60 border-gray-200'
                                    : 'cursor-pointer hover:border-gray-300'
                                } ${
                                  isChecked 
                                    ? 'text-gray-950 font-medium' 
                                    : 'bg-white border-gray-200 text-gray-700'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div 
                                    style={isChecked ? { backgroundColor: brandColor, borderColor: brandColor } : {}}
                                    className={`w-4 h-4 rounded-${isRadio ? 'full' : 'sm'} border flex items-center justify-center shrink-0 transition-colors ${
                                      isChecked ? 'text-white' : 'border-gray-300 bg-white'
                                    }`}
                                  >
                                    {isChecked && (
                                      isRadio 
                                        ? <div className="w-1.5 h-1.5 rounded-full bg-white" /> 
                                        : <Check size={11} strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className="text-xs sm:text-sm text-gray-900 truncate">
                                    {opt.nombre}
                                  </span>
                                </div>

                                <span className={`text-xs tabular-nums shrink-0 ml-2 ${
                                  Number(opt.precio) > 0 ? 'text-gray-900 font-semibold' : 'text-gray-400 font-normal'
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
                <label className="block text-xs font-semibold text-gray-800 mb-1.5">
                  Notas especiales o instrucciones:
                </label>
                <input
                  type="text"
                  value={tempNote}
                  onChange={e => setTempNote(e.target.value)}
                  placeholder="Escribe indicaciones para la tienda"
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400 text-gray-900"
                />
              </div>
            </div>

            {/* Footer con precio dinámico y botón de confirmación */}
            <div className="p-3.5 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-between gap-2.5 sm:gap-4 shrink-0 pb-safe">
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
                  className={`${modalBtnProps.className} cursor-pointer hover:opacity-95`}
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
