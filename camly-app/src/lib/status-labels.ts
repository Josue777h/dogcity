export type BusinessType = 'food' | 'retail' | 'pharmacy' | 'stationery' | 'general';

export type OrderStatus =
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
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Esperando Cotización de Domicilio',
      subtitle: 'El restaurante está calculando el costo exacto del envío según tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmando orden',
      graceBanner: (s) => `¡Pedido aceptado! Entrando a cocina en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en los fogones y no puede cancelarse automáticamente. Si tienes un inconveniente, comunícate con el restaurante:',
      acceptButton: 'Aceptar y Enviar a Cocina',
    },
    COTIZACION_ENVIADA: {
      badge: 'Cotización Enviada',
      title: 'El restaurante fijó el valor de tu domicilio',
      subtitle: 'Verifica el costo de entrega y presiona confirmar para comenzar la preparación en cocina.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmando costo',
      graceBanner: (s) => `¡Pedido aceptado! Entrando a cocina en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en los fogones y no puede cancelarse automáticamente. Si tienes un inconveniente, comunícate con el restaurante:',
      acceptButton: 'Aceptar y Enviar a Cocina',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Ventana de Gracia (60s)',
      title: '¡Pedido Aceptado!',
      subtitle: 'Tu orden entrará a preparación en los fogones al terminar el contador.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Ventana de gracia',
      graceBanner: (s) => `¡Pedido aceptado! Entrando a cocina en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en los fogones y no puede cancelarse automáticamente. Si tienes un inconveniente, comunícate con el restaurante:',
      acceptButton: 'Aceptar y Enviar a Cocina',
    },
    EN_PREPARACION: {
      badge: 'En Cocina',
      title: 'En Preparación',
      subtitle: '¡Tu orden ya está en los fogones y preparándose con dedicación!',
      stepperLabel: 'En Cocina',
      stepperDesc: 'Preparando tu pedido',
      graceBanner: (s) => `Tu orden está en preparación.`,
      kitchenLockedNotice: 'Tu orden ya está en los fogones y no puede cancelarse automáticamente. Si tienes un inconveniente, comunícate con el restaurante:',
      acceptButton: 'Aceptar y Enviar a Cocina',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'El repartidor ya tiene tu comida y va en camino a tu ubicación.',
      stepperLabel: 'En Camino',
      stepperDesc: 'El repartidor va hacia ti',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu orden ya fue despachada y está en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: '¡Que lo disfrutes!',
      subtitle: 'Tu comida fue entregada con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: '¡Que lo disfrutes!',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Esta comanda fue anulada.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Pedido anulado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  retail: {
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Esperando Cotización de Flete',
      subtitle: 'La tienda está calculando la tarifa de envío para tu compra.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Verificando stock',
      graceBanner: (s) => `¡Compra confirmada! Pasando a empaque en ${s}s...`,
      kitchenLockedNotice: 'Tu paquete ya está en proceso de alistamiento y empaque. No puede cancelarse automáticamente. Si tienes dudas, contacta a la tienda:',
      acceptButton: 'Aceptar y Pasar a Empaque',
    },
    COTIZACION_ENVIADA: {
      badge: 'Tarifa de Envío Fijada',
      title: 'La tienda fijó el valor del envío',
      subtitle: 'Revisa el total con flete y confirma tu orden para iniciar el empaque de tus productos.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Tarifa lista',
      graceBanner: (s) => `¡Compra confirmada! Pasando a empaque en ${s}s...`,
      kitchenLockedNotice: 'Tu paquete ya está en proceso de alistamiento y empaque. No puede cancelarse automáticamente. Si tienes dudas, contacta a la tienda:',
      acceptButton: 'Aceptar y Pasar a Empaque',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Ventana de Gracia (60s)',
      title: '¡Compra Confirmada!',
      subtitle: 'Tus prendas y artículos pasarán a empaque al terminar el contador.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Ventana de gracia',
      graceBanner: (s) => `¡Compra confirmada! Pasando a empaque en ${s}s...`,
      kitchenLockedNotice: 'Tu paquete ya está en proceso de alistamiento y empaque. No puede cancelarse automáticamente. Si tienes dudas, contacta a la tienda:',
      acceptButton: 'Aceptar y Pasar a Empaque',
    },
    EN_PREPARACION: {
      badge: 'En Empaque',
      title: 'Empacando tu Compra',
      subtitle: 'Estamos verificando, doblando y empacando tus prendas y artículos con cuidado.',
      stepperLabel: 'En Empaque',
      stepperDesc: 'Empacando productos',
      graceBanner: () => 'Tus artículos están en proceso de empaque.',
      kitchenLockedNotice: 'Tu paquete ya está en proceso de alistamiento y empaque. No puede cancelarse automáticamente. Si tienes dudas, contacta a la tienda:',
      acceptButton: 'Aceptar y Pasar a Empaque',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu paquete va en ruta con la mensajería hacia tu dirección.',
      stepperLabel: 'En Camino',
      stepperDesc: 'Mensajero en camino',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu paquete ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: '¡Compra Entregada!',
      subtitle: 'Tus productos han sido entregados con éxito. ¡Esperamos que los disfrutes!',
      stepperLabel: 'Entregado',
      stepperDesc: '¡Disfruta tu compra!',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Compra Cancelada',
      subtitle: 'Esta compra fue anulada.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Compra anulada',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  pharmacy: {
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando Envío de Farmacia',
      subtitle: 'El farmacéutico está verificando cobertura y tarifa de mensajería para tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Revisando pedido',
      graceBanner: (s) => `¡Pedido confirmado! Pasando a dispensación en ${s}s...`,
      kitchenLockedNotice: 'Tus medicamentos ya están siendo dispensados y sellados. No pueden cancelarse automáticamente. Si necesitas soporte, contacta a la farmacia:',
      acceptButton: 'Aceptar y Pasar a Dispensación',
    },
    COTIZACION_ENVIADA: {
      badge: 'Envío Confirmado',
      title: 'La farmacia fijó el valor de tu entrega',
      subtitle: 'Verifica el costo de mensajería y confirma para proceder con la dispensación de tus productos de salud.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Tarifa fijada',
      graceBanner: (s) => `¡Pedido confirmado! Pasando a dispensación en ${s}s...`,
      kitchenLockedNotice: 'Tus medicamentos ya están siendo dispensados y sellados. No pueden cancelarse automáticamente. Si necesitas soporte, contacta a la farmacia:',
      acceptButton: 'Aceptar y Pasar a Dispensación',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Ventana de Gracia (60s)',
      title: '¡Pedido Confirmado!',
      subtitle: 'Tus productos de salud pasarán a dispensación al terminar la cuenta regresiva.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Ventana de gracia',
      graceBanner: (s) => `¡Pedido confirmado! Pasando a dispensación en ${s}s...`,
      kitchenLockedNotice: 'Tus medicamentos ya están siendo dispensados y sellados. No pueden cancelarse automáticamente. Si necesitas soporte, contacta a la farmacia:',
      acceptButton: 'Aceptar y Pasar a Dispensación',
    },
    EN_PREPARACION: {
      badge: 'En Dispensación',
      title: 'Dispensando Medicamentos',
      subtitle: 'El farmacéutico está alistando y sellando tus medicamentos con todas las medidas de bioseguridad.',
      stepperLabel: 'Dispensación',
      stepperDesc: 'Alistando medicamentos',
      graceBanner: () => 'Tus medicamentos están en dispensación.',
      kitchenLockedNotice: 'Tus medicamentos ya están siendo dispensados y sellados. No pueden cancelarse automáticamente. Si necesitas soporte, contacta a la farmacia:',
      acceptButton: 'Aceptar y Pasar a Dispensación',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tu pedido de farmacia va en camino seguro hacia tu ubicación.',
      stepperLabel: 'En Camino',
      stepperDesc: 'Mensajero en ruta',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu pedido de farmacia ya fue despachado.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: '¡Medicamentos Entregados!',
      subtitle: 'Tu pedido de farmacia fue entregado satisfactoriamente.',
      stepperLabel: 'Entregado',
      stepperDesc: 'Entrega completada',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido de farmacia fue anulado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Pedido anulado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  stationery: {
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Calculando Envío de Papelería',
      subtitle: 'La papelería está calculando la tarifa de entrega de tus útiles y suministros.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Revisando lista',
      graceBanner: (s) => `¡Pedido confirmado! Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus artículos ya están en mesón de alistamiento y empaque. No pueden cancelarse automáticamente. Si necesitas ayuda, contacta a la papelería:',
      acceptButton: 'Aceptar y Alistar Artículos',
    },
    COTIZACION_ENVIADA: {
      badge: 'Tarifa Fijada',
      title: 'La papelería fijó el valor de tu domicilio',
      subtitle: 'Verifica el costo de transporte y confirma tu pedido para alistar tus materiales.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Tarifa lista',
      graceBanner: (s) => `¡Pedido confirmado! Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus artículos ya están en mesón de alistamiento y empaque. No pueden cancelarse automáticamente. Si necesitas ayuda, contacta a la papelería:',
      acceptButton: 'Aceptar y Alistar Artículos',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Ventana de Gracia (60s)',
      title: '¡Pedido Confirmado!',
      subtitle: 'Tus artículos pasarán a alistamiento en bodega al finalizar el contador.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Ventana de gracia',
      graceBanner: (s) => `¡Pedido confirmado! Pasando a alistamiento en ${s}s...`,
      kitchenLockedNotice: 'Tus artículos ya están en mesón de alistamiento y empaque. No pueden cancelarse automáticamente. Si necesitas ayuda, contacta a la papelería:',
      acceptButton: 'Aceptar y Alistar Artículos',
    },
    EN_PREPARACION: {
      badge: 'En Alistamiento',
      title: 'Alistando Artículos',
      subtitle: 'Reuniendo, verificando y empacando tus útiles escolares y de oficina.',
      stepperLabel: 'Alistamiento',
      stepperDesc: 'Empacando útiles',
      graceBanner: () => 'Tus útiles están en alistamiento.',
      kitchenLockedNotice: 'Tus artículos ya están en mesón de alistamiento y empaque. No pueden cancelarse automáticamente. Si necesitas ayuda, contacta a la papelería:',
      acceptButton: 'Aceptar y Alistar Artículos',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'Tus útiles van en camino hacia tu dirección.',
      stepperLabel: 'En Camino',
      stepperDesc: 'Mensajero en ruta',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu paquete ya va en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: '¡Útiles Entregados!',
      subtitle: 'Tu pedido de papelería fue entregado con éxito.',
      stepperLabel: 'Entregado',
      stepperDesc: '¡Que te sean muy útiles!',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido de papelería fue anulado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Pedido anulado',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
  },

  general: {
    COTIZACION_PENDIENTE: {
      badge: 'Cotización Requerida',
      title: 'Esperando Cotización de Envío',
      subtitle: 'El comercio está calculando la tarifa de entrega hacia tu dirección.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Confirmando orden',
      graceBanner: (s) => `¡Pedido aceptado! Entrando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación y empaque. No puede cancelarse automáticamente. Si necesitas soporte, contacta al comercio:',
      acceptButton: 'Aceptar y Preparar Pedido',
    },
    COTIZACION_ENVIADA: {
      badge: 'Cotización Enviada',
      title: 'El comercio fijó el valor de tu envío',
      subtitle: 'Revisa el total con flete y confirma tu orden para iniciar el alistamiento de tus productos.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Tarifa fijada',
      graceBanner: (s) => `¡Pedido aceptado! Entrando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación y empaque. No puede cancelarse automáticamente. Si necesitas soporte, contacta al comercio:',
      acceptButton: 'Aceptar y Preparar Pedido',
    },
    CONFIRMADO_GRACIA: {
      badge: 'Ventana de Gracia (60s)',
      title: '¡Pedido Confirmado!',
      subtitle: 'Tu pedido entrará a preparación al terminar la cuenta regresiva.',
      stepperLabel: 'Recibido',
      stepperDesc: 'Ventana de gracia',
      graceBanner: (s) => `¡Pedido aceptado! Entrando a preparación en ${s}s...`,
      kitchenLockedNotice: 'Tu orden ya está en preparación y empaque. No puede cancelarse automáticamente. Si necesitas soporte, contacta al comercio:',
      acceptButton: 'Aceptar y Preparar Pedido',
    },
    EN_PREPARACION: {
      badge: 'En Preparación',
      title: 'En Preparación',
      subtitle: 'Estamos alistando y empacando tu pedido con todo el cuidado.',
      stepperLabel: 'En Preparación',
      stepperDesc: 'Alistando productos',
      graceBanner: () => 'Tu pedido está en preparación.',
      kitchenLockedNotice: 'Tu orden ya está en preparación y empaque. No puede cancelarse automáticamente. Si necesitas soporte, contacta al comercio:',
      acceptButton: 'Aceptar y Preparar Pedido',
    },
    EN_CAMINO: {
      badge: 'En Camino',
      title: 'En Camino',
      subtitle: 'El mensajero ya tiene tu pedido y va en ruta hacia ti.',
      stepperLabel: 'En Camino',
      stepperDesc: 'Repartidor en camino',
      graceBanner: () => '',
      kitchenLockedNotice: 'Tu pedido ya está en camino.',
      acceptButton: '',
    },
    ENTREGADO: {
      badge: 'Entregado',
      title: '¡Pedido Entregado!',
      subtitle: 'Tu pedido fue completado satisfactoriamente.',
      stepperLabel: 'Entregado',
      stepperDesc: '¡Gracias por tu compra!',
      graceBanner: () => '',
      kitchenLockedNotice: '',
      acceptButton: '',
    },
    CANCELADO: {
      badge: 'Cancelado',
      title: 'Pedido Cancelado',
      subtitle: 'Este pedido fue anulado.',
      stepperLabel: 'Cancelado',
      stepperDesc: 'Pedido anulado',
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
  if (!status) return 'COTIZACION_PENDIENTE';
  const s = status.toUpperCase();
  if (s.includes('COTIZACION_PENDIENTE') || s.includes('DOM_PENDIENTE')) return 'COTIZACION_PENDIENTE';
  if (s.includes('COTIZACION_ENVIADA')) return 'COTIZACION_ENVIADA';
  if (s.includes('CONFIRMADO_GRACIA')) return 'CONFIRMADO_GRACIA';
  if (s.includes('PREPAR') || s.includes('COCIN') || s.includes('EMPAQUE') || s.includes('DISPENS') || s.includes('ALIST')) return 'EN_PREPARACION';
  if (s.includes('CAMINO') || s.includes('ENVIAD') || s.includes('DESPACH')) return 'EN_CAMINO';
  if (s.includes('ENTREG') || s.includes('COMPLET')) return 'ENTREGADO';
  if (s.includes('CANCEL')) return 'CANCELADO';
  return 'COTIZACION_PENDIENTE';
}

/**
 * Obtiene los textos y etiquetas adaptadas al rubro del negocio
 */
export function getStatusCopy(status?: string | null, businessType?: string | null): StatusCopy {
  const normType = normalizeBusinessType(businessType);
  const normStatus = normalizeOrderStatus(status);
  return DICTIONARY[normType][normStatus] || DICTIONARY.general[normStatus];
}

/**
 * Devuelve los 4 pasos del Stepper adaptados al rubro de comercio
 */
export function getStepperSteps(businessType?: string | null): StepperStep[] {
  const bType = normalizeBusinessType(businessType);
  return [
    { id: 'nuevo', label: DICTIONARY[bType].COTIZACION_PENDIENTE.stepperLabel, desc: DICTIONARY[bType].COTIZACION_PENDIENTE.stepperDesc },
    { id: 'preparando', label: DICTIONARY[bType].EN_PREPARACION.stepperLabel, desc: DICTIONARY[bType].EN_PREPARACION.stepperDesc },
    { id: 'enviado', label: DICTIONARY[bType].EN_CAMINO.stepperLabel, desc: DICTIONARY[bType].EN_CAMINO.stepperDesc },
    { id: 'entregado', label: DICTIONARY[bType].ENTREGADO.stepperLabel, desc: DICTIONARY[bType].ENTREGADO.stepperDesc },
  ];
}
