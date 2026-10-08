import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, Copy, CheckCircle2, ExternalLink, ArrowRight
} from 'lucide-react';
import { useBusinessStore, useToastStore } from '../../stores';
import SaaSLogo from '../../components/common/SaaSLogo';

export default function WelcomePage() {
  const { business } = useBusinessStore();
  const addToast = useToastStore(s => s.addToast);
  const [copied, setCopied] = useState(false);

  const slug = business?.nombre || 'mi-tienda';
  const businessName = business?.nombre_visible || 'Tu negocio';
  const storeUrl = `${window.location.origin}/${slug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    addToast('Enlace copiado al portapapeles', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg mx-auto space-y-5 animate-fade-in">
        
        {/* Top Logo */}
        <div className="flex justify-center">
          <SaaSLogo className="h-7" />
        </div>

        {/* Panel Principal */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
              <Store size={16} />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                {businessName}
              </h1>
              <p className="text-[11px] text-gray-500">Tienda configurada y activa</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            Tu catálogo público está listo. Puedes compartir el enlace con tus clientes para recibir pedidos organizados o ingresar a tu panel de administración.
          </p>

          {/* Enlace público */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              Enlace público para clientes
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={storeUrl}
                className="input-field text-xs bg-white py-1.5 px-2.5 font-mono text-gray-800 flex-1 min-w-0"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold shrink-0"
              >
                {copied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                <span>{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
              <a
                href={storeUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost p-1.5 text-gray-500 hover:text-gray-900 shrink-0"
                title="Abrir tienda en nueva pestaña"
              >
                <ExternalLink size={15} />
              </a>
            </div>
          </div>

          {/* Acciones de Navegación */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              to="/admin"
              className="btn-primary py-2 px-4 text-xs font-semibold justify-center flex-1 shadow-2xs"
            >
              <span>Ir al Panel de Administración</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              to={`/${slug}`}
              className="btn-secondary py-2 px-4 text-xs font-semibold justify-center flex-1"
            >
              <span>Ver Catálogo</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
