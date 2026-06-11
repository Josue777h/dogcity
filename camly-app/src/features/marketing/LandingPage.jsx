import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageCircle, BarChart3, Rocket,
  ShieldCheck, Smartphone, CheckCircle2,
  Star, Check, Quote, Zap, TrendingUp, ArrowRight, Menu, X
} from 'lucide-react';
import camlyPreview from '../../assets/ejemplo.jpeg';
import SaaSLogo from '../../components/common/SaaSLogo';
import { useAnimatedCounter } from '../../lib/utils';

const FEATURE_STYLES = {
  success: 'bg-success/10 text-success shadow-success/10',
  brand: 'bg-brand/10 text-brand shadow-brand/10',
  accent: 'bg-accent/10 text-accent shadow-accent/10',
};

const FEATURES = [
  {
    icon: MessageCircle,
    title: 'Pedidos perfectos, cero errores',
    desc: 'Tus clientes arman el pedido, eligen método de entrega y te escriben al WhatsApp con toda la información ya estructurada y GPS exacto.',
    stat: '99%',
    statLabel: 'Precisión',
    color: 'success'
  },
  {
    icon: Smartphone,
    title: 'Piden en 1 click, sin apps',
    desc: 'Elimina la fricción. Solo comparten tu link, el cliente entra al menú, escoge sus productos y tú vendes. Así de simple.',
    stat: '0',
    statLabel: 'Apps requeridas',
    color: 'brand'
  },
  {
    icon: BarChart3,
    title: 'Control total de tus envíos',
    desc: 'No más libretas de papel. Acepta, despacha y asigna domiciliarios desde un panel ultra-rápido diseñado para operar bajo presión.',
    stat: '3x',
    statLabel: 'Más rápido',
    color: 'accent'
  }
];

const NAV_LINKS = [
  { label: 'Características', href: '#características' },
  { label: 'Precios', href: '#precios' },
  { label: 'Testimonios', href: '#testimonios' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const orderCount = useAnimatedCounter(500, 2000);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#fafafa] text-dark font-sans overflow-x-hidden selection:bg-brand selection:text-white">
      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 w-full z-[100] border-b transition-all duration-500 pt-safe ${scrolled ? 'navbar-scrolled' : 'bg-white/80 backdrop-blur-xl border-border/40'}`}>
        <div className="fluid-container h-16 sm:h-[80px] flex items-center justify-between gap-3">
          <SaaSLogo className="h-9 sm:h-11 shrink-0" />

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((item) => (
              <a key={item.label} href={item.href} className="text-xs font-black uppercase tracking-widest text-muted hover:text-brand transition-colors">
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/login" className="text-xs font-black uppercase tracking-widest text-muted hover:text-dark transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="btn-primary !py-2 !px-4 sm:!py-2.5 sm:!px-6 !text-[10px] sm:!text-[11px] !rounded-full shadow-xl shadow-brand/20 whitespace-nowrap">
              CREAR MI TIENDA
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2.5 bg-bg-alt rounded-xl text-dark hover:bg-border transition-colors tap-target"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-border bg-white/95 backdrop-blur-xl animate-fade-in-down">
            <div className="fluid-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-dark hover:bg-brand/5 hover:text-brand transition-colors"
                >
                  {item.label}
                </a>
              ))}
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest text-muted hover:bg-brand/5 hover:text-brand transition-colors"
              >
                Iniciar Sesión
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <header className="pt-28 sm:pt-32 lg:pt-48 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <div className="absolute top-20 right-[10%] w-[400px] h-[400px] bg-brand/15 rounded-full blur-[120px] animate-orb" />
          <div className="absolute top-60 left-[5%] w-[350px] h-[350px] bg-accent/10 rounded-full blur-[100px] animate-orb" style={{ animationDelay: '-3s' }} />
          <div className="absolute bottom-0 right-[30%] w-[250px] h-[250px] bg-brand/8 rounded-full blur-[80px] animate-float" />
        </div>

        <div className="fluid-container relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full text-dark text-[10px] font-black uppercase tracking-[0.2em] shadow-sm animate-fade-in-up stagger-1">
            <Rocket size={14} className="text-brand" />
            <span className="relative overflow-hidden">
              Únete a +5 negocios creciendo
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-[shimmer_2s_infinite]" style={{ backgroundSize: '200% 100%' }} />
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-dark tracking-tighter uppercase italic leading-[0.95] animate-fade-in-up stagger-2">
            Convierte WhatsApp en tu <span className="gradient-text pr-4">mejor vendedor.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-3">
            Ofrece un catálogo impecable. Recibe pedidos estructurados, con GPS exacto y cero confusiones directamente en tu chat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up stagger-4">
            <Link to="/registro" className="w-full sm:w-auto btn-primary animate-scale-in stagger-5 !py-4 !px-8 !text-sm !font-black shadow-2xl shadow-brand/30 hover:scale-105 transition-transform uppercase">
              EMPEZAR 7 DÍAS GRATIS
            </Link>
          </div>

          <div className="pt-8 flex items-center justify-center gap-3 animate-fade-in-up stagger-5">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-bg-alt overflow-hidden shadow-sm">
                  <img src={`https://i.pravatar.cc/100?u=camly${i}`} alt="" loading="lazy" decoding="async" width="32" height="32" />
                </div>
              ))}
            </div>
            <p className="text-sm font-bold text-muted">
              <span className="text-brand font-black">{orderCount}+</span> pedidos procesados
            </p>
          </div>
        </div>
      </header>

      {/* ── FEATURES ── */}
      <section id="características" className="py-24 bg-white border-y border-border/50 relative z-20">
        <div className="fluid-container">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-dark uppercase tracking-tighter">
              Diseñado para operar, <span className="text-brand">no para complicarte.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {FEATURES.map((feat, i) => (
              <div key={i} className="card-3d bg-[#fafafa] border border-border rounded-[2rem] p-8 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 shadow-lg ${FEATURE_STYLES[feat.color]}`}>
                  <feat.icon size={28} className="drop-shadow-sm" />
                </div>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-3xl font-black text-dark tracking-tighter">{feat.stat}</span>
                  <span className="text-[10px] font-black text-muted uppercase tracking-widest mb-1">{feat.statLabel}</span>
                </div>
                <h3 className="text-xl font-black text-dark tracking-tight leading-none mb-3">{feat.title}</h3>
                <p className="text-muted text-sm font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW ── */}
      <section className="py-32 overflow-hidden bg-dark text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-dark to-dark pointer-events-none" />

        <div className="fluid-container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 glass-dark rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
              <Star size={12} className="text-warning animate-star-pop" /> Experiencia Premium
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.95]">
              TU CATÁLOGO NUNCA <br />
              <span className="gradient-text">SE VIO TAN PROFESIONAL.</span>
            </h2>
            <p className="text-white/50 text-lg font-medium leading-relaxed max-w-md">
              No confíes tus ventas a un PDF borroso. Dale a tus clientes una experiencia de compra fluida que aumenta tu ticket promedio.
            </p>

            <ul className="space-y-4 pt-4 border-t border-white/10">
              {[
                'Interfaz limpia orientada a la conversión',
                'Colores y logos 100% adaptables a tu marca',
                'Seguimiento visual del estado del pedido',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80 font-bold text-sm">
                  <CheckCircle2 className="text-brand shrink-0" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 lg:order-2 flex justify-center">
            <div className="absolute inset-0 bg-brand/30 rounded-[3rem] blur-[120px] pointer-events-none" />

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 glass-dark rounded-2xl p-3 animate-float z-20 hidden sm:flex items-center gap-2">
              <Zap size={16} className="text-warning" />
              <span className="text-[10px] font-black uppercase tracking-widest">Pedido recibido</span>
            </div>
            <div className="absolute -bottom-2 -right-4 glass-dark rounded-2xl p-3 animate-float z-20 hidden sm:flex items-center gap-2" style={{ animationDelay: '-1.5s' }}>
              <TrendingUp size={16} className="text-success" />
              <span className="text-[10px] font-black uppercase tracking-widest">+23% ventas</span>
            </div>

            {/* Phone frame */}
            <div className="relative z-10">
              <div className="absolute inset-0 rounded-[3rem] border-[3px] border-white/20 pointer-events-none" style={{ transform: 'scale(1.08)' }} />
              <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.8rem] p-3 shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
                <div className="bg-white rounded-[2.2rem] overflow-hidden aspect-[9/16] w-[280px] sm:w-[300px]">
                  <img src={camlyPreview} className="w-full h-full object-cover" alt="App Demo" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-32 bg-[#fafafa]" id="precios">
        <div className="fluid-container max-w-5xl">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black text-dark uppercase tracking-tighter">UN SOLO PLAN, <span className="text-brand">TODO INCLUIDO</span></h2>
            <p className="text-muted font-medium max-w-xl mx-auto">Prueba 7 días gratis. Luego, una tarifa plana que se adapta a tu crecimiento.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="gradient-border p-[2px] rounded-[2.5rem] shadow-2xl shadow-brand/20">
              <div className="bg-dark rounded-[2.45rem] p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-8 px-4 py-2 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-b-xl shadow-lg animate-ribbon flex items-center gap-1.5">
                  <Star size={10} className="fill-white" /> MÁS POPULAR
                </div>

                <div className="space-y-6 mb-8 mt-4 relative z-10 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-brand uppercase tracking-tight">Profesional</h3>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-2 justify-center sm:justify-start">
                    <span className="text-7xl font-black tracking-tighter text-white leading-none">$15</span>
                    <span className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1.5">USD / mes</span>
                  </div>
                  <p className="text-sm text-white/60 font-medium pr-4">La solución definitiva para negocios que exigen rendimiento, control y una imagen estelar en WhatsApp.</p>
                </div>

                <ul className="space-y-4 mb-10 pt-8 border-t border-white/10 relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  {[
                    'Incorpora colores y logo de marca',
                    'Seguimiento GPS exacto del cliente',
                    'Gestión de equipo de domiciliarios',
                    'Productos y categorías ilimitadas',
                    'Métricas y estadísticas de ventas',
                    'Sin límite de pedidos mensuales',
                    'Soporte directo'
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-4 text-sm font-bold text-white">
                      <Check size={18} className="text-brand shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="relative z-10 flex flex-col gap-3">
                  <Link to="/registro" className="w-full btn-primary !py-5 shadow-xl shadow-brand/30 inline-flex justify-center text-sm hover:scale-105 transition-transform uppercase">
                    INICIAR 7 DÍAS GRATIS
                  </Link>
                  <p className="text-center text-[10px] text-white/40 font-black uppercase tracking-widest">
                    SIN TARJETA DE CRÉDITO. CANCELA CUANDO QUIERAS.
                  </p>
                </div>

                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand/20 rounded-full blur-[80px] pointer-events-none group-hover:bg-brand/30 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section id="testimonios" className="py-20 bg-white border-t border-border/50">
        <div className="fluid-container text-center max-w-3xl mx-auto space-y-8">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map(i => (
              <Star key={i} size={20} className="text-warning fill-warning animate-star-pop" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
          <Quote size={36} className="text-brand/20 mx-auto" />
          <h2 className="text-xl md:text-3xl font-black text-dark tracking-tight leading-tight italic">
            "Desde que uso CAMLY, no se me ha vuelto a perder un solo pedido. Mis clientes lo aman y despachamos el doble de rápido."
          </h2>
          <div className="pt-2 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-brand/20 shadow-lg">
              <img src="https://i.pravatar.cc/150?u=andres" alt="Andrés Gómez" className="w-full h-full object-cover" loading="lazy" decoding="async" width="64" height="64" />
            </div>
            <div>
              <p className="font-black text-dark uppercase tracking-widest text-sm">Andrés Gómez</p>
              <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Fundador, Burger Express</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="fluid-container text-center bg-dark text-white rounded-[3rem] p-14 md:p-24 relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/20 rounded-full blur-[120px]" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-brand/15 via-transparent to-transparent" />
          </div>
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.95]">
              SISTEMATIZA TUS <br /> VENTAS HOY.
            </h2>
            <p className="text-white/60 text-lg font-medium">
              Crea tu tienda en minutos, comparte tu link, y mira cómo comienzan a caer los pedidos organizados directamente a tu WhatsApp.
            </p>
            <Link to="/registro" className="btn-primary !py-5 !px-10 !text-sm !rounded-2xl shadow-2xl shadow-brand/40 inline-flex hover:scale-105 transition-transform uppercase">
              INICIAR 7 DÍAS GRATIS <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-16 bg-white border-t border-border">
        <div className="fluid-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <SaaSLogo className="h-8" />
              <p className="text-sm text-muted font-medium max-w-xs leading-relaxed">
                La plataforma definitiva para convertir WhatsApp en tu canal de ventas más poderoso.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-dark mb-4">Producto</h4>
              <ul className="space-y-2">
                {['Características', 'Precios', 'Demo'].map(link => (
                  <li key={link}><a href={`#${link.toLowerCase()}`} className="text-sm text-muted hover:text-brand transition-colors font-medium">{link}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-dark mb-4">Legal</h4>
              <ul className="space-y-2">
                {['Términos', 'Privacidad', 'Soporte'].map(link => (
                  <li key={link}><span className="text-sm text-muted hover:text-brand transition-colors font-medium cursor-pointer">{link}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
              © 2026 CAMLY SAAS LATAM.
            </p>
            <div className="flex items-center gap-2 text-muted">
              <ShieldCheck size={14} className="text-success" />
              <span className="text-[10px] font-black uppercase tracking-widest">Conexión Segura SSL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
