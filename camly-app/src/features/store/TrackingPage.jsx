import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Package, CheckCircle2, Clock, Truck, 
  AlertCircle, ArrowLeft, Store, MessageCircle,
  MapPin, ShoppingCart, Loader2
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { formatMoney } from '../../lib/utils';

const STEPS = [
  { id: 'nuevo', label: 'Recibido', icon: Clock, color: 'brand' },
  { id: 'preparando', label: 'En Cocina', icon: Package, color: 'warning' },
  { id: 'enviado', label: 'En Camino', icon: Truck, color: 'accent' },
  { id: 'entregado', label: 'Entregado', icon: CheckCircle2, color: 'success' },
];

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const token = searchParams.get('token');

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      if (!id || !token) {
        setError('Solicitud inválida. El enlace está incompleto.');
        setLoading(false);
        return;
      }

      try {
        let resultData = null;

        // Intentar primero con la consulta relacional (si la base de datos está perfectamente conectada)
        const { data: joinData, error: joinError } = await getSupabase()
          .from('pedidos')
          .select(`*, negocios(nombre, nombre_visible, telefono, theme_color, color_secundario, logo_url, whatsapp_contacto)`)
          .eq('id', id)
          .eq('token', token)
          .single();

        if (!joinError && joinData) {
          resultData = joinData;
        } else {
          // Fallback: Si falla la relación (Error 400), buscar el pedido solo
          console.warn('Fallback tracking query due to join error:', joinError);
          const { data: fallbackData, error: fallbackError } = await getSupabase()
            .from('pedidos')
            .select('*')
            .eq('id', id)
            .eq('token', token)
            .single();

          if (fallbackError || !fallbackData) throw new Error('No pudimos encontrar tu pedido. Es posible que el enlace haya expirado.');
          
          // Intentar obtener los datos del negocio por separado si tenemos el ID
          let businessData = null;
          if (fallbackData.negocio_id) {
             const { data: bData } = await getSupabase()
               .from('negocios')
               .select('*')
               .eq('id', fallbackData.negocio_id)
               .single();
             businessData = bData;
          }
          
          resultData = { ...fallbackData, negocios: businessData };
        }
        
        setOrder(resultData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    if (id) {
      const sub = getSupabase()
        .channel(`order-track-${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${id}` }, (p) => {
          setOrder(prev => ({ ...prev, ...p.new }));
        })
        .subscribe();
      return () => sub.unsubscribe();
    }
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-alt flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-brand/20 border-t-brand rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-black text-dark uppercase tracking-tight">Rastreando Pedido...</h2>
        <p className="text-sm text-muted font-bold tracking-widest uppercase mt-2">Sincronizando con la tienda</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-bg-alt flex items-center justify-center p-6">
        <div className="w-full max-w-md premium-card !p-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
            <AlertCircle size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-dark uppercase tracking-tight">Algo salió mal</h2>
            <p className="text-sm text-muted font-medium mt-2">{error}</p>
          </div>
          <Link to="/" className="w-full btn-primary inline-flex">
            VOLVER A LA TIENDA
          </Link>
        </div>
      </div>
    );
  }

  const business = order.negocios;
  const items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
  const currentStepIdx = STEPS.findIndex(s => s.id === (order.estado || order.status));

  return (
    <div 
      className="min-h-screen bg-bg-alt bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand/5 via-bg-alt to-bg-alt p-4 sm:p-8"
      style={{ 
        '--primary-brand': business?.theme_color || '#2563EB',
        '--secondary-brand': business?.color_secundario || '#F9FAFB'
      }}
    >
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
           <Link to="/" className="flex items-center gap-2 text-dark hover:text-brand transition-colors font-black text-xs uppercase tracking-widest">
             <ArrowLeft size={16} /> Volver
           </Link>
           <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white shadow-lg">
               {business?.logo_url ? <img src={business.logo_url} className="w-full h-full object-contain p-1" /> : <Store size={16} />}
             </div>
             <span className="text-sm font-black text-dark uppercase tracking-tighter">{business?.nombre_visible}</span>
           </div>
        </div>

        {/* Status Tracker Card */}
        <div className="premium-card !p-8 space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
          <div className="text-center">
            <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em] mb-2 leading-none">Estado del Pedido</p>
            <h3 className="text-3xl font-black text-dark tracking-tighter uppercase italic italic">
              {STEPS[currentStepIdx]?.label || 'En Proceso'}
            </h3>
            <p className="text-xs font-bold text-brand mt-1 uppercase tracking-widest opacity-60">Pedido #{order.id.toString().slice(-6)}</p>
          </div>

          {/* Real Stepper */}
          <div className="relative pt-4 px-2">
             {/* Background Line */}
             <div className="absolute top-[38px] left-0 w-full h-1 bg-border rounded-full" />
             <div 
               className="absolute top-[38px] left-0 h-1 bg-brand rounded-full transition-all duration-1000" 
               style={{ width: `${(currentStepIdx / (STEPS.length - 1)) * 100}%` }}
             />

             <div className="relative flex justify-between">
                {STEPS.map((step, i) => {
                  const isActive = i <= currentStepIdx;
                  const isCurrent = i === currentStepIdx;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-3">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl
                          ${isActive ? 'bg-brand text-white shadow-brand/30' : 'bg-white text-muted border border-border shadow-md'}`}>
                         <step.icon size={20} className={isCurrent ? 'animate-pulse' : ''} />
                       </div>
                       <span className={`text-[9px] font-black uppercase tracking-widest transition-colors
                          ${isActive ? 'text-dark' : 'text-muted/40'}`}>
                         {step.label}
                       </span>
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-bg-alt/50 border border-border/50 rounded-2xl p-6 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center text-brand">
                <Truck size={24} className="animate-bounce" />
             </div>
             <div>
                <p className="text-xs font-black text-dark uppercase tracking-tight">
                  {order.estado === 'nuevo' && 'Estamos revisando tu pedido...'}
                  {order.estado === 'preparando' && 'El chef está trabajando para tí.'}
                  {order.estado === 'enviado' && '¡El domiciliario está en camino!'}
                  {order.estado === 'entregado' && 'Esperamos que lo disfrutes.'}
                </p>
                <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-0.5">Actualizado hace un momento</p>
             </div>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="premium-card overflow-hidden">
          <div className="p-6 border-b border-border bg-bg-alt/30 flex items-center gap-3">
             <ShoppingCart size={18} className="text-muted" />
             <h4 className="text-xs font-black text-dark uppercase tracking-[0.2em]">Resumen del Pedido</h4>
          </div>
          
          <div className="p-6 divide-y divide-border">
             {items?.map((item, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-dark">{item.cantidad}x {item.nombre}</span>
                      {item.nota && <span className="text-[10px] text-muted italic mt-0.5">Nota: {item.nota}</span>}
                   </div>
                   <span className="text-sm font-black text-dark opacity-40">{formatMoney(item.precio * item.cantidad)}</span>
                </div>
             ))}
             <div className="pt-6 flex flex-col gap-2">
                <div className="flex justify-between items-center opacity-40 text-[10px] font-black uppercase tracking-widest">
                   <span>Subtotal</span>
                   <span>{formatMoney(order.total)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-black text-brand">
                   <span>TOTAL PAGADO</span>
                   <span>{formatMoney(order.total)}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="text-center py-6 space-y-4">
           <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">¿Alguna duda con tu pedido?</p>
           <a 
            href={`https://wa.me/${business?.whatsapp_contacto || business?.telefono || '573143243707'}`}
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-success text-white rounded-2xl font-black text-sm shadow-xl shadow-success/30 transition-all hover:scale-105 active:scale-95"
           >
             <MessageCircle size={20} /> HABLAR CON LA TIENDA
           </a>
        </div>

      </div>
    </div>
  );
}
