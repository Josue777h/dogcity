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
 * Plantilla predeterminada para comercios retail (ropa, perfumería, gorras, juguetes, etc.).
 */
export const RETAIL_TEMPLATE_MODULES: BusinessModules = {
  catalog: true,
  orders: true,
  kitchen: false,
  delivery: true,
  loyalty: true,
  appointments: false,
  inventory: true,
};

export interface BusinessVertical {
  id: string;
  businessType: 'food' | 'retail';
  label: string;
  subtitle: string;
  modules: BusinessModules;
  defaultThemeColor: string;
  defaultSecondaryColor: string;
}

export const BUSINESS_VERTICALS: BusinessVertical[] = [
  {
    id: 'food',
    businessType: 'food',
    label: 'Restaurante / Comida',
    subtitle: '',
    modules: FOOD_TEMPLATE_MODULES,
    defaultThemeColor: '#0284C7',
    defaultSecondaryColor: '#F0F9FF',
  },
  {
    id: 'desserts',
    businessType: 'food',
    label: 'Postres / Cafetería',
    subtitle: '',
    modules: FOOD_TEMPLATE_MODULES,
    defaultThemeColor: '#0284C7',
    defaultSecondaryColor: '#F0F9FF',
  },
  {
    id: 'fashion',
    businessType: 'retail',
    label: 'Ropa y Accesorios',
    subtitle: '',
    modules: RETAIL_TEMPLATE_MODULES,
    defaultThemeColor: '#0284C7',
    defaultSecondaryColor: '#F0F9FF',
  },
  {
    id: 'perfumes',
    businessType: 'retail',
    label: 'Perfumería y Belleza',
    subtitle: '',
    modules: RETAIL_TEMPLATE_MODULES,
    defaultThemeColor: '#0284C7',
    defaultSecondaryColor: '#F0F9FF',
  },
  {
    id: 'retail',
    businessType: 'retail',
    label: 'Juguetes y Regalos',
    subtitle: '',
    modules: RETAIL_TEMPLATE_MODULES,
    defaultThemeColor: '#0284C7',
    defaultSecondaryColor: '#F0F9FF',
  },
  {
    id: 'other',
    businessType: 'retail',
    label: 'Otro comercio',
    subtitle: '',
    modules: RETAIL_TEMPLATE_MODULES,
    defaultThemeColor: '#0284C7',
    defaultSecondaryColor: '#F0F9FF',
  },
];

export function getVerticalById(id?: string | null): BusinessVertical {
  const normalized = String(id || '').trim().toLowerCase();
  const exact = BUSINESS_VERTICALS.find(v => v.id === normalized);
  if (exact) return exact;
  if (normalized === 'restaurant' || normalized === 'comida') {
    return BUSINESS_VERTICALS[0];
  }
  if (normalized === 'pharmacy' || normalized === 'stationery') {
    return BUSINESS_VERTICALS.find(v => v.id === 'retail') || BUSINESS_VERTICALS[0];
  }
  return BUSINESS_VERTICALS[0];
}

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

  // 2. Si cuenta con módulos guardados dentro de catalog_design
  if (business.catalog_design?.modules && typeof business.catalog_design.modules === 'object') {
    return {
      ...FOOD_TEMPLATE_MODULES,
      ...business.catalog_design.modules,
    };
  }

  // 3. Si tiene vertical_id explícito dentro de catalog_design
  if (business.catalog_design?.vertical_id) {
    return { ...getVerticalById(business.catalog_design.vertical_id).modules };
  }

  // 4. Si tiene business_template o business_type
  const template = String(business.business_template || business.business_type || 'food').toLowerCase();

  if (template === 'retail' || template === 'pharmacy' || template === 'stationery' || template === 'fashion' || template === 'perfumes' || template === 'other') {
    return { ...RETAIL_TEMPLATE_MODULES };
  }

  // Fallback seguro a la plantilla de Comida
  return { ...FOOD_TEMPLATE_MODULES };
}

/**
 * Comprueba de forma segura si una capacidad específica está activa en el negocio.
 */
export function isModuleEnabled(business: any, moduleKey: ModuleKey): boolean {
  const modules = getEnabledModules(business);
  return Boolean(modules[moduleKey]);
}
