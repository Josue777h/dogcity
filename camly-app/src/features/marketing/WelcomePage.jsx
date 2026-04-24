import { Link } from 'react-router-dom';
import { PartyPopper, ArrowRight, Store, LayoutDashboard, Share2, Smartphone } from 'lucide-react';
import { useBusinessStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';

export default function WelcomePage() {
  const { business } = useBusinessStore();
  const slug = business?.nombre || 'tu-tienda';

  return (
    <div className="min-h-screen bg-bg-alt flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/5 via-bg-alt to-bg-alt">
      <div className="w-full max-w-2xl text-center space-y-12 animate-in zoom-in-95 duration-700">
        
        <div className="space-y-6">
           <SaaSLogo className="w-full flex justify-center h-20 mb-8" />
           <div className="w-24 h-24 bg-brand rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl shadow-brand/30 animate-bounce">
              <PartyPopper size={48} />
           </div>
           <h2 className="text-4xl md:text-5xl font-black text-dark tracking-tighter uppercase italic">
             ¡BIENVENIDO A <span className="text-brand">CAMLY!</span>
           </h2>
           <p className="text-lg text-muted font-bold tracking-widest uppercase opacity-60">
             Tu negocio ya está en línea y listo para vender.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <Link 
            to="/admin" 
            className="premium-card !p-8 flex flex-col items-center gap-6 group hover:border-brand/40 hover:-translate-y-2"
           >
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-all">
                 <LayoutDashboard size={32} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-dark uppercase tracking-tight">Administrar Panel</h3>
                 <p className="text-sm text-muted mt-2">Configura tus productos, mira tus pedidos y más.</p>
              </div>
              <div className="text-brand font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                 ENTRAR AHORA <ArrowRight size={14} />
              </div>
           </Link>

           <Link 
            to={`/${slug}`} 
            className="premium-card !p-8 flex flex-col items-center gap-6 group hover:border-accent/40 hover:-translate-y-2"
           >
              <div className="w-16 h-16 bg-accent/10 text-accent rounded-2xl flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all">
                 <Smartphone size={32} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-dark uppercase tracking-tight">Ver mi Tienda</h3>
                 <p className="text-sm text-muted mt-2">Mira cómo tus clientes verán el catálogo.</p>
              </div>
              <div className="text-accent font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                 EXPLORAR <ArrowRight size={14} />
              </div>
           </Link>
        </div>

        <div className="pt-12 border-t border-border flex flex-col sm:flex-row items-center justify-center gap-8">
           <div className="flex items-center gap-3 text-muted">
              <Share2 size={18} />
              <span className="text-xs font-black uppercase tracking-widest">Comparte tu link:</span>
              <span className="bg-white border border-border px-3 py-1 rounded-lg text-xs font-bold text-dark">
                camly.app/{slug}
              </span>
           </div>
        </div>

      </div>
    </div>
  );
}
