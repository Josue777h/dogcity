import { Link } from 'react-router-dom';
import { 
  ShoppingBag, MessageCircle, BarChart3, Rocket, 
  ShieldCheck, Smartphone, CheckCircle2, ArrowRight,
  Store, Users, Zap, Star
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-dark font-sans overflow-x-hidden">
      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-[100] border-b border-border/50">
        <div className="fluid-container h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand/20">
              <ShoppingBag size={22} />
            </div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none">CAMLY</h1>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <Link to="/admin" className="text-sm font-black uppercase tracking-widest text-muted hover:text-brand transition-colors hidden sm:block">
              Entrar
            </Link>
            <Link to="/registro" className="btn-primary !py-2.5 !px-6 !text-xs !rounded-full shadow-xl shadow-brand/20">
              CREAR MI TIENDA
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <header className="pt-40 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-full pointer-events-none select-none">
           <div className="absolute top-20 -right-20 w-96 h-96 bg-brand/10 rounded-full blur-[120px]" />
           <div className="absolute bottom-20 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="fluid-container relative z-10 text-center space-y-8">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand/5 border border-brand/10 rounded-full text-brand text-[10px] font-black uppercase tracking-[0.2em] animate-bounce">
              <Zap size={14} /> La App de pedidos #1 en Latam
           </div>
           
           <h2 className="text-5xl md:text-7xl font-black text-dark tracking-tighter uppercase italic leading-[0.9] max-w-4xl mx-auto">
             VENDE POR <span className="text-brand">WHATSAPP</span> <br />
             COMO UNA <span className="text-accent">STARTUP PRO.</span>
           </h2>

           <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed">
             Transforma tu catálogo en una tienda profesional. Recibe pedidos organizados, 
             ubicación GPS y pagos confirmados directamente en tu WhatsApp.
           </p>

           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link to="/registro" className="w-full sm:w-auto btn-primary !py-5 !px-10 !text-base shadow-2xl shadow-brand/30">
                EMPEZAR GRATIS <ArrowRight size={20} />
              </Link>
              <div className="flex -space-x-3 items-center ml-4">
                 {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-4 border-white shadow-sm" alt="user" />)}
                 <div className="pl-4 text-left">
                    <p className="text-xs font-black text-dark leading-none">+500 negocios</p>
                    <div className="flex gap-0.5 mt-1 text-warning">
                       {[1,2,3,4,5].map(i => <Star key={i} size={10} fill="currentColor" />)}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </header>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="py-24 bg-bg-alt/30">
        <div className="fluid-container">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: MessageCircle, 
                  title: 'Vía WhatsApp', 
                  desc: 'Tus clientes te escriben con el pedido ya armado y su dirección exacta.',
                  color: 'success'
                },
                { 
                  icon: BarChart3, 
                  title: 'Panel de Control', 
                  desc: 'Gestiona stock, precios y estados de entrega desde un solo lugar.',
                  color: 'brand'
                },
                { 
                  icon: Smartphone, 
                  title: '100% Mobile', 
                  desc: 'Tus clientes no necesitan descargar nada. Todo funciona desde el navegador.',
                  color: 'accent'
                }
              ].map((feat, i) => (
                <div key={i} className="premium-card !p-8 group hover:-translate-y-2">
                   <div className={`w-14 h-14 bg-${feat.color}/10 text-${feat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                      <feat.icon size={28} />
                   </div>
                   <h3 className="text-xl font-black text-dark uppercase tracking-tight mb-3">{feat.title}</h3>
                   <p className="text-muted text-sm font-medium leading-relaxed">{feat.desc}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ───────────────────────────────────── */}
      <section className="py-24 overflow-hidden">
        <div className="fluid-container grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
           <div className="space-y-8">
              <h2 className="text-4xl font-black text-dark uppercase tracking-tighter leading-none">
                DISEÑADO PARA <br />
                <span className="text-brand">CONVERTIR VISITAS</span> EN PEDIDOS.
              </h2>
              <ul className="space-y-4">
                 {[
                   'Interfaz limpia y profesional',
                   'Seguimiento de pedidos en tiempo real',
                   'Ubicación GPS precisa para domicilios',
                   'Soporte multi-tenancy (Crea múltiples tiendas)'
                 ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-dark font-bold">
                      <CheckCircle2 className="text-success" size={20} /> {item}
                   </li>
                 ))}
              </ul>
              <Link to="/registro" className="inline-flex items-center gap-2 text-brand font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform">
                CONOCER TODOS LOS PLANES <ArrowRight size={18} />
              </Link>
           </div>
           
           <div className="relative">
              <div className="absolute inset-0 bg-brand/20 rounded-[3rem] blur-[100px] pointer-events-none" />
              <div className="relative bg-dark rounded-[2.5rem] border-[12px] border-dark shadow-2xl overflow-hidden aspect-[9/16] w-full max-w-[320px] mx-auto scale-110 lg:scale-125">
                 <img 
                  src="/images/taza.svg" 
                  className="w-full h-full object-cover opacity-20 grayscale" 
                  alt="Demo APP" 
                />
                <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-white/40">
                   <div className="space-y-4">
                      <Smartphone size={48} className="mx-auto" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Vista Previa de Tienda</p>
                   </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* ── CTA FOOTER ────────────────────────────────────── */}
      <section className="py-24">
        <div className="fluid-container text-center bg-dark text-white rounded-[3rem] p-12 md:p-24 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand rounded-full blur-[100px] opacity-20" />
           <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic leading-none">
                ¿LISTO PARA ESCALAR <br /> TU NEGOCIO?
              </h2>
              <p className="text-white/60 text-lg font-medium max-w-xl mx-auto">
                No pagues comisiones por venta. CAMLY es tu plataforma propia 
                para crecer sin límites.
              </p>
              <Link to="/registro" className="btn-primary !py-6 !px-12 !text-lg !rounded-2xl shadow-2xl shadow-brand/40 inline-flex">
                CREAR CUENTA AHORA
              </Link>
           </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border/50">
        <div className="fluid-container flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white">
                <ShoppingBag size={18} />
              </div>
              <h1 className="text-sm font-black tracking-tighter uppercase italic">CAMLY</h1>
           </div>
           
           <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
             © 2026 CAMLY SAAS. DESARROLLADO PARA EL FUTURO DE LAS VENTAS.
           </p>

           <div className="flex gap-6">
              {['Instagram', 'Twitter', 'LinkedIn'].map(soc => (
                <span key={soc} className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-brand cursor-pointer transition-colors">{soc}</span>
              ))}
           </div>
        </div>
      </footer>
    </div>
  );
}
