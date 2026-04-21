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
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.src = '/images/taza.svg'; }}
        />
      </div>
      
      <div className="p-5 flex flex-col h-[220px]">
        <div className="flex-1">
          <h3 className="text-lg font-black text-dark leading-tight group-hover:text-brand transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted mt-2 line-clamp-3 leading-relaxed font-medium">
            {product.description || 'Sin descripción disponible.'}
          </p>
        </div>

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xl font-black text-brand tracking-tighter">{formatMoney(product.price)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {!isSelected ? (
              <button
                onClick={() => increment(bid, product.id)}
                className="w-full btn-primary !py-2 !text-xs !rounded-lg"
              >
                <Plus size={14} /> Agregar
              </button>
            ) : (
              <div className="flex items-center w-full bg-bg-alt rounded-lg p-1 border border-border">
                <button
                  onClick={() => decrement(bid, product.id)}
                  className="w-8 h-8 flex items-center justify-center text-brand hover:bg-white rounded-md transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center font-black text-sm">{qty}</span>
                <button
                  onClick={() => increment(bid, product.id)}
                  className="w-8 h-8 flex items-center justify-center text-brand hover:bg-white rounded-md transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>

          <div className={`transition-all duration-300 ${isSelected ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-accent/5 border border-accent/10 rounded-lg">
              <Info size={12} className="text-accent shrink-0" />
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(bid, product.id, e.target.value)}
                placeholder="¿Alguna aclaración?"
                className="w-full bg-transparent text-[11px] font-medium outline-none placeholder:text-accent/30 text-accent"
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
