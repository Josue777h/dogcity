import { useState } from 'react';
import { ShoppingCart, Plus, Minus, X, UtensilsCrossed, Image as ImageIcon } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { useCartStore, useBusinessStore } from '../../stores';

export default function ProductCard({ product, index = 0 }) {
  const business = useBusinessStore(s => s.business);
  const bid      = business?.id;
  const { carts, increment, decrement, setNote } = useCartStore();
  const cart     = carts[bid] || { quantities: {}, notes: {} };
  const qty      = cart.quantities[product.id] || 0;
  const note     = cart.notes[product.id] || '';
  const isSelected = qty > 0;
  const [showModal, setShowModal] = useState(false);
  const [imgError, setImgError] = useState(!product.image);

  if (!bid) return null;

  return (
    <>
      <article
        className={`card flex flex-col h-full bg-white overflow-hidden transition-all duration-200 border-gray-200/80 hover:shadow-md hover:border-gray-300 ${
          isSelected ? 'ring-2 ring-orange-500 border-transparent shadow-xs' : ''
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

          {/* Quantity pill on image */}
          {isSelected && (
            <div className="absolute top-2.5 right-2.5 bg-orange-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-scale-in">
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

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-gray-900 tabular-nums">
              {formatMoney(product.price)}
            </span>

            {!isSelected ? (
              <button
                onClick={() => increment(bid, product.id)}
                className="btn-primary py-1.5 px-3 text-xs font-semibold gap-1 rounded-lg"
                aria-label={`Agregar ${product.name}`}
              >
                <Plus size={14} />
                <span>Agregar</span>
              </button>
            ) : (
              <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden shadow-2xs">
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
                  onClick={() => increment(bid, product.id)}
                  className="w-7 h-7 flex items-center justify-center text-orange-600 hover:bg-orange-100/60 active:bg-orange-100 transition-colors"
                  aria-label="Sumar una unidad"
                >
                  <Plus size={13} />
                </button>
              </div>
            )}
          </div>

          {/* Quick note input when selected */}
          {isSelected && (
            <div className="mt-2.5 pt-2 border-t border-gray-100">
              <input
                type="text"
                value={note}
                onChange={e => setNote(bid, product.id, e.target.value)}
                placeholder="Instrucción (ej: sin cebolla)..."
                className="w-full text-[11px] py-1 px-2.5 rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
          )}
        </div>
      </article>

      {/* Product Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setShowModal(false)}
          />

          <div className="relative bg-white w-full max-w-md md:max-w-3xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh] md:h-[480px] animate-scale-in">
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 md:bg-gray-100 md:hover:bg-gray-200 text-white md:text-gray-800 flex items-center justify-center z-30 shadow-xs transition-colors"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>

            {/* Product Image (Left Column on Desktop, Top on Mobile) */}
            <div className="h-52 md:h-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
              {!imgError && product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                  <UtensilsCrossed size={40} className="opacity-30 mb-1" />
                  <span className="text-xs">Sin foto disponible</span>
                </div>
              )}
            </div>

            {/* Product Info (Right Column on Desktop, Bottom on Mobile) */}
            <div className="flex flex-col h-full bg-white min-h-0 overflow-hidden">
              <div className="p-5 md:p-6 flex-1 overflow-y-auto space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {product.categoria || 'Menú'}
                </p>

                <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                  {product.name}
                </h2>

                <p className="text-2xl font-black text-orange-600 tabular-nums">
                  {formatMoney(product.price)}
                </p>

                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {product.description || 'Este producto no cuenta con descripción detallada por el momento.'}
                </p>

                {/* Optional note */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Instrucciones especiales:
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={e => setNote(bid, product.id, e.target.value)}
                    placeholder="Ej: Sin salsa, bien cocido, etc."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 md:p-5 bg-gray-50 border-t border-gray-100 flex items-center shrink-0">
                {!isSelected ? (
                  <button
                    onClick={() => increment(bid, product.id)}
                    className="btn-primary w-full py-3 text-xs sm:text-sm font-bold justify-center shadow-md gap-2"
                  >
                    <Plus size={16} />
                    <span>Agregar al pedido · {formatMoney(product.price)}</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between w-full p-1.5 rounded-2xl bg-white border border-gray-200 shadow-2xs">
                    <button
                      onClick={() => decrement(bid, product.id)}
                      className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-100 active:bg-gray-200 rounded-xl transition-colors"
                      aria-label="Restar una unidad"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="text-center px-4">
                      <span className="text-base font-extrabold text-gray-900 tabular-nums">
                        {qty} {qty === 1 ? 'unidad' : 'unidades'}
                      </span>
                      <span className="block text-xs font-semibold text-orange-600 tabular-nums">
                        {formatMoney(qty * product.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => increment(bid, product.id)}
                      className="w-11 h-11 flex items-center justify-center text-white bg-orange-600 hover:bg-orange-700 active:bg-orange-800 rounded-xl transition-colors shadow-xs"
                      aria-label="Sumar una unidad"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
