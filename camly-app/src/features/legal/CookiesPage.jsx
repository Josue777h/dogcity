import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie } from 'lucide-react';
import SEO from '../../components/common/SEO';
import SaaSLogo from '../../components/common/SaaSLogo';

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <SEO title="Cookies y almacenamiento local | NEGU" description="Información sobre cookies, almacenamiento local y tecnologías similares que usa NEGU." canonical="https://negu.pro/cookies" />
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" aria-label="Inicio NEGU"><SaaSLogo className="h-8" /></Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950"><ArrowLeft size={16} /> Inicio</Link>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.14em] text-sky-700"><Cookie size={16} /> Preferencias del navegador</div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Cookies y almacenamiento local</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Vigente desde el 20 de octubre de 2026 · Versión 1.0.</p>
          <div className="mt-7 space-y-6 text-sm leading-6 text-slate-600">
            <section><h2 className="text-lg font-bold text-slate-950">Qué utiliza actualmente NEGU</h2><p className="mt-2">La aplicación utiliza almacenamiento local del navegador para mantener la sesión iniciada y recordar funciones necesarias, como el carrito, preferencias del panel y borradores. Son datos guardados en tu dispositivo; no son cookies publicitarias. La autenticación y la operación de la aplicación dependen de estos elementos.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">Cookies de publicidad o analítica</h2><p className="mt-2">En la revisión del código actual no encontramos herramientas propias de publicidad, píxeles de seguimiento ni plataformas de analítica que instalen cookies opcionales. Por esa razón la aplicación no muestra un banner de consentimiento para cookies. Si incorporamos tecnologías no esenciales, actualizaremos esta política y pediremos la elección correspondiente antes de activarlas.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">Servicios externos</h2><p className="mt-2">La aplicación carga tipografías de Google Fonts y, en ciertas pantallas, mapas o geocodificación. Al usar esos servicios, el navegador realiza solicitudes a sus proveedores, quienes pueden recibir información técnica como la dirección IP. Los enlaces a WhatsApp se abren cuando la persona decide utilizarlos. Consulta la <Link className="font-semibold text-sky-800 underline underline-offset-2" to="/privacidad">Política de privacidad</Link> para ver más información.</p></section>
            <section><h2 className="text-lg font-bold text-slate-950">Cómo borrar datos del navegador</h2><p className="mt-2">Puedes borrar el almacenamiento del sitio desde la configuración de privacidad de tu navegador. Si lo haces, la sesión puede cerrarse y perderás carritos o preferencias guardadas localmente. Para cerrar una cuenta o solicitar una gestión de datos almacenados por NEGU, contacta al titular por el canal indicado en la política de privacidad.</p></section>
          </div>
        </div>
        <footer className="flex justify-center gap-5 py-7 text-xs text-slate-500"><Link className="hover:text-sky-800" to="/terminos">Términos</Link><Link className="hover:text-sky-800" to="/privacidad">Privacidad</Link></footer>
      </div>
    </main>
  );
}
