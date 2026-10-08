import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  Package, CheckCircle2, Clock, Truck,
  AlertCircle, ArrowLeft, Store, MessageCircle,
  MapPin, ShoppingCart, Loader2, Sparkles,
  X, RotateCcw, Copy, Check, Upload, FileText,
  ExternalLink, Ban, ChevronRight
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { formatMoney, isDeliveryPending, getOrderSubtotal } from '../../lib/utils';
import { OrderService } from '../../services/orderService';
import { getStatusCopy, getStepperSteps } from '../../lib/status-labels';
import SEO from '../../components/common/SEO';

const STEP_ICONS = [Clock, Package, Truck, CheckCircle2];

const DEMO_ORDER = {
  id: 1042,
  token: 'demo-token',
  status: 'COTIZACION_ENVIADA',
  estado: 'COTIZACION_ENVIADA',
  delivery_type: 'custom_quote',
  delivery_fee: 5500,
  domicilio_costo: 5500,
  subtotal_amount: 34500,
  total_amount: 40000,
  total: 40000,
  payment_method: 'transfer_nequi',
  payment_status: 'pending',
  nombre: 'Cliente de Prueba',
  cliente_nombre: 'Cliente de Prueba',
  entrega_metodo: 'envio',
  direccion: 'Calle 10 # 4-20, Zona Centro',
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
    direccion: 'Calle 10 # 4-20, Zona Centro',
    nequi_numero: '3143243707',
    daviplata_numero: '3143243707',
    titular_cuenta: 'Juan Pérez',
    cedula_titular: '1098765432'
  }
};

export default function TrackingPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const id = routeId || searchParams.get('id') || searchParams.get('order');
  const token = searchParams.get('token');
  const isDemo = searchParams.get('store') === 'demo' || !id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(60);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // 1. Cargar datos de la orden
  useEffect(() => {
    async function loadOrder() {
      if (!id || searchParams.get('store') === 'demo') {
        setOrder(DEMO_ORDER);
        setLoading(false);
        return;
      }

      try {
        let resultData = null;

        let query = getSupabase()
          .from('pedidos')
          .select(`*, negocios(*)`)
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
        console.error('Error cargando pedido:', err);
        setOrder(DEMO_ORDER);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    // 2. Suscripción limpia a Supabase Realtime
    if (id && !isDemo) {
      const channel = getSupabase()
        .channel(`order-track-${id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'pedidos', filter: `id=eq.${id}` },
          (payload) => {
            setOrder((prev) => (prev ? { ...prev, ...payload.new } : payload.new));
          }
        )
        .subscribe();

      return () => {
        getSupabase().removeChannel(channel);
      };
    }
  }, [id, token, isDemo, searchParams]);

  const currentOrder = order || DEMO_ORDER;
  const statusStr = (currentOrder.status || currentOrder.estado || '').toString();
  const business = currentOrder.negocios || DEMO_ORDER.negocios;
  const items = typeof currentOrder.items === 'string' ? JSON.parse(currentOrder.items) : (currentOrder.items || currentOrder.productos || []);
  const brandColor = business?.theme_color || '#EA580C';

  const subtotal = getOrderSubtotal(currentOrder);
  const deliveryFee = Number(currentOrder.delivery_fee || currentOrder.domicilio_costo || 0);
  const totalAmount = Number(currentOrder.total_amount || currentOrder.total || (subtotal + deliveryFee));

  // Ventana de gracia: contador regresivo de 30 segundos garantizado
  useEffect(() => {
    if (statusStr !== 'CONFIRMADO_GRACIA') return;

    const GRACE_PERIOD_SECONDS = 30;

    // Calcular el timestamp base
    let startMs = Date.now();
    if (currentOrder.confirmed_at) {
      const parsed = new Date(currentOrder.confirmed_at).getTime();
      if (!isNaN(parsed)) {
        const diff = (Date.now() - parsed) / 1000;
        // Si el timestamp registrado fue hace menos de 30s, respetar los segundos restantes
        if (diff >= 0 && diff < GRACE_PERIOD_SECONDS) {
          startMs = parsed;
        }
      }
    }

    const calcRemaining = () => {
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      return Math.max(0, GRACE_PERIOD_SECONDS - elapsed);
    };

    const initialRem = calcRemaining();
    setGraceSeconds(initialRem);

    if (initialRem <= 0) {
      if (!isDemo && currentOrder.id && currentOrder.token) {
        OrderService.advanceToKitchen(currentOrder.id, currentOrder.token).catch(console.error);
      }
      setOrder((prev) => prev ? { ...prev, status: 'EN_PREPARACION', estado: 'preparando' } : null);
      return;
    }

    const timer = setInterval(async () => {
      const rem = calcRemaining();
      setGraceSeconds(rem);

      if (rem <= 0) {
        clearInterval(timer);
        try {
          if (!isDemo && currentOrder.id && currentOrder.token) {
            await OrderService.advanceToKitchen(currentOrder.id, currentOrder.token);
          }
          setOrder((prev) => prev ? { ...prev, status: 'EN_PREPARACION', estado: 'preparando' } : null);
        } catch (err) {
          console.error('Error avanzando a cocina:', err);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [statusStr, currentOrder.confirmed_at, currentOrder.id, currentOrder.token, isDemo]);

  // Manejo de Aceptar Cotización
  const handleAcceptQuote = async () => {
    setActionLoading(true);
    try {
      if (!isDemo && currentOrder.id && currentOrder.token) {
        await OrderService.customerAcceptQuote(currentOrder.id, currentOrder.token);
      }
      setOrder((prev) => ({
        ...prev,
        status: 'CONFIRMADO_GRACIA',
        estado: 'CONFIRMADO_GRACIA',
        confirmed_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'No fue posible confirmar la orden.');
    } finally {
      setActionLoading(false);
    }
  };

  // Manejo de Rechazar / Cancelar por el Cliente
  const handleRejectOrCancel = async (reason = 'Cliente rechazó costo de envío') => {
    setActionLoading(true);
    try {
      if (!isDemo && currentOrder.id && currentOrder.token) {
        await OrderService.customerCancelOrder(currentOrder.id, currentOrder.token, reason);
      }
      setOrder((prev) => ({
        ...prev,
        status: 'CANCELADO',
        estado: 'cancelado',
        cancelled_by: 'customer',
        cancellation_reason: reason
      }));
      setShowCancelModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al cancelar la orden.');
    } finally {
      setActionLoading(false);
    }
  };

  // Manejo de Deshacer durante la Ventana de Gracia
  const handleUndoGrace = async () => {
    setActionLoading(true);
    try {
      if (!isDemo && currentOrder.id && currentOrder.token) {
        await OrderService.customerCancelOrder(
          currentOrder.id, 
          currentOrder.token, 
          'Cancelado por el cliente'
        );
      }
      setOrder((prev) => ({
        ...prev,
        status: 'CANCELADO',
        estado: 'cancelado',
        cancelled_by: 'customer',
        cancellation_reason: 'Cancelado por el cliente'
      }));
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al deshacer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Copiar número de cuenta al portapapeles
  const handleCopyAccount = (number, label) => {
    if (!number) return;
    navigator.clipboard.writeText(number);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  // Subir Comprobante a Supabase Storage
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptUploading(true);
    try {
      let receiptUrl = '';
      if (!isDemo && currentOrder.id && currentOrder.token) {
        receiptUrl = await OrderService.uploadPaymentReceipt(currentOrder.id, file, currentOrder.token);
      } else {
        receiptUrl = URL.createObjectURL(file);
      }

      setOrder((prev) => ({
        ...prev,
        payment_receipt_url: receiptUrl,
        payment_status: 'pending'
      }));
      setUploadSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Error al subir el comprobante. Por favor intenta de nuevo.');
    } finally {
      setReceiptUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-3 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-3" />
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Cargando estado del pedido...</p>
      </div>
    );
  }

  // Cálculo de progreso del stepper
  let currentStepIdx = 0;
  if (['EN_PREPARACION', 'preparando'].includes(statusStr)) currentStepIdx = 1;
  else if (['EN_CAMINO', 'enviado'].includes(statusStr)) currentStepIdx = 2;
  else if (['ENTREGADO', 'entregado'].includes(statusStr)) currentStepIdx = 3;

  const isCancelled = statusStr === 'CANCELADO' || statusStr === 'cancelado';
  const isQuotePending = statusStr === 'COTIZACION_PENDIENTE';
  const isQuoteSent = statusStr === 'COTIZACION_ENVIADA';
  const isGraceWindow = statusStr === 'CONFIRMADO_GRACIA';
  const isCookingOrLater = ['EN_PREPARACION', 'preparando', 'EN_CAMINO', 'enviado', 'ENTREGADO', 'entregado'].includes(statusStr);

  const isTransfer = (currentOrder.payment_method || '').includes('transfer') || 
                     (currentOrder.payment_method || '').includes('nequi') || 
                     (currentOrder.payment_method || '').includes('daviplata') ||
                     currentOrder.metodo_pago === 'transferencia';

  const nequiNumber = business?.nequi_numero || business?.telefono?.replace(/\D/g, '');
  const daviplataNumber = business?.daviplata_numero || business?.telefono?.replace(/\D/g, '');
  const titularName = business?.titular_cuenta || business?.nombre_visible || 'Restaurante';

  const businessType = business?.business_type || 'general';
  const statusCopy = getStatusCopy(statusStr, businessType);
  const steps = getStepperSteps(businessType);

  return (
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8 px-4 sm:px-6">
      <SEO 
        title="Rastreo de pedido | NEGU"
        description="Consulta el estado en vivo de tu comanda y entrega a domicilio."
        canonical="https://negu.pro/tracking"
        noindex={true}
      />
      <div className="max-w-xl mx-auto space-y-4 animate-fade-in-up">
        
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

        {/* ── 1. ESTADO COTIZACION_ENVIADA: PANEL DE CONFIRMACIÓN ── */}
        {isQuoteSent && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  {statusCopy.title}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {statusCopy.subtitle}
                </p>
              </div>
              <span className="badge badge-warning text-[11px] shrink-0">
                Por Confirmar
              </span>
            </div>

            {/* Desglose de Precios */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal productos</span>
                <span className="font-semibold text-gray-900 tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Costo de envío</span>
                <span className="font-semibold text-gray-900 tabular-nums">{formatMoney(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-gray-200 text-gray-900">
                <span className="text-xs font-bold uppercase tracking-wider">Total a pagar</span>
                <span className="text-base sm:text-lg tabular-nums font-extrabold text-gray-950">{formatMoney(totalAmount)}</span>
              </div>
            </div>

            {/* Botones de Confirmar y Cancelar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleAcceptQuote}
                disabled={actionLoading}
                className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold justify-center flex-1 shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>{statusCopy.acceptButton || 'Confirmar Pedido'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="btn-secondary py-2.5 px-3.5 text-xs font-semibold justify-center cursor-pointer"
              >
                <X size={14} />
                <span>Cancelar Pedido</span>
              </button>
            </div>
          </div>
        )}

        {/* ── 2. VENTANA DE GRACIA - ESTADO CONFIRMADO_GRACIA ── */}
        {isGraceWindow && (
          <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 border border-blue-100">
                  {graceSeconds}s
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 truncate">Pedido confirmado</h3>
                  <p className="text-[11px] text-gray-500 truncate">
                    Pasando a preparación en {graceSeconds} segundos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleUndoGrace}
                disabled={actionLoading}
                className="btn-secondary py-1.5 px-2.5 text-xs font-semibold shrink-0 cursor-pointer text-gray-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200"
              >
                <RotateCcw size={12} />
                <span>Cancelar</span>
              </button>
            </div>

            {/* Barra de progreso sutil */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(Math.min(30, graceSeconds) / 30) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── 3. ESTADO CANCELADO: PANEL SOBRIO ── */}
        {isCancelled && (
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <h2 className="text-sm sm:text-base font-bold text-gray-900">
                  Pedido Cancelado
                </h2>
              </div>
              <span className="badge badge-error text-[11px]">
                Cancelado
              </span>
            </div>
            <p className="text-xs text-gray-600">
              Este pedido fue anulado por{' '}
              <span className="font-semibold text-gray-900">
                {currentOrder.cancelled_by === 'customer' ? 'el cliente' : currentOrder.cancelled_by === 'merchant' ? 'el comercio' : 'el sistema'}
              </span>{' '}
              y queda finalizado.
            </p>
            {currentOrder.cancellation_reason && (
              <div className="p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-700">
                <span className="font-semibold text-gray-900">Motivo:</span> {currentOrder.cancellation_reason}
              </div>
            )}
          </div>
        )}

        {/* ── TARJETA PRINCIPAL DE SEGUIMIENTO (STEPPER) ── */}
        {!isCancelled && (
          <div className="card p-5 sm:p-6 bg-white shadow-md border-gray-200/80 space-y-5">
            <div className="text-center">
              <p className="text-[11px] font-black uppercase tracking-wider text-orange-600 mb-1">
                Seguimiento en vivo
              </p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {isQuotePending && statusCopy.title}
                {isQuoteSent && 'Cotización Lista para Confirmar'}
                {isGraceWindow && 'Ventana de Confirmación'}
                {isCookingOrLater && (statusCopy.title || 'En Proceso')}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5 font-mono">
                Orden #{currentOrder.id ? currentOrder.id.toString().slice(-6) : '1042'}
              </p>
            </div>

            {/* Stepper dinámico por rubro */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {steps.map((step, i) => {
                const isPassed = i <= currentStepIdx;
                const isCurrent = i === currentStepIdx;
                const StepIcon = STEP_ICONS[i] || Package;
                return (
                  <div key={step.id} className="flex flex-col items-center text-center">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        isPassed
                          ? 'bg-orange-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <StepIcon size={18} className={isCurrent ? 'animate-bounce' : ''} />
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

            {/* Banner de estado dinámico por rubro */}
            <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200 border-l-4 border-l-orange-500 flex items-center gap-3 text-xs">
              <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
                <Truck size={16} />
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-snug">
                  {statusCopy.subtitle}
                </p>
                <p className="text-gray-500 mt-0.5 text-[11px]">Sincronizado automáticamente en tiempo real.</p>
              </div>
            </div>

            {/* ── 3. BLINDAJE CONTRA CANCELACIONES TARDÍAS (EN_PREPARACION O POSTERIOR) ── */}
            {isCookingOrLater && (
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 space-y-2">
                <p className="leading-snug">
                  🔒 {statusCopy.kitchenLockedNotice}
                </p>
                <a
                  href={`https://wa.me/${business?.whatsapp_contacto || business?.telefono || '573143243707'}?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi orden #${currentOrder.id}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>WhatsApp directo al comercio</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* ── 4. SOPORTE DE PAGO POR TRANSFERENCIA (NEQUI / DAVIPLATA) ── */}
        {isTransfer && !isCancelled && (
          <div className="card p-5 bg-white shadow-sm border-gray-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  💳
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-gray-900 uppercase tracking-wide">
                    Pago por Transferencia
                  </h3>
                  <p className="text-[11px] text-gray-500">Transfiere y sube tu comprobante para verificar</p>
                </div>
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                currentOrder.payment_status === 'verified'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {currentOrder.payment_status === 'verified' ? 'Verificado' : 'Pendiente Verificación'}
              </span>
            </div>

            {/* Tarjetas de Cuentas para Copiar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {nequiNumber && (
                <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/50 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="font-black text-[11px] text-purple-900 uppercase">Nequi</span>
                    <p className="text-sm font-mono font-black text-gray-900 mt-0.5">{nequiNumber}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">Titular: {titularName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(nequiNumber, 'nequi')}
                    className="w-full py-1.5 px-2 bg-white hover:bg-purple-100 text-purple-800 border border-purple-300 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    {copyFeedback === 'nequi' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copyFeedback === 'nequi' ? '¡Número Copiado!' : 'Copiar Nequi'}</span>
                  </button>
                </div>
              )}

              {daviplataNumber && (
                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex flex-col justify-between space-y-2">
                  <div>
                    <span className="font-black text-[11px] text-rose-900 uppercase">Daviplata</span>
                    <p className="text-sm font-mono font-black text-gray-900 mt-0.5">{daviplataNumber}</p>
                    <p className="text-[10px] text-gray-500 truncate mt-0.5">Titular: {titularName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(daviplataNumber, 'daviplata')}
                    className="w-full py-1.5 px-2 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1 transition-all cursor-pointer"
                  >
                    {copyFeedback === 'daviplata' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                    <span>{copyFeedback === 'daviplata' ? '¡Número Copiado!' : 'Copiar Daviplata'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sección de Carga de Comprobante */}
            <div className="pt-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*,application/pdf"
                className="hidden"
              />

              {currentOrder.payment_receipt_url ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-emerald-950 truncate">Comprobante subido</p>
                      <p className="text-[10px] text-emerald-800">En revisión por el comercio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={currentOrder.payment_receipt_url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>Ver</span>
                      <ExternalLink size={11} />
                    </a>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={receiptUploading}
                  className="w-full py-3 px-4 border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-xl bg-gray-50/70 hover:bg-orange-50/30 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  {receiptUploading ? (
                    <Loader2 size={20} className="animate-spin text-orange-600" />
                  ) : (
                    <Upload size={20} className="text-gray-400 group-hover:text-orange-600" />
                  )}
                  <span className="text-xs font-bold text-gray-800">
                    {receiptUploading ? 'Subiendo comprobante a Supabase Storage...' : 'Toca aquí para subir foto del comprobante'}
                  </span>
                  <span className="text-[10px] text-gray-500">JPG, PNG o PDF (hasta 10MB)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── DETALLE DEL PEDIDO ── */}
        <div className="card overflow-hidden bg-white shadow-sm border-gray-200/80">
          <div className="px-5 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart size={15} className="text-gray-500" />
              <h2 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Productos pedidos
              </h2>
            </div>
            <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
              {items.length} items
            </span>
          </div>

          <div className="p-5 divide-y divide-gray-100 text-xs">
            {items.map((item, idx) => {
              const qty = item.cantidad ?? item.quantity ?? 1;
              const name = item.nombre ?? item.name ?? 'Producto';
              const price = item.precio ?? item.price ?? 0;
              return (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-gray-900">{qty}× {name}</span>
                    {(item.opciones_texto || (Array.isArray(item.opciones) && item.opciones.length > 0)) && (
                      <p className="text-[11px] font-medium text-blue-800 mt-0.5">
                        ▸ {item.opciones_texto || item.opciones.map(o => o.nombre).join(', ')}
                      </p>
                    )}
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
                    {isQuotePending ? 'Por confirmar' : formatMoney(deliveryFee)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-gray-900">Total</span>
                <span className="text-lg font-black text-orange-600 tabular-nums">
                  {formatMoney(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SOPORTE POR WHATSAPP ── */}
        <div className="card p-4 bg-white shadow-xs border-gray-200/80 flex items-center justify-between gap-3">
          <div className="text-xs">
            <p className="font-bold text-gray-900">¿Tienes dudas o necesitas ayuda?</p>
            <p className="text-gray-500">Contacta a la tienda directamente.</p>
          </div>
          <a
            href={`https://wa.me/${business?.whatsapp_contacto || business?.telefono || '573143243707'}?text=${encodeURIComponent(`Hola, estoy siguiendo mi orden #${currentOrder.id} y tengo una duda.`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-whatsapp py-2 px-3 text-xs font-semibold shrink-0"
          >
            <MessageCircle size={15} />
            <span>Chat de soporte</span>
          </a>
        </div>

      </div>

      {/* ── MODAL DE CONFIRMACIÓN DE CANCELACIÓN DEL CLIENTE ── */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-gray-200 animate-fade-in-up space-y-3.5">
            <div className="flex items-center gap-2.5 text-rose-600">
              <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                <Ban size={18} />
              </div>
              <h3 className="text-base font-black text-gray-950">
                ¿Rechazar y cancelar orden?
              </h3>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              ¿Estás seguro de que deseas cancelar tu orden? Esta acción anulará el pedido y notificará al comercio.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={actionLoading}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => handleRejectOrCancel('Cliente rechazó costo de envío')}
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                <span>Sí, Cancelar Orden</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
