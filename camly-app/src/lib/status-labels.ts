export type BusinessType = 'food' | 'retail' | 'pharmacy' | 'stationery' | 'general';

export type OrderStatus =
  | 'NUEVO'
  | 'COTIZACION_PENDIENTE'
  | 'COTIZACION_ENVIADA'
  | 'CONFIRMADO_GRACIA'
  | 'EN_PREPARACION'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

export interface StatusCopy {
  badge: string;
  title: string;
  subtitle: string;
  stepperLabel: string;
  stepperDesc: string;
  graceBanner: (seconds: number) => string;
  kitchenLockedNotice: string;
  acceptButton: string;
}

export interface StepperStep {
  id: string;
  label: string;
  desc: string;
}

const DICTIONARY: Record<BusinessType, Record<OrderStatus, StatusCopy>> = {
  food: {
    NUEVO: {
      badge: 'Nuevo',
      title: 'Pedido Recibido',
      subtitle: 'Tu pedido fue recibido y está en proceso.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Pedido recibido',
      graceBanner: () => 'Pedido recibido.',
      kitchenLockedNotice: 'Tu orden ya se encuentra en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de domicilio',
      subtitle: 'El comercio está confirmando el valor del envío.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a cocina en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Domicilio asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total a pagar y confirma tu pedido.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Domicilio asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a cocina en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu orden entrará a preparación en cocina en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Entrando a cocina en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Cocina',
      title: 'En Preparación',
      subtitle: 'Tu pedido se está preparando.',
      stepperLabel: 'En Cocina',
      stepperDesc: 'En preparación',
      graceBanner: () => 'Tu orden está en preparación.',
      kitchenLockedNotice: 'Tu orden ya está en preparación y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'El domiciliario va en camino con tu entrega.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En camino',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu orden ya fue despachada y está en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'El pedido fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  retail: {
    NUEVO: {
      badge: 'Nuevo',
      title: 'Pedido Recibido',
      subtitle: 'Tu pedido fue recibido y está en proceso.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Pedido recibido',
      graceBanner: () => 'Pedido recibido.',
      kitchenLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de envío',
      subtitle: 'La tienda está cotizando la tarifa de entrega hacia tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a empaque en ${s}s...`,
      kitchenLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu pedido.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a empaque en ${s}s...`,
      kitchenLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu orden pasará a empaque en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Pasando a empaque en ${s}s...`,
      kitchenLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Empaque',
      title: 'En Empaque',
      subtitle: 'Tus productos se están empacando.',
      stepperLabel: 'En Empaque',
      stepperDesc: 'Empacando',
      graceBanner: () => 'Tus productos están en proceso de empaque.',
      kitchenLockedNotice: 'Tu paquete ya está en proceso de empaque.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu paquete va en camino con la mensajería.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu paquete ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tus productos fueron entregados.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  pharmacy: {
    NUEVO: {
      badge: 'Nuevo',
      title: 'Pedido Recibido',
      subtitle: 'Tu pedido fue recibido y está en revisión.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Pedido recibido',
      graceBanner: () => 'Pedido recibido.',
      kitchenLockedNotice: 'Tus medicamentos ya están siendo preparados.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de envío',
      subtitle: 'La farmacia está verificando la cobertura y tarifa de entrega.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tus medicamentos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu orden.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tus medicamentos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu pedido pasará a alistamiento en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus medicamentos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Alistamiento',
      title: 'Alistando Medicamentos',
      subtitle: 'Estamos alistando tus medicamentos con las medidas necesarias.',
      stepperLabel: 'Alistamiento',
      stepperDesc: 'Alistando',
      graceBanner: () => 'Tus medicamentos están en alistamiento.',
      kitchenLockedNotice: 'Tus medicamentos ya están siendo alistados.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu pedido va en camino a tu dirección.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu pedido ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tu pedido fue entregado.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  stationery: {
    NUEVO: {
      badge: 'Nuevo',
      title: 'Pedido Recibido',
      subtitle: 'Tu pedido fue recibido y está en revisión.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Pedido recibido',
      graceBanner: () => 'Pedido recibido.',
      kitchenLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de entrega',
      subtitle: 'La papelería está calculando la tarifa de envío hacia tu destino.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu pedido.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tus artículos pasarán a alistamiento en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Alistamiento',
      title: 'Alistando Artículos',
      subtitle: 'Estamos verificando y empacando tus artículos.',
      stepperLabel: 'Alistamiento',
      stepperDesc: 'Alistando',
      graceBanner: () => 'Tus artículos están en alistamiento.',
      kitchenLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu pedido va en camino hacia tu dirección.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu pedido ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tu pedido fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  general: {
    NUEVO: {
      badge: 'Nuevo',
      title: 'Pedido Recibido',
      subtitle: 'Tu pedido fue recibido y está en proceso.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Pedido recibido',
      graceBanner: () => 'Pedido recibido.',
      kitchenLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de envío',
      subtitle: 'El comercio está calculando el costo de entrega hacia tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu orden.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu orden entrará a preparación en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Entrando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Preparación',
      title: 'En Preparación',
      subtitle: 'Tu pedido se encuentra en preparación.',
      stepperLabel: 'En Preparación',
      stepperDesc: 'Preparando',
      graceBanner: () => 'Tu pedido está en preparación.',
      kitchenLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'El domiciliario va en camino con tu pedido.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu pedido ya está en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tu pedido fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },
};

/**
 * Normaliza cualquier tipo de negocio al tipo soportado
 */
export function normalizeBusinessType(type?: string | null): BusinessType {
  if (!type) return 'general';
  const t = type.toLowerCase();
  if (t.includes('food') || t.includes('restaurante') || t.includes('comida') || t.includes('gastronom')) return 'food';
  if (t.includes('retail') || t.includes('moda') || t.includes('ropa') || t.includes('calzado') || t.includes('tienda')) return 'retail';
  if (t.includes('pharm') || t.includes('droguer') || t.includes('farmac')) return 'pharmacy';
  if (t.includes('station') || t.includes('papeler') || t.includes('utiles')) return 'stationery';
  return 'general';
}

/**
 * Normaliza cualquier string de estado al enum canónico de OrderStatus
 */
export function normalizeOrderStatus(status?: string | null): OrderStatus {
  if (!status) return 'NUEVO';
  const s = status.toUpperCase();
  if (s.includes('COTIZACION_PENDIENTE') || s.includes('DOM_PENDIENTE')) return 'COTIZACION_PENDIENTE';
  if (s.includes('COTIZACION_ENVIADA')) return 'COTIZACION_ENVIADA';
  if (s.includes('CONFIRMADO_GRACIA')) return 'CONFIRMADO_GRACIA';
  if (s.includes('PREPAR') || s.includes('COCIN') || s.includes('EMPAQUE') || s.includes('DISPENS') || s.includes('ALIST')) return 'EN_PREPARACION';
  if (s.includes('CAMINO') || s.includes('ENVIAD') || s.includes('DESPACH')) return 'EN_CAMINO';
  if (s.includes('ENTREG') || s.includes('COMPLET')) return 'ENTREGADO';
  if (s.includes('CANCEL')) return 'CANCELADO';
  if (s === 'NUEVO' || s === 'RECIBIDO' || s === 'PENDIENTE') return 'NUEVO';
  return 'NUEVO';
}

/**
 * Obtiene los textos y etiquetas adaptadas al rubro del negocio
 */
export function getStatusCopy(status?: string | null, businessType?: string | null): StatusCopy {
  const normType = normalizeBusinessType(businessType);
  const normStatus = normalizeOrderStatus(status);
  return DICTIONARY[normType][normStatus] || DICTIONARY.general[normStatus] || DICTIONARY.general.NUEVO;
}

/**
 * Devuelve los 4 pasos del Stepper adaptados al rubro de comercio
 */
export function getStepperSteps(businessType?: string | null): StepperStep[] {
  const bType = normalizeBusinessType(businessType);
  return [
    { id: 'nuevo', label: DICTIONARY[bType].NUEVO.stepperLabel, desc: DICTIONARY[bType].NUEVO.stepperDesc },
    { id: 'preparando', label: DICTIONARY[bType].EN_PREPARACION.stepperLabel, desc: DICTIONARY[bType].EN_PREPARACION.stepperDesc },
    { id: 'enviado', label: DICTIONARY[bType].EN_CAMINO.stepperLabel, desc: DICTIONARY[bType].EN_CAMINO.stepperDesc },
    { id: 'entregado', label: DICTIONARY[bType].ENTREGADO.stepperLabel, desc: DICTIONARY[bType].ENTREGADO.stepperDesc },
  ];
}
