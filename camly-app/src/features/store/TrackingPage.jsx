import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, Truck,
  AlertCircle, ArrowLeft, Store, MessageCircle,
  MapPin, CreditCard,
  X, RotateCcw, Copy, Check, Upload,
  ExternalLink, Ban, Utensils
} from 'lucide-react';
import { getSupabase } from '../../lib/supabase';
import { formatMoney, getOrderSubtotal, buildWhatsAppUrl, formatGroupedOptionsText } from '../../lib/utils';
import { OrderService } from '../../services/orderService';
import { getStatusCopy, getStepperSteps } from '../../lib/status-labels';
import { useToastStore } from '../../stores';
import SEO from '../../components/common/SEO';
import PageLoading from '../../components/common/PageLoading';
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
    nombre_visible: 'Tienda Demo NEGU',
    telefono: '573143243707',
    whatsapp_contacto: '573143243707',
    theme_color: '#0284C7',
    direccion: 'Calle 10 # 4-20, Zona Centro',
    pago_banco: 'Nequi / Llave Bre-B',
    pago_alias: '314 324 3707',
    nequi_numero: '3143243707',
    daviplata_numero: '3143243707',
    titular_cuenta: 'Tienda Demo NEGU',
    cedula_titular: '1098765432'
  }
};

export default function TrackingPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const id = routeId || searchParams.get('id') || searchParams.get('order');
  const token = searchParams.get('token');
  const isDemo = searchParams.get('store') === 'demo';
  const addToast = useToastStore(s => s.addToast);

  const [order, setOrder] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [graceSeconds, setGraceSeconds] = useState(60);
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptDisplayUrl, setReceiptDisplayUrl] = useState('');
  const fileInputRef = useRef(null);

  // 1. Cargar datos de la orden
  useEffect(() => {
    async function loadOrder() {
      setLoading(true);
      setLoadError('');
      if (isDemo) {
        setOrder(DEMO_ORDER);
        setLoading(false);
        return;
      }

      if (!id || !token) {
        setLoadError(!id
          ? 'Falta el número de pedido en el enlace. Abre el enlace directo enviado al finalizar tu compra.'
          : 'El enlace no contiene el token de seguimiento. Solicita al comercio un enlace nuevo.');
        setOrder(null);
        setLoading(false);
        return;
      }

      try {
        const { data: resultData, error } = await getSupabase().rpc('customer_get_order', {
          p_order_id: Number(id), p_token: token,
        });
        if (error) {
          if (error.code === 'PGRST202') {
            throw new Error('La función de seguimiento no está instalada en Supabase. Ejecuta el script supabase/schema.sql completo en el editor SQL y vuelve a intentarlo.');
          }
          throw error;
        }
        if (!resultData) throw new Error('No encontramos este pedido. Revisa el enlace de seguimiento.');
        setOrder(resultData);
      } catch (err) {
        console.error('Error cargando pedido:', err);
        setLoadError(err.message || 'No fue posible cargar el pedido.');
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    const poll = !isDemo && id && token ? window.setInterval(async () => {
      const { data, error } = await getSupabase().rpc('customer_get_order', { p_order_id: Number(id), p_token: token });
      if (!error && data) setOrder(data);
    }, 5000) : null;

    return () => { if (poll) window.clearInterval(poll); };
  }, [id, token, isDemo, retryCount]);

  const currentOrder = isDemo ? (order || DEMO_ORDER) : order;
  const effectiveToken = currentOrder?.token || token || '';
  const isMesa = Boolean(
    currentOrder?.delivery_type === 'dine_in' ||
    currentOrder?.entrega_metodo === 'mesa' ||
    (typeof currentOrder?.direccion === 'string' && /mesa/i.test(currentOrder.direccion)) ||
    currentOrder?.mesa ||
    currentOrder?.table_number
  );
  const deliveryMethod = isMesa ? 'mesa' : (currentOrder?.delivery_type === 'pickup' || currentOrder?.entrega_metodo === 'recogida' ? 'pickup' : 'envio');
  const rawStatus = (currentOrder?.status || currentOrder?.estado || '').toString();
  const statusStr = (deliveryMethod === 'pickup' || deliveryMethod === 'mesa') && ['EN_CAMINO', 'en_camino', 'enviado'].includes(rawStatus)
    ? 'LISTO_PARA_RECOGER'
    : rawStatus;
  const business = isDemo ? (currentOrder?.negocios || DEMO_ORDER.negocios) : (currentOrder?.negocios || {});
  let items = [];
  if (typeof currentOrder?.items === 'string') {
    try { items = JSON.parse(currentOrder.items); } catch { items = []; }
  } else {
    items = currentOrder?.items || currentOrder?.productos || [];
  }
  const brandColor = business?.theme_color || '#0284C7';
  const supportPhone = (business?.whatsapp_contacto || business?.telefono || (isDemo ? '573143243707' : '')).replace(/\D/g, '');

  const subtotal = currentOrder ? getOrderSubtotal(currentOrder) : 0;
  const deliveryFee = Number(currentOrder?.delivery_fee || currentOrder?.domicilio_costo || 0);
  const totalAmount = Number(currentOrder?.total_amount || currentOrder?.total || (subtotal + deliveryFee));

  useEffect(() => {
    const path = currentOrder?.payment_receipt_url;
    if (!path || path.startsWith('http') || isDemo) return;
    OrderService.getReceiptUrl(path).then(setReceiptDisplayUrl).catch(console.error);
  }, [currentOrder?.payment_receipt_url, isDemo]);

  // Ventana de gracia de 60 segundos calculada desde confirmed_at o momento actual
  useEffect(() => {
    if (statusStr !== 'CONFIRMADO_GRACIA' || !currentOrder) return;

    const GRACE_PERIOD_SECONDS = 60;

    // Calcular el timestamp base
    let startMs = Date.now();
    const rawTime = currentOrder.confirmed_at || currentOrder.updated_at || currentOrder.created_at;
    if (rawTime) {
      const parsed = new Date(rawTime).getTime();
      // Solo usar el timestamp si es válido y no está en el futuro por desfase horario
      if (!isNaN(parsed) && parsed <= Date.now()) {
        startMs = parsed;
      }
    }

    const calcRemaining = () => {
      const elapsed = Math.max(0, (Date.now() - startMs) / 1000);
      return Math.max(0, Math.ceil(GRACE_PERIOD_SECONDS - elapsed));
    };

    let advanceInFlight = false;
    let nextAdvanceAttemptAt = 0;

    const tick = async () => {
      const rem = calcRemaining();
      setGraceSeconds(rem);

      if (rem <= 0 && !advanceInFlight && Date.now() >= nextAdvanceAttemptAt) {
        advanceInFlight = true;
        try {
          if (!isDemo && currentOrder.id && effectiveToken) {
            await OrderService.advanceToPreparation(currentOrder.id, effectiveToken);
          }
          setOrder(prev => prev ? { ...prev, status: 'EN_PREPARACION', estado: 'EN_PREPARACION' } : prev);
        } catch (err) {
          nextAdvanceAttemptAt = Date.now() + 2000;
          console.warn('Reintentaremos avanzar el pedido al terminar la ventana de gracia:', err);
        } finally {
          advanceInFlight = false;
        }
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [statusStr, currentOrder?.confirmed_at, currentOrder?.updated_at, currentOrder?.created_at, currentOrder?.id, effectiveToken, isDemo]);

  // Manejo de Aceptar Cotización
  const handleAcceptQuote = async () => {
    setActionLoading(true);
    try {
      if (!isDemo) {
        if (!currentOrder?.id || !effectiveToken) {
          addToast('Enlace de pedido inválido', 'error');
          return;
        }
        const result = await OrderService.customerAcceptQuote(currentOrder.id, effectiveToken);
        setGraceSeconds(60);
        setOrder((prev) => ({
          ...prev,
          status: 'CONFIRMADO_GRACIA',
          estado: 'CONFIRMADO_GRACIA',
          confirmed_at: result?.confirmed_at || new Date().toISOString(),
        }));
        return;
      }
      setGraceSeconds(60);
      setOrder((prev) => ({
        ...prev,
        status: 'CONFIRMADO_GRACIA',
        estado: 'CONFIRMADO_GRACIA',
        confirmed_at: new Date().toISOString()
      }));
    } catch (err) {
      console.error(err);
      addToast(err.message || 'No se pudo confirmar', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Manejo de Rechazar / Cancelar por el Cliente
  const handleRejectOrCancel = async (reason = 'Cliente rechazó costo de envío') => {
    setActionLoading(true);
    try {
      if (!isDemo) {
        if (!currentOrder?.id || !effectiveToken) {
          addToast('Enlace de pedido inválido', 'error');
          return;
        }
        await OrderService.customerCancelOrder(currentOrder.id, effectiveToken, reason);
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
      addToast(err.message || 'Error al cancelar', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Manejo de Deshacer durante la Ventana de Gracia
  const handleUndoGrace = async () => {
    setActionLoading(true);
    try {
      if (!isDemo) {
        if (!currentOrder?.id || !effectiveToken) {
          addToast('Enlace de pedido inválido', 'error');
          return;
        }
        await OrderService.customerCancelOrder(
          currentOrder.id,
          effectiveToken,
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
      addToast(err.message || 'Error al deshacer.', 'error');
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
      if (!isDemo) {
        if (!currentOrder?.id || !effectiveToken) {
          addToast('Enlace de pedido inválido', 'error');
          return;
        }
        const storagePath = await OrderService.uploadPaymentReceipt(currentOrder.id, effectiveToken, file);
        setReceiptDisplayUrl(await OrderService.getReceiptUrl(storagePath));
        receiptUrl = storagePath;
      } else {
        receiptUrl = URL.createObjectURL(file);
      }

      setOrder((prev) => ({
        ...prev,
        payment_receipt_url: receiptUrl,
        payment_status: 'pending'
      }));
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Error al subir comprobante', 'error');
    } finally {
      setReceiptUploading(false);
    }
  };

  if (loading) {
    return <PageLoading label="Cargando pedido" />;
  }

  if (!currentOrder || (loadError && !order)) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6"><div className="max-w-sm rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm"><AlertCircle className="mx-auto mb-3 text-amber-600" /><h1 className="font-bold text-gray-900">No pudimos abrir el seguimiento</h1><p className="mt-2 text-sm text-gray-600">{loadError || 'El enlace de seguimiento está incompleto o el pedido no existe.'}</p><button type="button" onClick={() => setRetryCount(count => count + 1)} className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">Reintentar</button></div></div>;
  }

  // Cálculo de progreso del stepper
  let currentStepIdx = 0;
  if (deliveryMethod === 'mesa') {
    if (['ENTREGADO', 'entregado', 'finalizado', 'cerrado'].includes(statusStr)) currentStepIdx = 2;
    else if (['EN_CAMINO', 'enviado', 'listo_para_recoger', 'LISTO_PARA_RECOGER', 'servido'].includes(statusStr)) currentStepIdx = 1;
    else currentStepIdx = 0; // en cocina
  } else {
    if (['EN_PREPARACION', 'preparando'].includes(statusStr)) currentStepIdx = 1;
    else if (['LISTO_PARA_RECOGER', 'listo_para_recoger'].includes(statusStr)) currentStepIdx = 2;
    else if (['EN_CAMINO', 'enviado'].includes(statusStr)) currentStepIdx = 2;
    else if (['ENTREGADO', 'entregado'].includes(statusStr)) currentStepIdx = 3;
  }

  const isCancelled = statusStr === 'CANCELADO' || statusStr === 'cancelado';
  const isQuotePending = statusStr === 'COTIZACION_PENDIENTE';
  const isQuoteSent = statusStr === 'COTIZACION_ENVIADA';
  const isGraceWindow = statusStr === 'CONFIRMADO_GRACIA';
  const isCookingOrLater = ['EN_PREPARACION', 'preparando', 'LISTO_PARA_RECOGER', 'listo_para_recoger', 'EN_CAMINO', 'enviado', 'ENTREGADO', 'entregado'].includes(statusStr);

  const isTransfer = (currentOrder.payment_method || '').includes('transfer') ||
    (currentOrder.payment_method || '').includes('nequi') ||
    (currentOrder.payment_method || '').includes('daviplata') ||
    currentOrder.pago_metodo === 'transferencia' ||
    currentOrder.metodo_pago === 'transferencia';

  const paymentBankLabel = business?.pago_banco?.trim() || 'Transferencia / Llave';
  const paymentAccountValue = business?.pago_alias?.trim()
    || business?.nequi_numero?.trim()
    || business?.daviplata_numero?.trim()
    || business?.telefono?.replace(/\D/g, '')
    || '';
  const titularName = business?.titular_cuenta || business?.nombre_visible || 'Comercio';
  const shortOrderCode = String(currentOrder.id || '1042').slice(-6).toUpperCase();
  const receiptWhatsappUrl = supportPhone
    ? buildWhatsAppUrl(
        supportPhone,
        `Hola *${business?.nombre_visible || 'la tienda'}*, ya realicé la transferencia por *${formatMoney(totalAmount)}* para mi *Pedido #${shortOrderCode}*. Adjunto mi comprobante de pago.`
      )
    : '';

  const businessType = business?.business_type || 'general';
  const statusCopy = getStatusCopy(statusStr, businessType, deliveryMethod);
  const steps = getStepperSteps(businessType, deliveryMethod);

  return (
    <div className="min-h-dvh bg-[#f9fafb] pb-10">
      <SEO
        title="Rastreo de pedido | NEGU"
        description="Consulta el estado en vivo de tu comanda y entrega a domicilio."
        canonical="https://negu.pro/tracking"
        noindex={true}
      />

      {/* Barra superior minimalista estilo Nordic Precision */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to={business?.nombre ? `/${business.nombre}` : '/'}
              aria-label="Volver a la tienda"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
            >
              <ArrowLeft size={16} strokeWidth={1.75} />
            </Link>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-semibold tracking-tight text-slate-950 truncate tabular-nums">
                Pedido #{shortOrderCode}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {business?.nombre_visible || 'Tienda'}
              </p>
            </div>
          </div>

          <span
            className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isCancelled
                ? 'bg-rose-50 text-rose-700'
                : statusStr === 'ENTREGADO' || statusStr === 'entregado'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-emerald-50 text-emerald-700'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isCancelled ? 'bg-rose-500' : 'bg-emerald-500'}`}
              aria-hidden="true"
            />
            <span>{isCancelled ? 'Cancelado' : statusCopy.badge || 'En curso'}</span>
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-5 space-y-4 animate-fade-in-up">

        {/* ── 0. ESTADO COTIZACION_PENDIENTE: OCULTAR SEGUIMIENTO HASTA COTIZAR ── */}
        {isQuotePending && !isCancelled && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ backgroundColor: brandColor }}
                >
                  <Clock size={19} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900">
                    Cotizando costo de domicilio
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    El comercio está calculando el valor del envío para tu dirección. Apenas quede listo, verás aquí el total con envío para confirmar tu pedido{isTransfer ? ' y obtener los datos de transferencia' : ''}.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal productos</span>
                <span className="font-bold text-slate-900 tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de envío</span>
                <span className="font-semibold text-amber-700">Pendiente por cotizar</span>
              </div>
            </div>

            {supportPhone && (
              <a
                href={buildWhatsAppUrl(
                  supportPhone,
                  `Hola *${business?.nombre_visible || 'la tienda'}*, acabo de enviar mi Pedido #${shortOrderCode} y quedo atento al valor del domicilio.`
                )}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp w-full py-2.5 text-xs sm:text-sm font-bold justify-center"
              >
                <MessageCircle size={16} />
                <span>Consultar por WhatsApp</span>
              </a>
            )}
          </div>
        )}

        {/* ── 1. ESTADO COTIZACION_ENVIADA: PANEL DE CONFIRMACIÓN ── */}
        {isQuoteSent && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {statusCopy.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {statusCopy.subtitle}
                </p>
              </div>
              <span className="badge badge-warning text-[11px] shrink-0">
                Por Confirmar
              </span>
            </div>

            {/* Desglose de Precios */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal productos</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Costo de envío</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatMoney(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200 text-slate-900">
                <span className="text-xs font-bold uppercase tracking-wider">Total con envío</span>
                <span className="text-base sm:text-lg tabular-nums font-extrabold text-slate-950">{formatMoney(totalAmount)}</span>
              </div>
            </div>

            {isTransfer && (
              <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs text-slate-700 leading-relaxed">
                Al confirmar el pedido verás el número de cuenta o llave para transferir <strong>{formatMoney(totalAmount)}</strong> y enviar tu comprobante por WhatsApp.
              </div>
            )}

            {/* Botones de Confirmar y Cancelar */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={handleAcceptQuote}
                disabled={actionLoading}
                style={{ backgroundColor: brandColor }}
                className="py-2.5 px-4 rounded-xl text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 flex-1 shadow-xs hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <LoadingSpinner size={15} /> : <CheckCircle2 size={16} />}
                <span>Aceptar y confirmar pedido</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                disabled={actionLoading}
                className="btn-secondary py-2.5 px-3.5 text-xs font-semibold justify-center cursor-pointer"
              >
                <X size={14} />
                <span>Cancelar pedido</span>
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
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900">Pedido confirmado</h3>
                  <p className="text-xs text-gray-600 leading-snug">
                    Entrando a preparación en <strong className="text-blue-700 font-bold">{graceSeconds}s</strong>...
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
                <span>Deshacer pedido</span>
              </button>
            </div>

            {/* Barra de progreso sutil */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${(Math.min(60, graceSeconds) / 60) * 100}%` }}
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

        {/* ── TARJETA PRINCIPAL DE SEGUIMIENTO (TIMELINE VERTICAL NORDIC PRECISION) ── */}
        {!isCancelled && !isQuotePending && (
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-950">
                Estado de la orden
              </h1>
              <span className="text-xs text-slate-500">
                Sincronizado en vivo
              </span>
            </div>

            {/* Timeline vertical limpio y escaneable */}
            <ol className="relative space-y-5">
              {steps.map((step, i) => {
                const isCompleted = i < currentStepIdx || (i === steps.length - 1 && currentStepIdx === steps.length - 1);
                const isCurrent = i === currentStepIdx && !isCompleted;
                const isLast = i === steps.length - 1;
                return (
                  <li key={step.id} className="relative flex items-start gap-3.5">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[11px] top-7 bottom-[-22px] w-px ${
                          isCompleted ? 'bg-emerald-600/40' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    <div className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {isCompleted ? (
                        <span
                          style={{ backgroundColor: brandColor }}
                          className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                        >
                          <Check size={13} strokeWidth={2.5} />
                        </span>
                      ) : isCurrent ? (
                        <span
                          style={{ borderColor: brandColor }}
                          className="flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white"
                        >
                          <span
                            style={{ backgroundColor: brandColor }}
                            className="h-2 w-2 rounded-full"
                          />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold leading-snug ${isCompleted || isCurrent ? 'text-slate-950' : 'text-slate-400'}`}>
                          {step.label}
                        </p>
                        <p className={`text-xs mt-0.5 leading-snug ${isCompleted || isCurrent ? 'text-slate-500' : 'text-slate-400/80'}`}>
                          {step.desc}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 text-xs tabular-nums ${
                          isCurrent
                            ? 'font-medium text-emerald-700'
                            : isCompleted
                              ? 'text-slate-400'
                              : 'text-slate-300'
                        }`}
                      >
                        {isCurrent ? 'En curso' : isCompleted ? 'Listo' : 'Pendiente'}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Nota de estado actual */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3.5 py-3 flex items-start gap-2.5 text-xs text-slate-600">
              <div className="mt-0.5 shrink-0 text-slate-500">
                {deliveryMethod === 'mesa' ? <Utensils size={15} strokeWidth={1.75} /> : deliveryMethod === 'pickup' ? <Store size={15} strokeWidth={1.75} /> : <Truck size={15} strokeWidth={1.75} />}
              </div>
              <p className="leading-relaxed">
                {deliveryMethod === 'mesa'
                  ? (currentStepIdx >= 2 ? 'Tu orden fue servida en tu mesa.' : `${currentOrder.direccion || 'Servicio en Mesa'} · Preparando comanda para llevar a tu mesa.`)
                  : statusCopy.subtitle}
              </p>
            </div>

            {deliveryMethod === 'pickup' && business?.direccion && (
              <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-950">
                <MapPin size={16} className="mt-0.5 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="font-bold">Punto de recogida</p>
                  <p className="mt-0.5 break-words">{business.direccion}</p>
                </div>
              </div>
            )}

            {/* ── 3. AVISO DISCRETO CUANDO YA ESTÁ EN PREPARACIÓN ── */}
            {isCookingOrLater && statusStr !== 'ENTREGADO' && statusStr !== 'entregado' && Boolean(statusCopy.cancelLockedNotice?.trim()) && (
              <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-100">
                {statusCopy.cancelLockedNotice}
              </p>
            )}
          </div>
        )}

        {/* ── 4. PAGO POR TRANSFERENCIA (COPIAR LLAVE / CUENTA Y ENVIAR COMPROBANTE POR WHATSAPP) ── */}
        {isTransfer && !isCancelled && !isQuotePending && !isQuoteSent && (
          <div className="card p-5 bg-white shadow-sm border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                >
                  <CreditCard size={16} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wide truncate">
                    Pago por Transferencia
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    Transfiere el total y envía tu comprobante
                  </p>
                </div>
              </div>
              <span className={`shrink-0 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${currentOrder.payment_status === 'verified'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                {currentOrder.payment_status === 'verified' ? 'Verificado' : 'Pendiente'}
              </span>
            </div>

            {/* Resumen de cuenta o llave Bre-B */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-600">Total a transferir</span>
                <span className="text-base sm:text-lg font-extrabold text-slate-950 tabular-nums">
                  {formatMoney(totalAmount)}
                </span>
              </div>

              <div className="border-t border-slate-200/80 pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="min-w-0">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {paymentBankLabel}
                  </p>
                  <p className="text-base font-mono font-black text-slate-950 mt-0.5 break-all">
                    {paymentAccountValue || 'Consultar por WhatsApp'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    A nombre de: {titularName}
                  </p>
                </div>

                {paymentAccountValue && (
                  <button
                    type="button"
                    onClick={() => handleCopyAccount(paymentAccountValue, 'account')}
                    className="w-full sm:w-auto py-2 px-3.5 bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-2xs"
                  >
                    {copyFeedback === 'account' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                    <span>{copyFeedback === 'account' ? '¡Copiado!' : 'Copiar número o llave'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Botón principal: Enviar comprobante por WhatsApp */}
            {receiptWhatsappUrl && (
              <a
                href={receiptWhatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp w-full py-3 px-4 text-xs sm:text-sm font-bold justify-center shadow-xs"
              >
                <MessageCircle size={17} />
                <span>Enviar comprobante por WhatsApp</span>
              </a>
            )}

            {/* Opción adicional: subir foto al pedido */}
            <div className="pt-1">
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
                      <p className="font-bold text-emerald-950 truncate">Comprobante adjuntado en la orden</p>
                      <p className="text-[10px] text-emerald-800">En revisión por el comercio</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={receiptDisplayUrl || currentOrder.payment_receipt_url}
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
                  className="w-full py-2.5 px-4 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 text-center transition-all cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"
                >
                  {receiptUploading ? (
                    <LoadingSpinner size={15} />
                  ) : (
                    <Upload size={15} className="text-slate-500" />
                  )}
                  <span>
                    {receiptUploading ? 'Subiendo comprobante...' : 'O adjuntar comprobante aquí (opcional)'}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── DETALLE DEL PEDIDO ── */}
        <div className="rounded-2xl overflow-hidden bg-white border border-slate-200/80">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-tight text-slate-950">
              Resumen de productos
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {items.length} {items.length === 1 ? 'artículo' : 'artículos'}
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
                        ▸ {formatGroupedOptionsText(item.opciones || item.options, item.opciones_texto || '', { includePrice: false, includeGroupTitle: false })}
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

              <div className="pt-2 border-t border-slate-100 flex justify-between items-baseline text-sm">
                <span className="font-bold text-slate-900">
                  {isQuotePending ? 'Subtotal productos' : 'Total'}
                </span>
                <span
                  style={{ color: brandColor }}
                  className="text-lg font-black tabular-nums"
                >
                  {isQuotePending ? formatMoney(subtotal) : formatMoney(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── SOPORTE POR WHATSAPP (Estilo minimalista Nordic Precision) ── */}
        {supportPhone && !isQuotePending && (
          <div className="space-y-3 pt-1">
            <a
              href={buildWhatsAppUrl(supportPhone, `Hola, estoy siguiendo mi Pedido #${shortOrderCode} y tengo una consulta.`)}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <MessageCircle size={16} strokeWidth={1.75} className="text-emerald-600" />
              <span>Contactar comercio por WhatsApp</span>
            </a>
            <p className="text-center text-[11px] text-slate-400">
              Plataforma NEGU · Seguimiento en tiempo real
            </p>
          </div>
        )}

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
                {actionLoading ? <LoadingSpinner size={13} /> : null}
                <span>Sí, Cancelar Orden</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
