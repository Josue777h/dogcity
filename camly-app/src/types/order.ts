export type OrderStatus =
  | 'COTIZACION_PENDIENTE'
  | 'COTIZACION_ENVIADA'
  | 'CONFIRMADO_GRACIA'
  | 'EN_PREPARACION'
  | 'LISTO_PARA_RECOGER'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type DeliveryType = 'fixed' | 'per_km' | 'custom_quote' | 'pickup';

export type PaymentMethod = 'transfer_nequi' | 'transfer_daviplata' | 'transfer_bancolombia' | 'transferencia' | 'cash' | 'efectivo';

export type PaymentStatus = 'pending' | 'verified' | 'rejected';

export type CancelledBy = 'customer' | 'merchant' | 'system';

export interface OrderItem {
  id: string | number;
  nombre: string;
  cantidad: number;
  precio: number;
  nota?: string;
  opciones_texto?: string;
}

export type BusinessType = 'food' | 'retail' | 'pharmacy' | 'stationery' | 'general';

export interface BusinessSummary {
  id: string;
  nombre: string;
  nombre_visible: string;
  telefono: string;
  business_type?: BusinessType;
  whatsapp_contacto?: string;
  theme_color?: string;
  direccion?: string;
  pago_banco?: string;
  pago_alias?: string;
  pago_titular?: string;
}

export interface Order {
  id: number;
  token: string;
  negocio_id: string;
  status: OrderStatus;
  estado?: string;
  delivery_type: DeliveryType;
  entrega_metodo?: string;
  delivery_fee: number;
  domicilio_costo?: number;
  subtotal_amount: number;
  total_amount: number;
  total: number;
  nombre: string;
  telefono: string;
  direccion?: string;
  ubicacion_link?: string;
  comentarios?: string;
  items: OrderItem[];
  payment_method: PaymentMethod;
  pago_metodo?: string;
  payment_receipt_url?: string | null;
  payment_status: PaymentStatus;
  quote_sent_at?: string | null;
  confirmed_at?: string | null;
  cancellation_reason?: string | null;
  cancelled_by?: CancelledBy | null;
  created_at: string;
  negocios?: BusinessSummary;
}
