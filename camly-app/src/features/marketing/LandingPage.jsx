import { Link } from 'react-router-dom';
import {
  ShoppingBag, MessageCircle, BarChart3, Rocket,
  ShieldCheck, Smartphone, CheckCircle2, ArrowRight,
  Store, Users, Zap, Star, Check, Quote, Globe, TrendingUp
} from 'lucide-react';
import camlyPreview from '../../assets/ejemplo.jpeg';

import saasLogo from '../../assets/saas-logo.webp';
import SaaSLogo from '../../components/common/SaaSLogo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-dark font-sans overflow-x-hidden selection:bg-brand selection:text-white">
      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-xl z-[100] border-b border-border/40">
        <div className="fluid-container h-[80px] flex items-center justify-between">
          <div className="flex items-center">
            <SaaSLogo className="h-10 sm:h-11" />
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <Link to="/admin" className="text-xs font-black uppercase tracking-widest text-muted hover:text-dark transition-colors hidden sm:block">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="btn-primary !py-2.5 !px-6 !text-[11px] !rounded-full shadow-xl shadow-brand/20">
              CREAR MI TIENDA
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION (CONVERSION FOCUSED) ───────────────────────────────────── */}
      <header className="pt-32 lg:pt-48 pb-20 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px]" />
          <div className="absolute top-40 -left-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="fluid-container relative z-10 text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-border/50 rounded-full text-dark text-[10px] font-black uppercase tracking-[0.2em] shadow-sm animate-fade-in-up stagger-1">
            <Rocket size={14} className="text-brand" /> Únete a +5 negocios creciendo
          </div>
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-black text-dark tracking-tighter uppercase italic leading-[0.95] animate-fade-in-up stagger-2">
            Convierte WhatsApp en tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-accent pr-4">mejor vendedor.</span>
          </h2>

          <p className="text-lg md:text-xl text-muted font-medium max-w-2xl mx-auto leading-relaxed animate-fade-in-up stagger-3">
            Ofrece un catálogo impecable. Recibe pedidos estructurados, con GPS exacto y cero confusiones directamente en tu chat.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-in-up stagger-4">
            <Link to="/registro" className="w-full sm:w-auto btn-primary animate-scale-in stagger-5 !py-4 !px-8 !text-sm !font-black shadow-2xl shadow-brand/30 hover:scale-105 transition-transform uppercase">
              EMPEZAR 7 DÍAS GRATIS
            </Link>
          </div>

          {/* Micro-Social Proof */}
          {/* <div className="pt-12 text-center animate-in fade-in duration-1000 delay-500">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted/60 mb-6">Negocios reales, resultados reales</p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 opacity-40 grayscale">
              <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter"><ShoppingBag size={24} /> BURGER EXPRESS</div>
              <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter"><Globe size={24} /> SNEAKER STORE</div>
              <div className="flex items-center gap-2 font-black text-xl italic tracking-tighter"><TrendingUp size={24} /> MARKET LATAM</div>
            </div>
          </div> */}
        </div>
      </header>

      {/* ── PAIN-POINT BENEFITS ───────────────────────────────────────── */}
      <section className="py-24 bg-white border-y border-border/50 relative z-20">
        <div className="fluid-container">

          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-dark uppercase tracking-tighter">
              Diseñado para operar, <span className="text-brand">no para complicarte.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: MessageCircle,
                title: 'Pedidos perfectos, cero errores',
                desc: 'Tus clientes arman el pedido, eligen método de entrega y te escriben al WhatsApp con toda la información ya estructurada y GPS exacto.',
                color: 'success'
              },
              {
                icon: Smartphone,
                title: 'Piden en 1 click, sin apps',
                desc: 'Elimina la fricción. Solo comparten tu link, el cliente entra al menú, escoge sus productos y tú vendes. Así de simple.',
                color: 'brand'
              },
              {
                icon: BarChart3,
                title: 'Control total de tus envíos',
                desc: 'No más libretas de papel. Acepta, despacha y asigna domiciliarios desde un panel ultra-rápido diseñado para operar bajo presión.',
                color: 'accent'
              }
            ].map((feat, i) => (
              <div key={i} className="bg-[#fafafa] border border-border rounded-[2rem] p-8 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 bg-${feat.color}/10 text-${feat.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                  <feat.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-dark tracking-tight leading-none mb-3">{feat.title}</h3>
                <p className="text-muted text-sm font-medium leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO PREVIEW (STARTUP FEEL) ───────────────────────────────────── */}
      <section className="py-32 overflow-hidden bg-dark text-white relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand/10 via-dark to-dark pointer-events-none" />

        <div className="fluid-container grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60">
              <Star size={12} className="text-warning" /> Experiencia Premium
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.95]">
              TU CATÁLOGO NUNCA <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand to-white">SE VIO TAN PROFESIONAL.</span>
            </h2>
            <p className="text-white/50 text-lg font-medium leading-relaxed max-w-md">
              No confíes tus ventas a un PDF borroso. Dale a tus clientes una experiencia de compra fluida que aumenta tu ticket promedio y transmite confianza inmediata.
            </p>

            <ul className="space-y-4 pt-4 border-t border-white/10">
              {[
                'Interfaz limpia orientada a la conversión',
                'Colores y logos 100% adaptables a tu marca',
                'Seguimiento visual del estado del pedido',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80 font-bold text-sm">
                  <CheckCircle2 className="text-brand" size={20} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-brand/30 rounded-[3rem] blur-[120px] pointer-events-none" />
            <div className="relative bg-white rounded-[2.5rem] border-[8px] border-white/10 shadow-2xl overflow-hidden aspect-[9/16] w-full max-w-[300px] mx-auto scale-105 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img
                src={camlyPreview}
                className="w-full h-full object-cover"
                alt="App Demo"
              />
            </div>
          </div>
        </div>
      </section>


      {/* ── PRICING SECTION ────────────────────────────────── */}
      <section className="py-32 bg-[#fafafa]" id="pricing">
        <div className="fluid-container max-w-5xl">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-4xl font-black text-dark uppercase tracking-tighter">UN SOLO PLAN, <span className="text-brand">TODO INCLUIDO</span></h2>
            <p className="text-muted font-medium max-w-xl mx-auto">Prueba 7 días gratis. Luego, una tarifa plana que se adapta a tu crecimiento. Cancela cuando quieras.</p>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* PLAN PRO ÚNICO */}
            <div className="bg-dark border-2 border-brand rounded-[2.5rem] p-10 shadow-2xl shadow-brand/20 relative overflow-hidden group">
              <div className="absolute top-6 right-6 px-3 py-1.5 bg-brand text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                ACCESO TOTAL
              </div>
              <div className="space-y-6 mb-8 mt-2 relative z-10 text-center sm:text-left">
                <h3 className="text-2xl font-black text-brand uppercase tracking-tight">Profesional</h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 justify-center sm:justify-start">
                  <span className="text-7xl font-black tracking-tighter text-white leading-none">$15</span>
                  <span className="text-sm font-bold text-white/40 uppercase tracking-widest mb-1.5">USD / mes</span>
                </div>
                <p className="text-sm text-white/60 font-medium pr-4">La solución definitiva para negocios que exigen rendimiento, control y una imagen estelar en WhatsApp.</p>
              </div>

              <ul className="space-y-4 mb-10 pt-8 border-t border-white/10 relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {[
                  'Incopora colores y logo de marca',
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
                <Link to="/registro" className="w-full btn-primary !py-5 shadow-xl shadow-brand/30 inline-flex justify-center text-sm relative z-10 hover:scale-105 transition-transform uppercase">
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
      </section>

      {/* ── TESTIMONIALS (SOCIAL PROOF) ────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-border/50">
        <div className="fluid-container text-center max-w-3xl mx-auto space-y-8">
          <Quote size={36} className="text-brand/20 mx-auto" />
          <h2 className="text-xl md:text-3xl font-black text-dark tracking-tight leading-tight italic">
            "Desde que uso CAMLY, no se me ha vuelto a perder un solo pedido. Mis clientes lo aman y despachamos el doble de rápido."
          </h2>
          <div className="pt-2">
            <p className="font-black text-dark uppercase tracking-widest text-sm">Andrés Gómez</p>
            <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Fundador, Burger Express</p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="py-24 px-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-white" />
        <div className="fluid-container text-center bg-dark text-white rounded-[3rem] p-14 md:p-24 relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-[0.95]">
              SISTEMATIZA TUS <br /> VENTAS HOY.
            </h2>
            <p className="text-white/60 text-lg font-medium">
              Crea tu tienda en minutos, comparte tu link, y mira cómo comienzan a caer los pedidos organizados directamente a tu WhatsApp.
            </p>
            <Link to="/registro" className="btn-primary !py-5 !px-10 !text-sm !rounded-2xl shadow-2xl shadow-brand/40 inline-flex hover:scale-105 transition-transform uppercase">
              INICIAR 7 DÍAS GRATIS
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="py-12 bg-white border-t border-border">
        <div className="fluid-container flex flex-col md:flex-row items-center justify-between gap-8">
          <SaaSLogo className="h-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />

          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            © 2026 CAMLY SAAS LATAM.
          </p>

          <div className="flex gap-6">
            {['Soporte', 'Términos', 'Privacidad'].map(link => (
              <span key={link} className="text-[10px] font-black uppercase tracking-widest text-muted hover:text-brand cursor-pointer transition-colors">{link}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
