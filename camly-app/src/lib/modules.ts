/**
 * NEGU Module & Capability Architecture
 * 
 * Separa limpiamente el Núcleo (Core) de las capacidades verticales.
 * Cada negocio opera según los módulos que tiene activados, evitando
 * condicionales dispersos por tipo de negocio en la aplicación.
 */

export type ModuleKey = 
  | 'catalog'      // Catálogo de productos / items
  | 'orders'       // Carrito, recepción y despacho de pedidos
  | 'kitchen'      // Comanda de cocina, tiempos y estados de preparación
  | 'delivery'     // Domicilios, cálculo GPS, repartidores y cotizaciones
  | 'loyalty'      // Sistema transversal de clientes y fidelización
  | 'appointments' // Citas y reservas de agenda (para verticales de servicios)
  | 'inventory';   // Control avanzado de stock, variantes y proveedores

export interface BusinessModules {
  catalog: boolean;
  orders: boolean;
  kitchen: boolean;
  delivery: boolean;
  loyalty: boolean;
  appointments: boolean;
  inventory: boolean;
}

/**
 * Plantilla predeterminada para el vertical gastronómico (NEGU Food).
 */
export const FOOD_TEMPLATE_MODULES: BusinessModules = {
  catalog: true,
  orders: true,
  kitchen: true,
  delivery: true,
  loyalty: true,
  appointments: false,
  inventory: false,
};

/**
 * Resuelve los módulos activos para un negocio dado.
 * Si el negocio tiene módulos explícitos configurados, los usa;
 * de lo contrario, aplica la plantilla correspondiente (default: Food).
 */
export function getEnabledModules(business: any): BusinessModules {
  if (!business) return { ...FOOD_TEMPLATE_MODULES };

  // 1. Si el negocio ya cuenta con módulos configurados explícitamente en BD
  if (business.modules && typeof business.modules === 'object') {
    return {
      ...FOOD_TEMPLATE_MODULES,
      ...business.modules,
    };
  }

  // 2. Si tiene business_template o business_type
  const template = business.business_template || business.business_type || 'food';
  
  if (template === 'food' || template === 'restaurant') {
    return { ...FOOD_TEMPLATE_MODULES };
  }

  // Fallback seguro a la plantilla de Comida (Fase 1)
  return { ...FOOD_TEMPLATE_MODULES };
}

/**
 * Comprueba de forma segura si una capacidad específica está activa en el negocio.
 */
export function isModuleEnabled(business: any, moduleKey: ModuleKey): boolean {
  const modules = getEnabledModules(business);
  return Boolean(modules[moduleKey]);
}
