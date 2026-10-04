import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, UtensilsCrossed, Check, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { useCartStore, useBusinessStore, useToastStore } from '../../stores';

export default function ProductCard({ product, index = 0 }) {
  const business = useBusinessStore(s => s.business);
  const bid      = business?.id;
  const addToast = useToastStore(s => s.addToast);

  const { carts, increment, decrement, setNote, setQuantity, setItemOptions } = useCartStore();
  const cart     = carts[bid] || { quantities: {}, notes: {}, itemOptions: {} };
  const qty      = cart.quantities[product.id] || 0;
  const note     = cart.notes[product.id] || '';
  const isSelected = qty > 0;

  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(!product.image);

  // Opciones y toppings configurados en este producto
  const hasOptions = Array.isArray(product.opciones) && product.opciones.length > 0;

  // Estado de selecciones dentro del modal de personalización
  const [selectedOptions, setSelectedOptions] = useState(() => {
    const initial = {};
    if (hasOptions) {
      product.opciones.forEach(group => {
        if (group.tipo === 'unica' && group.opciones?.length > 0) {
          // Pre-seleccionar la primera opción si es requerida
          if (group.requerido) {
            initial[group.id] = [group.opciones[0]];
          } else {
            initial[group.id] = [];
          }
        } else {
          initial[group.id] = [];
        }
      });
    }
    return initial;
  });

  const [tempNote, setTempNote] = useState(note);

  if (!bid) return null;

  // Cálculo de precio acumulado con toppings
  const extraToppingsCost = Object.values(selectedOptions)
    .flat()
    .reduce((sum, opt) => sum + (Number(opt?.precio) || 0), 0);

  const finalUnitPrice = Number(product.price) + extraToppingsCost;

  // Manejar selección única (radio / sabores)
  const handleSelectRadio = (groupId, option) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupId]: [option]
    }));
  };

  // Manejar selección múltiple (checkbox / toppings)
  const handleToggleCheckbox = (groupId, option) => {
    setSelectedOptions(prev => {
      const current = prev[groupId] || [];
      const exists = current.some(o => o.id === option.id);
      if (exists) {
        return { ...prev, [groupId]: current.filter(o => o.id !== option.id) };
      } else {
        return { ...prev, [groupId]: [...current, option] };
      }
    });
  };

  // Botón rápido en la tarjeta
  const handleCardAdd = (e) => {
    e.stopPropagation();
    if (hasOptions) {
      setShowModal(true);
    } else {
      increment(bid, product.id);
    }
  };

  // Confirmar y agregar desde el modal
  const handleConfirmCustomization = () => {
    // Validar grupos requeridos
    if (hasOptions) {
      for (const group of product.opciones) {
        const selections = selectedOptions[group.id] || [];
        if (group.requerido && selections.length === 0) {
          addToast(`Debes elegir una opción en "${group.titulo}"`, 'warning');
          return;
        }
      }
    }

    const flatOptions = Object.values(selectedOptions).flat();
    setQuantity(bid, product.id, (qty > 0 ? qty : 1));
    setItemOptions(bid, product.id, flatOptions);
    if (tempNote.trim()) {
      setNote(bid, product.id, tempNote.trim());
    }
    setShowModal(false);
    addToast(`¡${product.name} agregado al pedido!`, 'success');
  };

  return (
    <>
      <article
        className={`card flex flex-col h-full bg-white overflow-hidden transition-all duration-200 border-gray-200/80 hover:shadow-md hover:border-gray-300 ${
          isSelected ? 'ring-2 ring-blue-600 border-transparent shadow-xs' : ''
        }`}
      >
        {/* Product Image */}
        <div
          className="relative overflow-hidden cursor-pointer bg-gray-100 aspect-[4/3] group"
          onClick={() => setShowModal(true)}
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
              <UtensilsCrossed size={28} className="opacity-40 mb-1" />
              <span className="text-[10px] font-medium text-gray-400">Sin foto</span>
            </div>
          )}

          {/* Badge si tiene toppings o sabores configurados */}
          {hasOptions && (
            <div className="absolute top-2.5 left-2.5 bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Layers size={11} />
              <span>Personalizable</span>
            </div>
          )}

          {/* Quantity pill on image */}
          {isSelected && (
            <div className="absolute top-2.5 right-2.5 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-scale-in">
              {qty}
            </div>
          )}

          {/* Category pill if any */}
          {product.categoria && (
            <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
              {product.categoria}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between">
          <div className="cursor-pointer mb-2.5" onClick={() => setShowModal(true)}>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-1 mb-1">
              {product.name}
            </h3>
            {product.description && (
              <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5 sm:gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 tabular-nums truncate">
              {formatMoney(product.price)}
            </span>

            {!isSelected ? (
              <button
                onClick={handleCardAdd}
                className="btn-primary py-1.5 px-2.5 sm:px-3 text-[11px] sm:text-xs font-bold gap-1 rounded-full shrink-0 shadow-glow-blue cursor-pointer"
                aria-label={`Agregar ${product.name}`}
              >
                <Plus size={14} />
                <span>{hasOptions ? 'Elegir' : 'Agregar'}</span>
              </button>
            ) : (
              <div className="flex items-center rounded-full border border-gray-200 bg-gray-50 overflow-hidden shadow-2xs">
                <button
                  onClick={() => decrement(bid, product.id)}
                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200/60 active:bg-gray-200 transition-colors"
                  aria-label="Restar una unidad"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-xs font-bold text-gray-900 tabular-nums">
                  {qty}
                </span>
                <button
                  onClick={() => {
                    if (hasOptions) setShowModal(true);
                    else increment(bid, product.id);
                  }}
                  className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200/60 active:bg-gray-200 transition-colors"
                  aria-label="Sumar una unidad"
                >
                  <Plus size={13} />
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

          <div className="relative bg-white w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in max-h-[90vh] flex flex-col border border-gray-200">
            
            {/* Botón cerrar */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center z-30 shadow-xs transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={17} />
            </button>

            {/* Cabecera con imagen si existe */}
            <div className="relative h-44 sm:h-52 bg-gray-100 shrink-0 overflow-hidden flex items-center justify-center">
              {!imgError && product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <UtensilsCrossed size={36} className="opacity-30 mb-1" />
                  <span className="text-xs">Sin foto</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full inline-block mb-1">
                  {product.categoria || 'Menú'}
                </span>
                <h2 className="text-lg sm:text-xl font-black leading-tight drop-shadow-sm">
                  {product.name}
                </h2>
              </div>
            </div>

            {/* Cuerpo desplazable con opciones */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {product.description && (
                <p className="text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}

              {/* Grupos de opciones (Sabores / Toppings) */}
              {hasOptions && (
                <div className="space-y-4 pt-2">
                  {product.opciones.map(group => {
                    const isRadio = group.tipo === 'unica';
                    const currentSelected = selectedOptions[group.id] || [];

                    return (
                      <div key={group.id} className="p-3.5 rounded-2xl bg-[#F8F9FA] border border-gray-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-gray-900 text-xs sm:text-[13px]">
                            {group.titulo}
                          </h4>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            group.requerido 
                              ? 'bg-amber-100 text-amber-800' 
                              : 'bg-gray-200/70 text-gray-600'
                          }`}>
                            {group.requerido ? 'Obligatorio' : 'Opcional'}
                          </span>
                        </div>

                        {/* Opciones dentro del grupo */}
                        <div className="space-y-1.5">
                          {group.opciones?.map(opt => {
                            const isChecked = isRadio 
                              ? currentSelected.some(o => o.id === opt.id)
                              : currentSelected.some(o => o.id === opt.id);

                            return (
                              <label
                                key={opt.id}
                                onClick={() => isRadio ? handleSelectRadio(group.id, opt) : handleToggleCheckbox(group.id, opt)}
                                className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked 
                                    ? 'bg-blue-50/70 border-blue-600 text-gray-950 font-bold' 
                                    : 'bg-white border-gray-200/90 text-gray-700 hover:border-gray-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-4 h-4 rounded-${isRadio ? 'full' : 'md'} border flex items-center justify-center transition-colors ${
                                    isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'
                                  }`}>
                                    {isChecked && (
                                      isRadio 
                                        ? <div className="w-1.5 h-1.5 rounded-full bg-white" /> 
                                        : <Check size={11} strokeWidth={3} />
                                    )}
                                  </div>
                                  <span className="text-xs">{opt.nombre}</span>
                                </div>

                                <span className={`text-xs tabular-nums ${Number(opt.precio) > 0 ? 'text-blue-600 font-bold' : 'text-gray-400 font-medium'}`}>
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
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-900 mb-1">
                  Notas especiales para este producto:
                </label>
                <input
                  type="text"
                  value={tempNote}
                  onChange={e => setTempNote(e.target.value)}
                  placeholder="Ej: Salsa aparte, bien caliente, etc."
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-[#FAFAF8] focus:bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Footer con precio dinámico y botón de confirmación */}
            <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[11px] text-gray-400 font-semibold block">Total producto</span>
                <span className="text-lg sm:text-xl font-black text-gray-950 tabular-nums">
                  {formatMoney(finalUnitPrice)}
                </span>
              </div>

              <button
                onClick={handleConfirmCustomization}
                className="btn-primary py-3 px-6 text-xs sm:text-sm font-bold justify-center rounded-full shadow-glow-blue gap-2 flex-1 sm:flex-none cursor-pointer"
              >
                <Plus size={16} />
                <span>Agregar al pedido</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
