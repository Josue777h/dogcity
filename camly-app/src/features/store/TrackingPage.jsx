import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Package, CheckCircle2, Clock, Truck,
  AlertCircle, ArrowLeft, Store, MessageCircle,
  MapPin, ShoppingCart, Loader2, Sparkles
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { formatMoney, isDeliveryPending, getOrderSubtotal } from '../../lib/utils';

const STEPS = [
  { id: 'nuevo', label: 'Recibido', desc: 'Confirmando orden', icon: Clock },
  { id: 'preparando', label: 'En Cocina', desc: 'Preparando tu pedido', icon: Package },
  { id: 'enviado', label: 'En Camino', desc: 'El repartidor va hacia ti', icon: Truck },
  { id: 'entregado', label: 'Entregado', desc: '¡Que lo disfrutes!', icon: CheckCircle2 },
];

const DEMO_ORDER = {
  id: 1042,
  estado: 'enviado',
  cliente_nombre: 'Cliente de Prueba',
  total: 34500,
  entrega_metodo: 'envio',
  domicilio_costo: 4500,
  created_at: new Date().toISOString(),
  items: [
    { nombre: 'Burger Doble Queso & Tocineta', cantidad: 1, precio: 22000, nota: 'Sin cebolla' },
    { nombre: 'Papas Rústicas Medianas', cantidad: 1, precio: 8000 },
    { nombre: 'Gaseosa 400ml', cantidad: 1, precio: 4500 }
  ],
  negocios: {
    nombre: 'demo',
    nombre_visible: 'Burger & Grill House',
    telefono: '573143243707',
    whatsapp_contacto: '573143243707',
    theme_color: '#EA580C',
    direccion: 'Calle 10 # 4-20, Zona Centro'
  }
};

export default function TrackingPage() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id') || searchParams.get('order');
  const token = searchParams.get('token');
  const isDemo = searchParams.get('store') === 'demo' || !id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      // Si no hay ID o es demo explícita, mostrar pedido demo para preview inmediato
      if (!id || searchParams.get('store') === 'demo') {
        setOrder(DEMO_ORDER);
        setLoading(false);
        return;
      }

      try {
        let resultData = null;

        let query = getSupabase()
          .from('pedidos')
          .select(`*, negocios(nombre, nombre_visible, telefono, theme_color, color_secundario, logo_url, whatsapp_contacto, direccion)`)
          .eq('id', id);

        if (token) query = query.eq('token', token);

        const { data: joinData, error: joinError } = await query.maybeSingle();

        if (!joinError && joinData) {
          resultData = joinData;
        } else {
          let fallbackQuery = getSupabase().from('pedidos').select('*').eq('id', id);
          if (token) fallbackQuery = fallbackQuery.eq('token', token);
          const { data: fallbackData } = await fallbackQuery.maybeSingle();

          if (!fallbackData) {
            // Cargar demo como fallback amigable
            setOrder(DEMO_ORDER);
            setLoading(false);
            return;
          }

          let businessData = null;
          if (fallbackData.negocio_id) {
            const { data: bData } = await getSupabase()
              .from('negocios')
              .select('*')
              .eq('id', fallbackData.negocio_id)
              .maybeSingle();
            businessData = bData;
          }

          resultData = { ...fallbackData, negocios: businessData };
        }

        setOrder(resultData || DEMO_ORDER);
      } catch (err) {
        setOrder(DEMO_ORDER);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    if (id && !isDemo) {
      const sub = getSupabase()
        .channel(`order-track-${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${id}` }, (p) => {
          setOrder(prev => ({ ...prev, ...p.new }));
        })
        .subscribe();
      return () => sub.unsubscribe();
    }
  }, [id, token, isDemo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cargando estado del pedido...</p>
      </div>
    );
  }

  const currentOrder = order || DEMO_ORDER;
  const business = currentOrder.negocios || DEMO_ORDER.negocios;
  const items = typeof currentOrder.items === 'string' ? JSON.parse(currentOrder.items) : (currentOrder.items || []);
  const statusStr = (currentOrder.estado || currentOrder.status || 'enviado').toLowerCase();

  let currentStepIdx = STEPS.findIndex(s => s.id === statusStr);
  if (currentStepIdx === -1) {
    if (statusStr.includes('prepar') || statusStr.includes('cocin')) currentStepIdx = 1;
    else if (statusStr.includes('camino') || statusStr.includes('enviad') || statusStr.includes('despach')) currentStepIdx = 2;
    else if (statusStr.includes('entreg') || statusStr.includes('complet')) currentStepIdx = 3;
    else currentStepIdx = 0;
  }

  const deliveryPending = isDeliveryPending(currentOrder);
  const subtotal = getOrderSubtotal(currentOrder);
  const brandColor = business?.theme_color || '#EA580C';

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-10 px-4 sm:px-6">
      <div className="max-w-xl mx-auto space-y-5 animate-fade-in-up">
        
        {/* Barra superior de navegación */}
        <div className="flex items-center justify-between">
          <Link
            to={business?.nombre ? `/${business.nombre}` : '/'}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-gray-200/60"
          >
            <ArrowLeft size={15} /> Volver a la tienda
          </Link>
          
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white overflow-hidden shadow-xs"
              style={{ backgroundColor: brandColor }}
            >
              {business?.logo_url ? (
                <img src={business.logo_url} alt="" className="w-full h-full object-contain p-0.5" />
              ) : (
                <Store size={14} />
              )}
            </div>
            <span className="text-xs font-bold text-gray-800 truncate max-w-[160px]">
              {business?.nombre_visible || 'Tienda'}
            </span>
          </div>
        </div>

        {/* Tarjeta de Estado del Pedido (Sin líneas que se posen sobre los textos) */}
        <div className="card p-6 sm:p-7 bg-white shadow-md border-gray-200/80 space-y-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-2">
              Seguimiento en vivo
            </p>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">
              {STEPS[currentStepIdx]?.label || 'En Proceso'}
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Pedido #{currentOrder.id ? currentOrder.id.toString().slice(-6) : '1042'}
            </p>
          </div>

          {/* Stepper limpio sin líneas superpuestas */}
          <div className="grid grid-cols-4 gap-2 pt-2">
            {STEPS.map((step, i) => {
              const isPassed = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.id} className="flex flex-col items-center text-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isPassed
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <step.icon size={18} className={isCurrent ? 'animate-bounce' : ''} />
                  </div>
                  <span className={`text-[11px] font-bold mt-2 ${isPassed ? 'text-gray-900' : 'text-gray-400'}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-gray-400 hidden sm:block mt-0.5 leading-tight">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Aviso de estado actual */}
          <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 border-l-4 border-l-orange-500 flex items-center gap-3 text-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
              <Truck size={16} />
            </div>
            <div>
              <p className="font-bold text-gray-900">
                {deliveryPending && 'Confirmando valor del domicilio contigo por WhatsApp.'}
                {!deliveryPending && currentStepIdx === 0 && 'Tu pedido fue recibido y está en fila de atención.'}
                {!deliveryPending && currentStepIdx === 1 && 'Tu orden ya se está cocinando y preparando.'}
                {!deliveryPending && currentStepIdx === 2 && 'El repartidor está en ruta hacia tu dirección.'}
                {!deliveryPending && currentStepIdx === 3 && '¡Tu pedido fue entregado con éxito!'}
              </p>
              <p className="text-gray-500 mt-0.5">Sincronizado automáticamente con la tienda.</p>
            </div>
          </div>
        </div>

        {/* Detalle del Pedido */}
        <div className="card overflow-hidden bg-white shadow-sm border-gray-200/80">
          <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center gap-2">
            <ShoppingCart size={15} className="text-gray-500" />
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Productos pedidos
            </h2>
          </div>

          <div className="p-5 divide-y divide-gray-100 text-xs">
            {Array.isArray(items) && items.map((item, idx) => {
              const qty = item.cantidad ?? item.quantity ?? 1;
              const name = item.nombre ?? item.name ?? 'Producto';
              const price = item.precio ?? item.price ?? 0;
              return (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-gray-900">{qty}× {name}</span>
                    {item.nota && (
                      <p className="text-[11px] text-gray-500 italic mt-0.5">Nota: {item.nota}</p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-700 tabular-nums shrink-0">
                    {formatMoney(price * qty)}
                  </span>
                </div>
              );
            })}

            <div className="pt-3 mt-2 space-y-1.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold tabular-nums">{formatMoney(subtotal)}</span>
              </div>

              {currentOrder.entrega_metodo === 'envio' && (
                <div className="flex justify-between">
                  <span>Costo de envío</span>
                  <span className="font-semibold tabular-nums">
                    {deliveryPending ? 'Por confirmar' : formatMoney(currentOrder.domicilio_costo || 0)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-lg font-extrabold text-orange-600 tabular-nums">
                  {formatMoney(currentOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Botón directo de ayuda por WhatsApp */}
        <div className="card p-4 bg-white shadow-xs border-gray-200/80 flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-gray-900">¿Tienes dudas con tu pedido?</p>
            <p className="text-gray-500">Contacta a la tienda directamente.</p>
          </div>
          <a
            href={`https://wa.me/${business?.whatsapp_contacto || business?.telefono || '573143243707'}`}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp py-2 px-3 text-xs font-semibold shrink-0"
          >
            <MessageCircle size={15} />
            <span>Chat de soporte</span>
          </a>
        </div>

      </div>
    </div>
  );
}
