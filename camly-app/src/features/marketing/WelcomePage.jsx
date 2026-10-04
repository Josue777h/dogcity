import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PartyPopper, ArrowRight, LayoutDashboard, Share2,
  Smartphone, Copy, CheckCircle2, Sparkles, Store, ExternalLink
} from 'lucide-react';
import { useBusinessStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';

export default function WelcomePage() {
  const { business } = useBusinessStore();
  const addToast = useToastStore(s => s.addToast);
  const [copied, setCopied] = useState(false);

  const slug = business?.nombre || 'mi-tienda';
  const businessName = business?.nombre_visible || 'tu negocio';
  const storeUrl = `${window.location.origin}/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    addToast('¡Enlace de tu tienda copiado al portapapeles!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in-up">
        
        {/* Top SaaS Logo */}
        <div className="flex justify-center">
          <SaaSLogo className="h-8" />
        </div>

        {/* Main Card */}
        <div className="card p-6 sm:p-10 shadow-xl border-gray-200/80 bg-white text-center relative overflow-hidden">
          {/* Subtle top celebration accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600" />
          
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-5 shadow-sm">
            <PartyPopper size={32} />
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">
            Tienda creada exitosamente
          </p>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            ¡Felicitaciones! {businessName} está en línea
          </h1>
          <p className="text-sm text-gray-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Tu catálogo digital ya está listo para recibir pedidos con ubicación GPS y enviarlos directo a tu WhatsApp.
          </p>

          {/* Public Link Box */}
          <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="min-w-0 w-full sm:w-auto">
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Tu enlace público para clientes</p>
              <p className="text-sm font-semibold text-gray-900 truncate font-mono mt-0.5">
                {storeUrl}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="btn-secondary py-2 px-3 text-xs w-full sm:w-auto justify-center font-semibold"
              >
                {copied ? <CheckCircle2 size={14} className="text-emerald-600" /> : <Copy size={14} />}
                <span>{copied ? 'Copiado' : 'Copiar enlace'}</span>
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost p-2 text-gray-500 hover:text-gray-900"
                title="Abrir en pestaña nueva"
              >
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Quick steps to start */}
          <div className="mt-8 text-left border-t border-gray-100 pt-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Primeros pasos recomendados</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 border-l-2 border-l-blue-600 text-xs space-y-1">
                <span className="font-bold text-gray-900">1. Sube productos</span>
                <p className="text-gray-500">Agrega fotos, precios y descripciones de tu menú.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 border-l-2 border-l-blue-600 text-xs space-y-1">
                <span className="font-bold text-gray-900">2. Personaliza</span>
                <p className="text-gray-500">Ajusta tu logo, banner y colores de marca.</p>
              </div>
              <div className="p-3.5 rounded-xl bg-white border border-gray-200 border-l-2 border-l-blue-600 text-xs space-y-1">
                <span className="font-bold text-gray-900">3. Comparte tu link</span>
                <p className="text-gray-500">Pégalo en tu bio de Instagram y estados de WhatsApp.</p>
              </div>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              to="/admin"
              className="btn-primary py-3 px-5 text-sm font-semibold justify-center shadow-md"
            >
              <LayoutDashboard size={18} />
              <span>Ir al Panel de Administración</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to={`/${slug}`}
              className="btn-secondary py-3 px-5 text-sm font-semibold justify-center"
            >
              <Smartphone size={18} />
              <span>Ver mi catálogo en vivo</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
