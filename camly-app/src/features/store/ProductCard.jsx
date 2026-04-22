import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Info, X } from 'lucide-react';
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
  
  const [showModal, setShowModal] = useState(false);

  if (!bid) return null;

  return (
    <>
    <article 
      className={`premium-card group hover:border-brand/30 flex flex-col h-full ${isSelected ? 'border-brand ring-1 ring-brand/10' : ''}`}
    >
      <div 
        className="relative aspect-square sm:aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => { e.target.src = '/images/taza.svg'; }}
        />
        <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/10 transition-colors flex items-center justify-center">
           <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-dark px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm shadow-xl">
             Ver Detalles
           </span>
        </div>
      </div>
      
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <div className="flex-1 cursor-pointer" onClick={() => setShowModal(true)}>
          <h3 className="text-sm sm:text-lg font-black text-dark leading-tight group-hover:text-brand transition-colors line-clamp-2">
            {product.name}
          </h3>
          <p className="text-xs text-muted mt-2 line-clamp-2 sm:line-clamp-3 leading-relaxed font-medium">
            {product.description || 'Sin descripción disponible.'}
          </p>
          <button className="text-[10px] text-brand font-black uppercase mt-1 tracking-widest hover:underline">Ver más</button>
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

    {/* ── MODAL DETALLE DE PRODUCTO ── */}
    {showModal && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity" 
          onClick={() => setShowModal(false)}
        />
        
        {/* Modal Contenido */}
        <div className="relative bg-white w-full max-w-md md:max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[600px] animate-in zoom-in-95 duration-300">
          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-black/10 backdrop-blur-md rounded-full flex items-center justify-center text-dark hover:bg-black/20 transition-colors z-20 shadow-sm"
          >
            <X size={20} />
          </button>

          {/* Left: Image */}
          <div className="w-full md:w-1/2 h-56 md:h-full bg-bg-alt shrink-0 relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = '/images/taza.svg'; }}
            />
            {/* Soft gradient overlay for aesthetics */}
            <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10 pointer-events-none" />
          </div>

          {/* Right: Content */}
          <div className="w-full md:w-1/2 flex flex-col h-full bg-white relative z-10">
            <div className="p-6 md:p-10 flex-1 overflow-y-auto">
              <h2 className="text-2xl md:text-3xl font-black text-dark leading-tight uppercase tracking-tighter mb-2">
                {product.name}
              </h2>
              <p className="text-brand font-black text-3xl mb-8">{formatMoney(product.price)}</p>
              
              <div className="prose prose-sm prose-p:text-muted max-w-none font-medium leading-relaxed whitespace-pre-wrap">
                {product.description || 'Este producto no cuenta con descripción detallada por el momento.'}
              </div>
            </div>

            <div className="p-6 bg-bg-alt border-t border-border shrink-0">
            {!isSelected ? (
              <button
                onClick={() => { increment(bid, product.id); setShowModal(false); }}
                className="w-full btn-primary !py-4 !text-sm flex items-center justify-center gap-2 shadow-xl shadow-brand/20 transition-transform hover:scale-[1.02]"
              >
                <Plus size={18} /> AGREGAR AL CARRITO
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center flex-1 bg-white rounded-2xl overflow-hidden border border-border shadow-sm p-1">
                  <button onClick={() => decrement(bid, product.id)} className="w-12 h-12 flex items-center justify-center text-dark hover:bg-bg-alt transition-colors rounded-xl">
                    <Minus size={20} />
                  </button>
                  <span className="flex-1 text-center font-black text-lg text-brand">{qty}</span>
                  <button onClick={() => increment(bid, product.id)} className="w-12 h-12 flex items-center justify-center text-dark hover:bg-bg-alt transition-colors rounded-xl">
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-20 h-14 bg-dark text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-brand transition-colors"
                >
                  <ShoppingCart size={20} />
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
