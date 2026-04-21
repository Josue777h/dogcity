import { ShoppingCart, Plus, Minus, Info } from 'lucide-react';
import { formatMoney } from '../../lib/utils';
import { useCartStore, useBusinessStore } from '../../stores';

export default function ProductCard({ product }) {
  const business = useBusinessStore((s) => s.business);
  const bid = business?.id;
  
  const { carts, increment, decrement, setNote } = useCartStore();
  
  const cart = carts[bid] || { quantities: {}, notes: {} };
  const qty = cart.quantities[product.id] || 0;
  const note = cart.notes[product.id] || '';
  const isSelected = qty > 0;

  if (!bid) return null;

  return (
    <article 
      className={`premium-card group hover:border-brand/30 ${isSelected ? 'border-brand ring-1 ring-brand/10' : ''}`}
    >
      <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.src = '/images/taza.svg'; }}
        />
      </div>
      
      <div className="p-3 sm:p-5 flex flex-col h-[180px] sm:h-[220px]">
        <div className="flex-1">
          <h3 className="text-sm sm:text-lg font-black text-dark leading-tight group-hover:text-brand transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="hidden sm:block text-xs text-muted mt-2 line-clamp-3 leading-relaxed font-medium">
            {product.description || 'Sin descripción disponible.'}
          </p>
        </div>

        <div className="mt-2 sm:mt-4 space-y-2 sm:space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base sm:text-xl font-black text-brand tracking-tighter">{formatMoney(product.price)}</span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            {!isSelected ? (
              <button
                onClick={() => increment(bid, product.id)}
                className="w-full btn-primary !py-1.5 sm:!py-2 !text-[10px] sm:!text-xs !rounded-lg"
              >
                <Plus size={12} className="sm:hidden" />
                <Plus size={14} className="hidden sm:block" />
                <span>AGREGAR</span>
              </button>
            ) : (
              <div className="flex items-center w-full bg-bg-alt rounded-lg overflow-hidden border border-border">
                <button
                  onClick={() => decrement(bid, product.id)}
                  className="flex-1 h-8 flex items-center justify-center text-brand hover:bg-white transition-colors"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center font-black text-xs sm:text-sm">{qty}</span>
                <button
                  onClick={() => increment(bid, product.id)}
                  className="flex-1 h-8 flex items-center justify-center text-brand hover:bg-white transition-colors"
                >
                  <Plus size={12} />
                </button>
              </div>
            )}
          </div>

          <div className={`transition-all duration-300 ${isSelected ? 'opacity-100 h-auto' : 'opacity-0 h-0 pointer-events-none'}`}>
            <div className="flex items-center gap-2 px-2 py-1 bg-brand/5 border border-brand/10 rounded-md">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(bid, product.id, e.target.value)}
                placeholder="Nota..."
                className="w-full bg-transparent text-[10px] font-medium outline-none placeholder:text-brand/30 text-brand"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
