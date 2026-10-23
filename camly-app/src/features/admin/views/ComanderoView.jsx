import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Utensils, Plus, Minus, Trash2, Search, Bell, Check, Printer, 
  ShoppingBag, X, ChefHat, Clock, RefreshCw, CheckCircle2
} from 'lucide-react';
import { formatMoney, playNewOrderSound, printThermalReceipt, playTableCallSound } from '../../../lib/utils';
import { saveOrder } from '../../../lib/supabase';
import { useToastStore, useBusinessStore } from '../../../stores';

const QUICK_KITCHEN_TAGS = [
  'Sin cebolla',
  'Sin salsas',
  'Salsa aparte',
  'Término medio',
  'Bien cocido',
  'Poco picante',
  'Sin salpicón',
  'Para llevar'
];

const PRESET_TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function ComanderoView() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const { business, products: globalProducts, categories } = useBusinessStore();
  const addToast = useToastStore((s) => s.addToast);

  const products = outletCtx.products || globalProducts || [];
  const orders = outletCtx.orders || [];
  const reloadOrders = outletCtx.reloadOrders || (() => {});

  // Mesa seleccionada (por query param o por defecto Mesa 1)
  const initialTable = searchParams.get('mesa') || '1';
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [customTableInput, setCustomTableInput] = useState('');
  const [showCustomTableModal, setShowCustomTableModal] = useState(false);

  // Filtros de productos
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Ticket / Comanda activa para la mesa seleccionada
  // Estructura: { [tableId]: Array<{ id, uid, name, price, quantity, options, note }> }
  const [comandasByTable, setComandasByTable] = useState({});
  const activeTicket = comandasByTable[selectedTable] || [];

  // Modal de personalización de producto antes de agregar a la comanda
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [kitchenNote, setKitchenNote] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Estado del proceso de envío
  const [isSending, setIsSending] = useState(false);
  const [lastSentOrder, setLastSentOrder] = useState(null);
  const [generalNote, setGeneralNote] = useState('');

  // Llamados de mesero en tiempo real activos (almacenados como mapa { [mesa]: timestamp })
  const [tableCalls, setTableCalls] = useState(() => {
    try {
      const stored = localStorage.getItem('negu_active_table_calls');
      if (stored) {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const valid = {};
        Object.entries(parsed).forEach(([k, ts]) => {
          if (now - Number(ts) < 1000 * 60 * 5) valid[k] = ts;
        });
        return valid;
      }
    } catch (_) {}
    return {};
  });

  // Limpiar llamado de una mesa de forma definitiva y sincronizada
  const clearTableCall = (tbl) => {
    const strMesa = String(tbl);
    setTableCalls(prev => {
      const next = { ...prev };
      delete next[strMesa];
      try {
        localStorage.setItem('negu_active_table_calls', JSON.stringify(next));
        localStorage.removeItem('negu_table_call_event');
      } catch (_) {}
      return next;
    });

    try {
      const bc = new BroadcastChannel('negu_orders_channel');
      bc.postMessage({ type: 'RESOLVE_WAITER_CALL', mesa: strMesa, businessId: business?.id });
      setTimeout(() => bc.close(), 500);
    } catch (_) {}
  };

  // Escuchar llamados en tiempo real por BroadcastChannel y storage
  useEffect(() => {
    let bc;
    try {
      bc = new BroadcastChannel('negu_orders_channel');
      bc.onmessage = (msg) => {
        if (msg?.data?.type === 'CALL_WAITER') {
          const mesa = String(msg.data.mesa || '');
          if (mesa) {
            setTableCalls(prev => {
              const next = { ...prev, [mesa]: Date.now() };
              try { localStorage.setItem('negu_active_table_calls', JSON.stringify(next)); } catch (_) {}
              return next;
            });
            playTableCallSound();
            addToast(`Mesa #${mesa} solicita atención del mesero`, 'info');
          }
        } else if (msg?.data?.type === 'RESOLVE_WAITER_CALL') {
          const mesa = String(msg.data.mesa || '');
          if (mesa) {
            setTableCalls(prev => {
              const next = { ...prev };
              delete next[mesa];
              return next;
            });
          }
        }
      };
    } catch (_) {}

    const handleStorage = (e) => {
      if (e.key === 'negu_table_call_event' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          const mesa = String(parsed.mesa || '');
          if (mesa) {
            setTableCalls(prev => {
              const next = { ...prev, [mesa]: parsed.timestamp || Date.now() };
              try { localStorage.setItem('negu_active_table_calls', JSON.stringify(next)); } catch (_) {}
              return next;
            });
            playTableCallSound();
          }
        } catch (_) {}
      } else if (e.key === 'negu_active_table_calls' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setTableCalls(parsed || {});
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener('storage', handleStorage);
    };
  }, [addToast, business?.id]);

  // Limpiar llamado de una mesa al seleccionarla o atenderla
  const handleSelectTable = (tbl) => {
    setSelectedTable(String(tbl));
    clearTableCall(tbl);
  };

  // Pedidos activos en cocina/salón para indicar qué mesas están ocupadas
  const activeOrdersByTable = useMemo(() => {
    const map = {};
    (orders || []).forEach(o => {
      const isMesa = o.delivery_type === 'dine_in' || o.entrega_metodo === 'mesa' || /mesa/i.test(o.direccion || '');
      const isPending = !['entregado', 'cancelado'].includes(String(o.estado || o.status || '').toLowerCase());
      if (isMesa && isPending) {
        const tableNum = String(o.mesa || o.table_number || '').trim() || 
          (o.direccion ? (o.direccion.match(/mesa\s*#?\s*(\w+)/i)?.[1] || '') : '');
        if (tableNum) {
          if (!map[tableNum]) map[tableNum] = [];
          map[tableNum].push(o);
        }
      }
    });
    return map;
  }, [orders]);

  // Lista de categorías para el filtro
  const categoryNames = useMemo(() => {
    if (categories?.length > 0) {
      const sorted = [...categories].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(c => c.nombre);
      return ['Todos', ...sorted];
    }
    const set = new Set();
    products.forEach(p => { if (p.category) set.add(p.category); });
    return ['Todos', ...Array.from(set)];
  }, [categories, products]);

  // Productos filtrados
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesQuery = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery && p.available !== false;
    });
  }, [products, selectedCategory, searchQuery]);

  // Abrir personalización de producto o agregarlo de inmediato si no tiene opciones
  const handleProductClick = (product) => {
    const hasOptions = Array.isArray(product.opciones) && product.opciones.length > 0;
    if (hasOptions) {
      const initOpts = {};
      product.opciones.forEach(g => { initOpts[g.id] = []; });
      setSelectedOptions(initOpts);
      setKitchenNote('');
      setItemQuantity(1);
      setCustomizingProduct(product);
    } else {
      // Agregar directo
      addToTicket(product, [], '', 1);
      addToast(`+1 ${product.name}`, 'success');
    }
  };

  // Agregar al ticket de la mesa actual
  const addToTicket = (product, options = [], note = '', quantity = 1) => {
    const extraPrice = (options || []).reduce((sum, opt) => sum + (Number(opt?.precio) || 0), 0);
    const unitPrice = Number(product.price) + extraPrice;
    const uid = `${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newItem = {
      uid,
      id: product.id,
      name: product.name,
      basePrice: Number(product.price),
      price: unitPrice,
      quantity,
      options: options || [],
      note: note.trim()
    };

    setComandasByTable(prev => ({
      ...prev,
      [selectedTable]: [...(prev[selectedTable] || []), newItem]
    }));
  };

  // Modificar cantidad de un ítem en el ticket
  const updateItemQuantity = (uid, delta) => {
    setComandasByTable(prev => {
      const current = prev[selectedTable] || [];
      const updated = current.map(item => {
        if (item.uid === uid) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);

      return { ...prev, [selectedTable]: updated };
    });
  };

  // Eliminar ítem del ticket
  const removeItemFromTicket = (uid) => {
    setComandasByTable(prev => ({
      ...prev,
      [selectedTable]: (prev[selectedTable] || []).filter(item => item.uid !== uid)
    }));
  };

  // Vaciar ticket de la mesa actual
  const clearCurrentTicket = () => {
    setComandasByTable(prev => ({
      ...prev,
      [selectedTable]: []
    }));
  };

  // Confirmar producto desde el modal de personalización
  const handleConfirmCustomization = () => {
    if (!customizingProduct) return;

    // Validar opciones obligatorias
    if (Array.isArray(customizingProduct.opciones)) {
      for (const group of customizingProduct.opciones) {
        const selections = selectedOptions[group.id] || [];
        if (group.requerido && selections.length === 0) {
          addToast(`Debes elegir una opción en "${group.titulo}"`, 'warning');
          return;
        }
        if (group.min_opciones && selections.length < Number(group.min_opciones)) {
          addToast(`Debes elegir al menos ${group.min_opciones} opciones en "${group.titulo}"`, 'warning');
          return;
        }
      }
    }

    const flatOptions = Object.values(selectedOptions).flat();
    addToTicket(customizingProduct, flatOptions, kitchenNote, itemQuantity);
    setCustomizingProduct(null);
    addToast(`+${itemQuantity} ${customizingProduct.name}`, 'success');
  };

  // Alternar selección de opciones con estricta distinción entre selección única (radio) y múltiple (checkbox)
  const toggleOption = (group, option) => {
    setSelectedOptions(prev => {
      const current = prev[group.id] || [];
      const isSingle = group.tipo === 'unica' || Number(group.max_opciones) === 1;

      if (isSingle) {
        const isSame = current.length > 0 && current[0].id === option.id;
        if (isSame && !group.requerido) {
          return { ...prev, [group.id]: [] };
        }
        return { ...prev, [group.id]: [option] };
      }

      // Selección múltiple
      const exists = current.some(o => o.id === option.id);
      if (exists) {
        return { ...prev, [group.id]: current.filter(o => o.id !== option.id) };
      } else {
        const maxLimit = Number(group.max_opciones) || null;
        if (maxLimit && current.length >= maxLimit) {
          addToast(`Máximo ${maxLimit} opciones en "${group.titulo}"`, 'warning');
          return prev;
        }
        return { ...prev, [group.id]: [...current, option] };
      }
    });
  };

  // Subtotal del ticket de la mesa
  const ticketSubtotal = useMemo(() => {
    return activeTicket.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [activeTicket]);

  // Mandar comanda a cocina
  const handleSendToKitchen = async () => {
    if (activeTicket.length === 0) {
      addToast('Agrega al menos un plato o bebida a la comanda', 'warning');
      return;
    }
    if (!business?.id) {
      addToast('No se encontró la información del negocio', 'error');
      return;
    }

    setIsSending(true);
    try {
      const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      const itemsPayload = activeTicket.map(i => ({
        id: i.id,
        nombre: i.name,
        cantidad: i.quantity,
        precio: i.price,
        nota: i.note || '',
        opciones_texto: (i.options || []).map(o => o.nombre || o.label || o.name).join(', '),
        opciones: i.options || []
      }));

      const payload = {
        nombre: `Mesa #${selectedTable}`,
        telefono: 'Servicio en mesa',
        direccion: `Servicio en Mesa ${selectedTable}`,
        mesa: String(selectedTable),
        table_number: String(selectedTable),
        ubicacion_link: null,
        comentarios: generalNote.trim() || `Comanda de salón`,
        total: ticketSubtotal,
        total_amount: ticketSubtotal,
        subtotal_amount: ticketSubtotal,
        domicilio_costo: 0,
        delivery_fee: 0,
        distancia_km: null,
        status: 'preparando',
        estado: 'preparando',
        delivery_type: 'dine_in',
        entrega_metodo: 'mesa',
        pago_metodo: 'mesa',
        payment_method: 'pending_table',
        payment_status: 'pending',
        items: itemsPayload,
        token,
        negocio_id: business.id,
      };

      const orderId = await saveOrder(payload);
      if (!orderId) throw new Error('Error al registrar la comanda');

      const fullCreatedOrder = { ...payload, id: orderId, created_at: new Date().toISOString() };

      // Notificar sonoramente
      playNewOrderSound();

      // Emitir evento por BroadcastChannel para que la vista de Pedidos se actualice inmediatamente
      try {
        const bc = new BroadcastChannel('negu_orders_channel');
        bc.postMessage({ type: 'NEW_ORDER', negocioId: business.id, orderId, mesa: selectedTable });
        setTimeout(() => bc.close(), 1000);
      } catch (_) {}

      try {
        localStorage.setItem('negu_latest_order_event', JSON.stringify({ bid: business.id, orderId, ts: Date.now() }));
      } catch (_) {}

      // Limpiar ticket y llamado activo
      clearCurrentTicket();
      clearTableCall(selectedTable);
      setGeneralNote('');
      setLastSentOrder(fullCreatedOrder);
      reloadOrders();

      addToast(`Comanda de Mesa #${selectedTable} enviada a Cocina`, 'success');
    } catch (err) {
      console.error('Error enviando comanda a cocina:', err);
      addToast(`Error al enviar a cocina: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Imprimir comanda de cocina térmica
  const handlePrintKitchenTicket = (orderToPrint) => {
    const target = orderToPrint || lastSentOrder;
    if (!target) return;
    printThermalReceipt(target, business);
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6 font-sans">
      {/* Header superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <Utensils className="text-slate-700 shrink-0" size={20} />
              <span>Comandero de Mesas</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
              <ChefHat size={13} className="text-slate-600" />
              Toma de pedidos en salón
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Toma órdenes directamente desde el celular o tablet y envíalas a cocina al instante.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/pedidos"
            className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
          >
            <ShoppingBag size={14} />
            <span>Pedidos en vivo</span>
          </Link>
          <button
            onClick={() => reloadOrders()}
            title="Refrescar órdenes"
            className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Salón y Selector de Mesas Profesional (0% IA, limpio y táctil) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Salón de Mesas:
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-900 text-white shadow-2xs">
              Mesa actual: #{selectedTable}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-300" /> Libre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Ocupada / Cocina
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Con borrador
            </span>
            {Object.keys(tableCalls).length > 0 && (
              <span className="flex items-center gap-1.5 font-bold text-rose-600 animate-pulse bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                <Bell size={11} /> {Object.keys(tableCalls).length} llamado(s) pendiente(s)
              </span>
            )}
          </div>
        </div>

        {/* Grid de Mesas del salón */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {PRESET_TABLES.map(num => {
            const strNum = String(num);
            const isSelected = selectedTable === strNum;
            const hasCall = Boolean(tableCalls[strNum]);
            const activeOrders = activeOrdersByTable[strNum] || [];
            const isOccupied = activeOrders.length > 0;
            const hasPendingTicket = (comandasByTable[strNum] || []).length > 0;

            return (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectTable(num)}
                className={`relative p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center min-h-[58px] ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900 ring-offset-2'
                    : hasCall
                      ? 'bg-rose-50 text-rose-900 border-2 border-rose-500 shadow-2xs animate-pulse ring-2 ring-rose-300'
                      : isOccupied
                        ? 'bg-emerald-50 border border-emerald-300/90 text-emerald-950 hover:bg-emerald-100/80 shadow-2xs'
                        : hasPendingTicket
                          ? 'bg-blue-50 border border-blue-300/90 text-blue-950 hover:bg-blue-100/80 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {hasCall && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] text-white shadow-xs">
                    <Bell size={8} />
                  </span>
                )}
                <span className="text-xs sm:text-sm font-black leading-tight">Mesa {num}</span>
                <span className={`text-[10px] font-medium leading-tight mt-0.5 truncate max-w-full ${
                  isSelected ? 'text-slate-300' : hasCall ? 'text-rose-700 font-bold' : isOccupied ? 'text-emerald-700 font-semibold' : hasPendingTicket ? 'text-blue-700' : 'text-slate-400'
                }`}>
                  {hasCall ? 'Llamando' : isOccupied ? `${activeOrders.length} orden` : hasPendingTicket ? 'Borrador' : 'Libre'}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCustomTableModal(true)}
            className="p-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-dashed border-slate-300 flex flex-col items-center justify-center min-h-[58px] transition-all cursor-pointer hover:border-slate-400"
          >
            <Plus size={15} className="text-slate-500 mb-0.5" />
            <span className="text-[11px] leading-tight">Otra mesa</span>
          </button>
        </div>
      </div>

      {/* Modal para ingresar número o nombre de mesa personalizada */}
      {showCustomTableModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Asignar Mesa o Ubicación</h3>
              <button 
                onClick={() => setShowCustomTableModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Escribe el número de mesa o zona (ej: &quot;Terraza 2&quot;, &quot;Barra 1&quot; o &quot;14&quot;):
            </p>
            <input
              type="text"
              autoFocus
              placeholder="Ej: 14 o Terraza 2"
              value={customTableInput}
              onChange={(e) => setCustomTableInput(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCustomTableModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  if (customTableInput.trim()) {
                    handleSelectTable(customTableInput.trim());
                    setCustomTableInput('');
                    setShowCustomTableModal(false);
                  }
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-xl hover:bg-black"
              >
                Seleccionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Principal: Menú a la izquierda + Comanda a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Columna Izquierda: Catálogo y Productos táctiles (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Barra de Filtros y Búsqueda */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                placeholder="Buscar plato, bebida, ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Chips de categorías */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {categoryNames.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grilla de productos táctiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {filteredProducts.map(product => {
              const hasOptions = Array.isArray(product.opciones) && product.opciones.length > 0;
              const inTicketQty = activeTicket
                .filter(i => i.id === product.id)
                .reduce((s, i) => s + i.quantity, 0);

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleProductClick(product)}
                  className={`relative flex flex-col justify-between text-left p-2.5 sm:p-3 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer bg-white group min-h-[115px] ${
                    inTicketQty > 0
                      ? 'border-slate-800 ring-2 ring-slate-900/10 shadow-xs'
                      : 'border-slate-200/90 hover:border-slate-400 hover:shadow-xs'
                  }`}
                >
                  {inTicketQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                      {inTicketQty}
                    </span>
                  )}

                  <div className="flex items-start gap-2">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                        <Utensils size={18} />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-tight">
                        {product.name}
                      </h4>
                      {product.category && (
                        <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                          {product.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 tabular-nums">
                      {formatMoney(product.price)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      {hasOptions ? '+ Opciones' : '+ Agregar'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <Search size={24} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-700">No encontramos productos</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prueba con otro término de búsqueda o cambia la categoría.
              </p>
            </div>
          )}
        </div>

        {/* Columna Derecha: Ticket / Comanda de la Mesa (5 cols) */}
        <div className="lg:col-span-5 space-y-3 sticky top-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
            {/* Header del Ticket */}
            <div className="bg-slate-950 text-white p-3.5 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold text-xs">
                  #{selectedTable}
                </span>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold">Comanda Mesa #{selectedTable}</h3>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {activeTicket.length} producto{activeTicket.length !== 1 ? 's' : ''} en orden
                  </span>
                </div>
              </div>

              {activeTicket.length > 0 && (
                <button
                  type="button"
                  onClick={clearCurrentTicket}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Vaciar
                </button>
              )}
            </div>

            {/* Lista de ítems en el ticket */}
            <div className="p-3.5 space-y-2.5 max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {activeTicket.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <ChefHat size={32} className="mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    Comanda vacía para la Mesa #{selectedTable}
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Toca cualquier plato o bebida del menú para agregarlo a la orden.
                  </p>
                </div>
              ) : (
                activeTicket.map(item => (
                  <div key={item.uid} className="pt-2.5 first:pt-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-slate-900 line-clamp-1">
                          {item.name}
                        </span>
                        {item.options && item.options.length > 0 && (
                          <p className="text-[10px] text-slate-600 font-medium">
                            + {item.options.map(o => o.nombre || o.label || o.name).join(', ')}
                          </p>
                        )}
                        {item.note && (
                          <p className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                            Nota: &quot;{item.note}&quot;
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900 tabular-nums">
                          {formatMoney(item.price * item.quantity)}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {formatMoney(item.price)} c/u
                        </span>
                      </div>
                    </div>

                    {/* Controles de cantidad */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.uid, -1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-700 hover:bg-white active:scale-95 transition-all"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center text-xs font-bold tabular-nums text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.uid, 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md text-slate-700 hover:bg-white active:scale-95 transition-all"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItemFromTicket(item.uid)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                        title="Eliminar de comanda"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pie del ticket: Totales, nota general y botón enviar */}
            {activeTicket.length > 0 && (
              <div className="p-3.5 bg-slate-50 border-t border-slate-200/80 space-y-3">
                {/* Nota general para cocina */}
                <div>
                  <input
                    type="text"
                    placeholder="Instrucción general para cocina..."
                    value={generalNote}
                    onChange={(e) => setGeneralNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-hidden focus:border-slate-500"
                  />
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-600">Total Comanda</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                    {formatMoney(ticketSubtotal)}
                  </span>
                </div>

                {/* Botón Principal: Mandar a Cocina */}
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendToKitchen}
                  className="w-full min-h-12 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-black active:scale-98 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <ChefHat size={16} />
                  )}
                  <span>{isSending ? 'Enviando a cocina...' : 'Mandar a Cocina'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Última orden enviada con botón de imprimir comanda térmica */}
          {lastSentOrder && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 shadow-2xs">
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider block">
                  Última comanda enviada:
                </span>
                <p className="text-xs font-semibold text-emerald-950 truncate">
                  Mesa #{lastSentOrder.mesa || selectedTable} · {formatMoney(lastSentOrder.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handlePrintKitchenTicket(lastSentOrder)}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shrink-0 shadow-2xs"
              >
                <Printer size={13} />
                <span>Imprimir Ticket</span>
              </button>
            </div>
          )}

          {/* Órdenes activas de la mesa seleccionada */}
          {(activeOrdersByTable[selectedTable] || []).length > 0 && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-500" />
                  Comandas activas en Mesa #{selectedTable}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {activeOrdersByTable[selectedTable].length} orden(es)
                </span>
              </div>

              <div className="space-y-2">
                {activeOrdersByTable[selectedTable].map(order => (
                  <div key={order.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Orden #{String(order.id).slice(-4).toUpperCase()} · {formatMoney(order.total_amount || order.total)}
                      </span>
                      <span className="text-[10px] text-slate-500 capitalize">
                        Estado: {order.estado || order.status}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePrintKitchenTicket(order)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                      title="Imprimir comanda"
                    >
                      <Printer size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de personalización de producto (toppings y notas de cocina) */}
      {customizingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="min-w-0 pr-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                  {customizingProduct.name}
                </h3>
                <span className="text-xs text-slate-500 font-medium tabular-nums">
                  Base: {formatMoney(customizingProduct.price)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {/* Grupos de opciones y toppings */}
              {Array.isArray(customizingProduct.opciones) && customizingProduct.opciones.map(group => {
                const currentSelections = selectedOptions[group.id] || [];
                const isSingle = group.tipo === 'unica' || Number(group.max_opciones) === 1;

                return (
                  <div key={group.id} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">
                        {group.titulo}
                      </h4>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {isSingle ? 'Elige 1 (Obligatorio)' : (group.requerido ? 'Obligatorio' : 'Opcional')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(group.opciones || []).map(opt => {
                        const isChosen = currentSelections.some(o => o.id === opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleOption(group, opt)}
                            className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                              isChosen
                                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isSingle ? (
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isChosen ? 'border-white' : 'border-slate-300'}`}>
                                  {isChosen && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                              ) : (
                                <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${isChosen ? 'border-white bg-white text-slate-900' : 'border-slate-300'}`}>
                                  {isChosen && <Check size={11} strokeWidth={3} />}
                                </div>
                              )}
                              <span className="text-xs font-medium truncate">{opt.nombre || opt.label}</span>
                            </div>
                            {Number(opt.precio) > 0 ? (
                              <span className={`text-xs tabular-nums shrink-0 ${isChosen ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                                +{formatMoney(opt.precio)}
                              </span>
                            ) : (
                              <span className={`text-[10px] shrink-0 ${isChosen ? 'text-slate-300' : 'text-slate-400'}`}>
                                Incluido
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Tags rápidos de cocina */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Indicaciones rápidas para cocina:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_KITCHEN_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setKitchenNote(prev => prev ? `${prev}, ${tag}` : tag);
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      +{tag}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Nota personalizada (ej: Bien dorada, sin aderezo...)"
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-slate-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setItemQuantity(q => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-xs font-bold tabular-nums">
                  {itemQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setItemQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold"
                >
                  <Plus size={14} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-black active:scale-98 transition-all flex items-center justify-between"
              >
                <span>Agregar a comanda</span>
                <span className="tabular-nums font-bold text-sm">
                  {formatMoney(
                    (Number(customizingProduct.price) + 
                      Object.values(selectedOptions).flat().reduce((s, o) => s + (Number(o?.precio) || 0), 0)
                    ) * itemQuantity
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
