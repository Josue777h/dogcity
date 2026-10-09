export type BusinessType = 'food' | 'retail' | 'pharmacy' | 'stationery' | 'general';

export type OrderStatus =
  | 'COTIZACION_PENDIENTE'
  | 'COTIZACION_ENVIADA'
  | 'CONFIRMADO_GRACIA'
  | 'EN_PREPARACION'
  | 'LISTO_PARA_RECOGER'
  | 'EN_CAMINO'
  | 'ENTREGADO'
  | 'CANCELADO';

type InternalOrderStatus = OrderStatus | 'NUEVO';

export interface StatusCopy {
  badge: string;
  title: string;
  subtitle: string;
  stepperLabel: string;
  stepperDesc: string;
  graceBanner: (seconds: number) => string;
  cancelLockedNotice: string;
  acceptButton: string;
}

export interface StepperStep {
  id: string;
  label: string;
  desc: string;
}

const PICKUP_READY_COPY: StatusCopy = {
  badge: 'Listo para recoger',
  title: 'Tu pedido está listo',
  subtitle: 'Puedes acercarte al local para recogerlo.',
  stepperLabel: 'Listo',
  stepperDesc: 'Disponible para recoger',
  graceBanner: () => '',
  cancelLockedNotice: 'El pedido ya está listo para recoger. Contacta al comercio si necesitas ayuda.',
  acceptButton: '',
};

const DICTIONARY: Record<BusinessType, Partial<Record<InternalOrderStatus, StatusCopy>>> = {
  food: {
    NUEVO: {
      badge: 'Nuevo',
      title: 'Pedido Recibido',
      subtitle: 'Tu pedido fue recibido y está en proceso.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Pedido recibido',
      graceBanner: () => 'Pedido recibido.',
      cancelLockedNotice: 'Tu orden ya está en cocina.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de domicilio',
      subtitle: 'El comercio está confirmando el valor del envío.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a cocina en ${s}s...`,
      cancelLockedNotice: 'Tu orden ya está en cocina y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Domicilio asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total a pagar y confirma tu pedido.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Domicilio asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a cocina en ${s}s...`,
      cancelLockedNotice: 'Tu orden ya está en cocina y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu orden entrará a cocina en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Entrando a cocina en ${s}s...`,
      cancelLockedNotice: 'Tu orden ya está en cocina y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Cocina',
      title: 'En Cocina',
      subtitle: 'Tu pedido está en cocina.',
      stepperLabel: 'En Cocina',
      stepperDesc: 'En cocina',
      graceBanner: () => 'Tu orden está en cocina.',
      cancelLockedNotice: 'Tu orden ya está en cocina y no puede cancelarse desde la web.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'El domiciliario va en camino con tu entrega.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En camino',
      graceBanner: () => '',
      cancelLockedNotice: 'Tu orden ya fue despachada y está en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'El pedido fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      cancelLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      cancelLockedNotice: '',
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
      cancelLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de envío',
      subtitle: 'La tienda está cotizando la tarifa de entrega hacia tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a empaque en ${s}s...`,
      cancelLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu pedido.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a empaque en ${s}s...`,
      cancelLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu orden pasará a empaque en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Pasando a empaque en ${s}s...`,
      cancelLockedNotice: 'Tu pedido ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Empaque',
      title: 'En Empaque',
      subtitle: 'Tus productos se están empacando.',
      stepperLabel: 'En Empaque',
      stepperDesc: 'Empacando',
      graceBanner: () => 'Tus productos están en proceso de empaque.',
      cancelLockedNotice: 'Tu paquete ya está en proceso de empaque.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu paquete va en camino con la mensajería.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      cancelLockedNotice: 'Tu paquete ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tus productos fueron entregados.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      cancelLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      cancelLockedNotice: '',
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
      cancelLockedNotice: 'Tus medicamentos ya están siendo preparados.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de envío',
      subtitle: 'La farmacia está verificando la cobertura y tarifa de entrega.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      cancelLockedNotice: 'Tus medicamentos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu orden.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      cancelLockedNotice: 'Tus medicamentos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu pedido pasará a alistamiento en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      cancelLockedNotice: 'Tus medicamentos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Alistamiento',
      title: 'Alistando Medicamentos',
      subtitle: 'Estamos alistando tus medicamentos con las medidas necesarias.',
      stepperLabel: 'Alistamiento',
      stepperDesc: 'Alistando',
      graceBanner: () => 'Tus medicamentos están en alistamiento.',
      cancelLockedNotice: 'Tus medicamentos ya están siendo alistados.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu pedido va en camino a tu dirección.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      cancelLockedNotice: 'Tu pedido ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tu pedido fue entregado.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      cancelLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      cancelLockedNotice: '',
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
      cancelLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de entrega',
      subtitle: 'La papelería está calculando la tarifa de envío hacia tu destino.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      cancelLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu pedido.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      cancelLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tus artículos pasarán a alistamiento en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Pasando a alistamiento en ${s}s...`,
      cancelLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Alistamiento',
      title: 'Alistando Artículos',
      subtitle: 'Estamos verificando y empacando tus artículos.',
      stepperLabel: 'Alistamiento',
      stepperDesc: 'Alistando',
      graceBanner: () => 'Tus artículos están en alistamiento.',
      cancelLockedNotice: 'Tus artículos ya están en alistamiento.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu pedido va en camino hacia tu dirección.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      cancelLockedNotice: 'Tu pedido ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tu pedido fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      cancelLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      cancelLockedNotice: '',
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
      cancelLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando costo de envío',
      subtitle: 'El comercio está calculando el costo de entrega hacia tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Por cotizar',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      cancelLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío asignado',
      title: 'Costo de envío confirmado',
      subtitle: 'Revisa el total con envío y confirma tu orden.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Envío asignado',
      graceBanner: (s) => `Pedido confirmado. Pasando a preparación en ${s}s...`,
      cancelLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Confirmado',
      title: 'Pedido Confirmado',
      subtitle: 'Tu orden entrará a preparación en breve.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmado',
      graceBanner: (s) => `Pedido confirmado. Entrando a preparación en ${s}s...`,
      cancelLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Preparación',
      title: 'En Preparación',
      subtitle: 'Tu pedido se encuentra en preparación.',
      stepperLabel: 'En Preparación',
      stepperDesc: 'Preparando',
      graceBanner: () => 'Tu pedido está en preparación.',
      cancelLockedNotice: 'Tu orden ya está en preparación.',
      acceptButton: 'Confirmar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'El domiciliario va en camino con tu pedido.',
      stepperLabel: 'En Camino',
      stepperDesc: 'En ruta',
      graceBanner: () => '',
      cancelLockedNotice: 'Tu pedido ya está en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: 'Pedido Entregado',
      subtitle: 'Tu pedido fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entregado',
      graceBanner: () => '',
      cancelLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue cancelado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Cancelado',
      graceBanner: () => '',
      cancelLockedNotice: '',
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
export function normalizeOrderStatus(status?: string | null): InternalOrderStatus {
  if (!status) return 'NUEVO';
  const s = status.toUpperCase();
  if (s.includes('LISTO_PARA_RECOGER') || s.includes('READY_FOR_PICKUP')) return 'LISTO_PARA_RECOGER';
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
export function getStatusCopy(status?: string | null, businessType?: string | null, deliveryMethod?: string | null): StatusCopy {
  const isPickup = deliveryMethod === 'recogida' || deliveryMethod === 'pickup';
  const normType = normalizeBusinessType(businessType);
  const normalizedStatus = normalizeOrderStatus(status);
  if (isPickup && (normalizedStatus === 'LISTO_PARA_RECOGER' || normalizedStatus === 'EN_CAMINO')) return PICKUP_READY_COPY;
  if (isPickup && normalizedStatus === 'ENTREGADO') {
    return { ...DICTIONARY.general.ENTREGADO, badge: 'Recogido', title: 'Pedido recogido', subtitle: 'El pedido fue recogido en el local.' };
  }
  if (isPickup && normalizedStatus === 'EN_PREPARACION') {
    const preparationCopy = DICTIONARY[normType].EN_PREPARACION || DICTIONARY.general.EN_PREPARACION!;
    return {
      ...preparationCopy,
      title: normType === 'food' ? 'En Cocina' : preparationCopy.title,
      subtitle: normType === 'food'
        ? 'Tu pedido se está preparando en cocina para recogerlo.'
        : 'El comercio está preparando tu pedido para recogerlo.',
      stepperDesc: normType === 'food' ? 'En cocina' : preparationCopy.stepperDesc,
    };
  }
  const normStatus = normalizedStatus;
  if (normStatus === 'LISTO_PARA_RECOGER') return PICKUP_READY_COPY;
  return DICTIONARY[normType][normStatus] || DICTIONARY.general[normStatus] || DICTIONARY.general.NUEVO || PICKUP_READY_COPY;
}

/**
 * Devuelve los 4 pasos del Stepper adaptados al rubro de comercio
 */
export function getStepperSteps(businessType?: string | null, deliveryMethod?: string | null): StepperStep[] {
  const bType = normalizeBusinessType(businessType);
  if (deliveryMethod === 'recogida' || deliveryMethod === 'pickup') {
    return [
      { id: 'nuevo', label: 'Recibido', desc: 'Pedido recibido' },
      { id: 'preparando', label: getStatusCopy('EN_PREPARACION', bType, deliveryMethod).stepperLabel, desc: 'Alistando para recoger' },
      { id: 'listo', label: 'Listo para recoger', desc: 'Disponible en el local' },
      { id: 'entregado', label: 'Recogido', desc: 'Pedido entregado' },
    ];
  }
  return [
    { id: 'nuevo', label: DICTIONARY[bType].NUEVO.stepperLabel, desc: DICTIONARY[bType].NUEVO.stepperDesc },
    { id: 'preparando', label: DICTIONARY[bType].EN_PREPARACION.stepperLabel, desc: DICTIONARY[bType].EN_PREPARACION.stepperDesc },
    { id: 'enviado', label: DICTIONARY[bType].EN_CAMINO.stepperLabel, desc: DICTIONARY[bType].EN_CAMINO.stepperDesc },
    { id: 'entregado', label: DICTIONARY[bType].ENTREGADO.stepperLabel, desc: DICTIONARY[bType].ENTREGADO.stepperDesc },
  ];
}
