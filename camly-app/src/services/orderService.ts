import { getSupabase } from '../lib/supabase';
import { Order, OrderStatus } from '../types/order';

export const OrderService = {
  /**
   * Comercio fija el costo de domicilio y notifica al cliente
   */
  async setDeliveryQuote(orderId: number, deliveryFee: number, subtotal: number): Promise<Order> {
    const supabase = getSupabase();
    const totalAmount = Number(subtotal) + Number(deliveryFee);

    const { data, error } = await supabase
      .from('pedidos')
      .update({
        delivery_fee: deliveryFee,
        domicilio_costo: deliveryFee,
        total_amount: totalAmount,
        total: totalAmount,
        status: 'COTIZACION_ENVIADA',
        estado: 'COTIZACION_ENVIADA',
        quote_sent_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select('*, negocios(*)')
      .single();

    if (error) throw error;
    return data as Order;
  },

  /**
   * Genera el mensaje estructurado de WhatsApp para notificar la cotización al cliente
   */
  buildQuoteWhatsAppUrl(order: Order): string {
    const phone = (order.telefono || '').replace(/\D/g, '');
    const origin = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://negu.pro';
    const trackingUrl = `${origin}/tracking?id=${order.id}&token=${order.token}`;
    const feeFormatted = Number(order.delivery_fee || order.domicilio_costo || 0).toLocaleString('es-CO');
    const totalFormatted = Number(order.total_amount || order.total || 0).toLocaleString('es-CO');

    const message = `Hola ${order.nombre}, el valor del domicilio para tu pedido #${order.id} en ${storeName} es de $${feeFormatted}.\nTotal a pagar: $${totalFormatted}.\n\nConfirma tu pedido aquí:\n${trackingUrl}`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  /**
   * Comercio cancela manualmente la orden con motivo
   */
  async merchantCancelOrder(orderId: number, reason: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('pedidos')
      .update({
        status: 'CANCELADO',
        estado: 'cancelado',
        cancelled_by: 'merchant',
        cancellation_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  },

  /**
   * Cliente acepta la cotización e inicia ventana de gracia (60s)
   */
  async customerAcceptQuote(orderId: number, token: string): Promise<any> {
    const supabase = getSupabase();
    
    // Intentar RPC atómico
    const { data, error } = await supabase.rpc('customer_accept_quote', {
      p_order_id: orderId,
      p_token: token
    });

    if (error) {
      // Fallback directo si el procedimiento aún no está desplegado en la instancia
      const { data: directData, error: directError } = await supabase
        .from('pedidos')
        .update({
          status: 'CONFIRMADO_GRACIA',
          estado: 'CONFIRMADO_GRACIA',
          confirmed_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('token', token)
        .select()
        .single();

      if (directError) throw directError;
      return directData;
    }

    return data;
  },

  /**
   * Transición de gracia a cocina
   */
  async advanceToKitchen(orderId: number, token: string): Promise<any> {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc('advance_grace_to_kitchen', {
      p_order_id: orderId,
      p_token: token
    });

    if (error) {
      // Fallback directo
      const { data: directData, error: directError } = await supabase
        .from('pedidos')
        .update({
          status: 'EN_PREPARACION',
          estado: 'preparando'
        })
        .eq('id', orderId)
        .eq('token', token)
        .select()
        .single();

      if (directError) throw directError;
      return directData;
    }

    return data;
  },

  /**
   * Cliente cancela el pedido (Blindaje: Rechazado si ya entró a EN_PREPARACION)
   */
  async customerCancelOrder(orderId: number, token: string, reason?: string): Promise<any> {
    const supabase = getSupabase();

    const { data, error } = await supabase.rpc('customer_cancel_order', {
      p_order_id: orderId,
      p_token: token,
      p_reason: reason || 'Cancelado por el cliente'
    });

    if (error) {
      // Fallback con chequeo de seguridad
      const { data: checkData } = await supabase
        .from('pedidos')
        .select('status, estado')
        .eq('id', orderId)
        .single();

      if (checkData && ['EN_PREPARACION', 'preparando', 'EN_CAMINO', 'enviado', 'ENTREGADO', 'entregado'].includes(checkData.status || checkData.estado)) {
        throw new Error('No es posible cancelar: la orden ya se encuentra en preparación.');
      }

      const { data: directData, error: directError } = await supabase
        .from('pedidos')
        .update({
          status: 'CANCELADO',
          estado: 'cancelado',
          cancelled_by: 'customer',
          cancellation_reason: reason || 'Cancelado por el cliente'
        })
        .eq('id', orderId)
        .eq('token', token)
        .select()
        .single();

      if (directError) throw directError;
      return directData;
    }

    return data;
  },

  /**
   * Subir comprobante de pago a Supabase Storage bucket 'receipts'
   */
  async uploadPaymentReceipt(orderId: number, file: File): Promise<string> {
    const supabase = getSupabase();
    const fileExt = file.name.split('.').pop();
    const filePath = `receipt_${orderId}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('receipts')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from('receipts')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: dbError } = await supabase
      .from('pedidos')
      .update({
        payment_receipt_url: publicUrl,
        payment_status: 'pending'
      })
      .eq('id', orderId);

    if (dbError) throw dbError;

    return publicUrl;
  }
};
