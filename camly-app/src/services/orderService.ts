import { getSupabase } from '../lib/supabase';
import { formatMoney, formatWhatsAppMessage } from '../lib/utils';
import type { Order } from '../types/order';

export const OrderService = {
  async setDeliveryQuote(orderId: number, deliveryFee: number, subtotal: number): Promise<Order> {
    if (!Number.isFinite(deliveryFee) || deliveryFee <= 0 || !Number.isFinite(subtotal) || subtotal < 0) {
      throw new Error('Revisa el subtotal y el valor del envío.');
    }
    const supabase = getSupabase();
    const totalAmount = subtotal + deliveryFee;
    const { data, error } = await supabase.from('pedidos').update({
      delivery_fee: deliveryFee, domicilio_costo: deliveryFee, total_amount: totalAmount,
      total: totalAmount, status: 'COTIZACION_ENVIADA', estado: 'COTIZACION_ENVIADA',
      quote_sent_at: new Date().toISOString(),
    }).eq('id', orderId).eq('status', 'COTIZACION_PENDIENTE').select('*, negocios(*)').single();
    if (error) throw error;
    return data as Order;
  },

  buildQuoteWhatsAppUrl(order: Order): string {
    const phone = (order.telefono || '').replace(/\D/g, '');
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://negu.pro';
    const trackingUrl = `${origin}/tracking/${order.id}?token=${encodeURIComponent(order.token)}`;
    const fee = Number(order.delivery_fee || order.domicilio_costo || 0);
    const subtotal = Number(order.subtotal_amount || 0);
    const total = Number(order.total_amount || order.total || 0);
    const storeName = order.negocios?.nombre_visible || 'la tienda';
    const message = formatWhatsAppMessage(`ACTUALIZACIÓN DEL PEDIDO #${order.id} | ${storeName}`, [
      { title: 'Envío', lines: [`Costo de domicilio: ${formatMoney(fee)}`, ...(subtotal ? [`Subtotal: ${formatMoney(subtotal)}`] : []), `Total: ${formatMoney(total)}`] },
      { title: 'Confirmación', lines: ['Revisa el detalle y confirma el pedido desde este enlace:', trackingUrl] },
    ]);
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  },

  async merchantCancelOrder(orderId: number, reason: string): Promise<void> {
    const { error } = await getSupabase().from('pedidos').update({
      status: 'CANCELADO', estado: 'CANCELADO', cancelled_by: 'merchant',
      cancellation_reason: reason, updated_at: new Date().toISOString(),
    }).eq('id', orderId);
    if (error) throw error;
  },

  async customerAcceptQuote(orderId: number, token: string) {
    const { data, error } = await getSupabase().rpc('customer_accept_quote', { p_order_id: orderId, p_token: token });
    if (error) throw error;
    return data;
  },

  async advanceToPreparation(orderId: number, token: string) {
    const { data, error } = await getSupabase().rpc('advance_grace_to_preparation', { p_order_id: orderId, p_token: token });
    if (error) throw error;
    return data;
  },

  async customerCancelOrder(orderId: number, token: string, reason = 'Cancelado por el cliente') {
    const { data, error } = await getSupabase().rpc('customer_cancel_order', {
      p_order_id: orderId, p_token: token, p_reason: reason,
    });
    if (error) throw error;
    return data;
  },

  async uploadPaymentReceipt(orderId: number, token: string, file: File): Promise<string> {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type) || file.size > 10 * 1024 * 1024) {
      throw new Error('Adjunta una imagen JPG, PNG o WebP, o un PDF de máximo 10 MB.');
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${orderId}/${token}/${crypto.randomUUID()}.${extension}`;
    const supabase = getSupabase();
    const { error: uploadError } = await supabase.storage.from('receipts').upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type,
    });
    if (uploadError) throw uploadError;
    const { error } = await supabase.rpc('customer_save_receipt', {
      p_order_id: orderId, p_token: token, p_storage_path: path,
    });
    if (error) throw error;
    return path;
  },

  async getReceiptUrl(path: string): Promise<string> {
    const { data, error } = await getSupabase().storage.from('receipts').createSignedUrl(path, 300);
    if (error) throw error;
    return data.signedUrl;
  },
};
