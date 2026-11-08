import { useState, useMemo, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { 
  Utensils, Plus, Minus, Trash2, Search, Bell, Check, Printer, 
  X, ChefHat, Clock, RefreshCw, PenLine, Lock, Unlock, Bluetooth, FileText, CheckCircle2
} from 'lucide-react';
import { formatMoney, playNewOrderSound, printThermalReceipt, playTableCallSound } from '../../../lib/utils';
import { saveOrder, updateOrderRecord, updateOrderStatus } from '../../../lib/supabase';
import { printOrderViaBluetooth, isWebBluetoothSupported } from '../../../lib/bluetoothPrinter';
import { useToastStore, useBusinessStore } from '../../../stores';

const QUICK_KITCHEN_TAGS = [
  'Sin vegetales',
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
  const outletCtx = useOutletContext() || {};
  const { business, products: globalProducts, categories } = useBusinessStore();
  const addToast = useToastStore((s) => s.addToast);

  const products = outletCtx.products || globalProducts || [];
  const orders = outletCtx.orders || [];
  const reloadOrders = outletCtx.reloadOrders || (() => {});
  const isWaiterLocked = outletCtx.isWaiterLocked || false;
  const setIsWaiterLocked = outletCtx.setIsWaiterLocked || (() => {});

  // Estado del bloqueo por PIN (Modo Mesero)
  const [pinModalMode, setPinModalMode] = useState(null); // 'setup' | 'unlock' | null
  const [pinInput, setPinInput] = useState('');

  const pinStorageKey = `negu_admin_pin_${business?.id || 'default'}`;

  const handleToggleWaiterLock = () => {
    if (isWaiterLocked) {
      setPinInput('');
      setPinModalMode('unlock');
      return;
    }
    try {
      const savedPin = localStorage.getItem(pinStorageKey);
      if (!savedPin) {
        setPinInput('');
        setPinModalMode('setup');
      } else {
        localStorage.setItem('negu_waiter_lock_active', 'true');
        setIsWaiterLocked(true);
        addToast('Modo Mesero activado. El menú administrativo está protegido con tu PIN.', 'success');
      }
    } catch {
      setPinInput('');
      setPinModalMode('setup');
    }
  };

  const handleConfirmPinModal = (e) => {
    if (e) e.preventDefault();
    const cleanPin = pinInput.replace(/\D/g, '').slice(0, 4);
    if (cleanPin.length < 4) {
      addToast('El PIN debe tener 4 dígitos numéricos', 'warning');
      return;
    }

    if (pinModalMode === 'setup') {
      try {
        localStorage.setItem(pinStorageKey, cleanPin);
        localStorage.setItem('negu_waiter_lock_active', 'true');
      } catch {}
      setIsWaiterLocked(true);
      setPinModalMode(null);
      setPinInput('');
      addToast('PIN creado y Modo Mesero activado', 'success');
    } else if (pinModalMode === 'unlock') {
      const savedPin = localStorage.getItem(pinStorageKey) || '0000';
      if (cleanPin === savedPin) {
        try {
          localStorage.setItem('negu_waiter_lock_active', 'false');
        } catch {}
        setIsWaiterLocked(false);
        setPinModalMode(null);
        setPinInput('');
        addToast('Panel de administración desbloqueado', 'success');
      } else {
        addToast('PIN incorrecto', 'error');
        setPinInput('');
      }
    }
  };

  // Mesa seleccionada (por query param o por defecto Mesa 1)
  const initialTable = searchParams.get('mesa') || '1';
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [customTableInput, setCustomTableInput] = useState('');
  const [showCustomTableModal, setShowCustomTableModal] = useState(false);

  // Filtros de productos y navegación ágil móvil
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSection, setMobileSection] = useState('menu'); // 'menu' | 'ticket' | 'active'
  const [showAllTablesMobile, setShowAllTablesMobile] = useState(false);

  // Ticket / Comanda activa para la mesa seleccionada
  // Estructura: { [tableId]: Array<{ id, uid, name, price, quantity, options, note }> }
  const [comandasByTable, setComandasByTable] = useState({});
  const activeTicket = comandasByTable[selectedTable] || [];
  const activeTicketQty = useMemo(
    () => activeTicket.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0),
    [activeTicket]
  );

  // Modal de personalización de producto antes de agregar a la comanda
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [kitchenNote, setKitchenNote] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  // Modal para agregar o editar nota rápida directamente a un plato del ticket
  const [editingItemNote, setEditingItemNote] = useState(null);
  const [itemNoteText, setItemNoteText] = useState('');

  // Estado del proceso de envío y edición de órdenes existentes sin alterar el número de orden
  const [isSending, setIsSending] = useState(false);
  const [lastSentOrder, setLastSentOrder] = useState(null);
  const [generalNote, setGeneralNote] = useState('');
  const [editingOrderByTable, setEditingOrderByTable] = useState({}); // { [tableNum]: orderId }
  const [printingBtOrderId, setPrintingBtOrderId] = useState(null);
  const [btMenuOrderId, setBtMenuOrderId] = useState(null);

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

  // Escuchar llamados y cambios de estado desde Pedidos en Vivo en tiempo real por BroadcastChannel y storage
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
        } else if (msg?.data?.type === 'TABLE_ORDER_STATUS_CHANGED') {
          const mesa = String(msg.data.mesa || '');
          const st = String(msg.data.newStatus || '').toUpperCase();
          if (mesa) {
            // Si la orden pasó a En Mesa o Finalizado, limpiar cualquier borrador/edición pendiente de esa mesa
            if (['LISTO_PARA_RECOGER', 'ENTREGADO'].includes(st)) {
              setComandasByTable(prev => ({ ...prev, [mesa]: [] }));
              setEditingOrderByTable(prev => {
                const next = { ...prev };
                delete next[mesa];
                return next;
              });
            }
            if (st === 'LISTO_PARA_RECOGER') {
              addToast(`Mesa #${mesa}: Pedido listo y marcado como En Mesa`, 'info');
            } else if (st === 'ENTREGADO') {
              addToast(`Mesa #${mesa}: Cuenta finalizada y mesa liberada`, 'success');
            }
            reloadOrders();
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
  }, [addToast, business?.id, reloadOrders]);

  // Limpiar llamado de una mesa al seleccionarla o atenderla
  const handleSelectTable = (tbl) => {
    setSelectedTable(String(tbl));
    clearTableCall(tbl);
  };

  // Pedidos activos en cocina/salón para indicar qué mesas están ocupadas (máximo 1 orden vigente por mesa)
  const activeOrdersByTable = useMemo(() => {
    const rawMap = {};
    (orders || []).forEach(o => {
      const isMesa = o.delivery_type === 'dine_in' || o.entrega_metodo === 'mesa' || /mesa/i.test(o.direccion || '');
      const isPending = !['entregado', 'cancelado'].includes(String(o.estado || o.status || '').toLowerCase());
      if (isMesa && isPending) {
        const tableNum = String(o.mesa || o.table_number || '').trim() || 
          (o.direccion ? (o.direccion.match(/mesa\s*#?\s*(\w+)/i)?.[1] || '') : '');
        if (tableNum) {
          if (!rawMap[tableNum]) rawMap[tableNum] = [];
          rawMap[tableNum].push(o);
        }
      }
    });
    // Garantizar que solo se considere la orden activa más reciente por mesa para evitar colisiones visuales
    const cleanMap = {};
    Object.entries(rawMap).forEach(([tbl, list]) => {
      const sorted = [...list].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      cleanMap[tbl] = [sorted[0]];
    });
    return cleanMap;
  }, [orders]);

  // Mapa de categorías por ID para vincular con categoria_id
  const categoryMapById = useMemo(() => {
    const map = {};
    (categories || []).forEach(c => {
      if (c.id) map[c.id] = c.nombre;
    });
    return map;
  }, [categories]);

  // Obtener nombre de categoría confiable de un producto
  const getProductCategory = (p) => {
    if (p.categoria_id && categoryMapById[p.categoria_id]) {
      return categoryMapById[p.categoria_id];
    }
    return p.categoria || p.category || 'Varios';
  };

  // Lista de categorías para el filtro
  const categoryNames = useMemo(() => {
    if (categories?.length > 0) {
      const sorted = [...categories].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '')).map(c => c.nombre);
      return ['Todos', ...sorted];
    }
    const set = new Set();
    products.forEach(p => {
      const cat = getProductCategory(p);
      if (cat) set.add(cat);
    });
    return ['Todos', ...Array.from(set).sort()];
  }, [categories, products, categoryMapById]);

  // Productos filtrados por categoría y búsqueda activa
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const isAvailable = p.disponible !== false && p.available !== false;
      if (!isAvailable) return false;

      const pCat = getProductCategory(p);
      const matchesCat = selectedCategory === 'Todos' || pCat.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCat) return false;

      if (!q) return true;
      const name = (p.name || p.nombre || '').toLowerCase();
      const desc = (p.description || p.descripcion || '').toLowerCase();
      const cat = pCat.toLowerCase();
      return name.includes(q) || desc.includes(q) || cat.includes(q);
    });
  }, [products, selectedCategory, searchQuery, categoryMapById]);

  // Traducir estado de orden de mesa a lenguaje humano claro (nunca mostrar "listo_para_recoger")
  const getMesaStatusInfo = (order) => {
    const raw = String(order?.estado || order?.status || '').toLowerCase();
    if (['listo_para_recoger', 'en_camino', 'enviado'].includes(raw)) {
      return {
        label: 'Servido en Mesa',
        badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
        dotClass: 'bg-indigo-500',
        isServed: true
      };
    }
    if (raw === 'entregado') {
      return {
        label: 'Finalizado',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        dotClass: 'bg-emerald-500',
        isServed: true
      };
    }
    return {
      label: 'En Cocina',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      isServed: false
    };
  };

  // Orden activa principal de la mesa seleccionada y modo de edición actual
  const currentTableActiveOrders = activeOrdersByTable[selectedTable] || [];
  const primaryActiveOrder = currentTableActiveOrders[0] || null;
  const editingOrderId = editingOrderByTable[selectedTable] || null;
  const isTableOrderServed = Boolean(primaryActiveOrder && getMesaStatusInfo(primaryActiveOrder).isServed);

  // Abrir personalización de producto (para opciones y/o notas directas de cocina)
  const openProductCustomize = (product) => {
    const initOpts = {};
    if (Array.isArray(product.opciones)) {
      product.opciones.forEach(g => { initOpts[g.id] = []; });
    }
    setSelectedOptions(initOpts);
    setKitchenNote('');
    setItemQuantity(1);
    setCustomizingProduct(product);
  };

  // Click en producto del catálogo: bloquea si la orden de la mesa ya está lista/servida
  const handleProductClick = (product) => {
    if (isTableOrderServed) {
      addToast(
        `La Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()} de la Mesa #${selectedTable} ya está lista en mesa y no admite más adiciones.`,
        'warning'
      );
      setMobileSection('active');
      return;
    }

    const hasOptions = Array.isArray(product.opciones) && product.opciones.length > 0;
    if (hasOptions) {
      openProductCustomize(product);
    } else {
      addToTicket(product, [], '', 1);
      addToast(`+1 ${product.name || product.nombre}`, 'success');
    }
  };

  // Agregar al ticket de la mesa actual con agrupación inteligente de platos idénticos
  const addToTicket = (product, options = [], note = '', quantity = 1) => {
    const cleanNote = (note || '').trim();
    const basePrice = Number(product.price ?? product.precio ?? 0);
    const extraPrice = (options || []).reduce((sum, opt) => sum + (Number(opt?.precio) || 0), 0);
    const unitPrice = basePrice + extraPrice;

    // Generar firma normalizada de opciones para comparar igualdad exacta
    const optionsSig = (options || [])
      .map(o => String(o.id || o.nombre || ''))
      .sort()
      .join('|');

    setComandasByTable(prev => {
      const currentList = prev[selectedTable] || [];

      // Buscar si ya existe un ítem idéntico (mismo producto, mismas opciones y misma nota)
      const existingIdx = currentList.findIndex(item => {
        if (item.id !== product.id) return false;
        if ((item.note || '').trim() !== cleanNote) return false;
        const itemSig = (item.options || [])
          .map(o => String(o.id || o.nombre || ''))
          .sort()
          .join('|');
        return itemSig === optionsSig;
      });

      if (existingIdx >= 0) {
        // Ya existe exactamente igual: agrupamos e incrementamos la cantidad (ej. x2, x3)
        const updated = [...currentList];
        const existing = updated[existingIdx];
        updated[existingIdx] = {
          ...existing,
          quantity: existing.quantity + quantity
        };
        return { ...prev, [selectedTable]: updated };
      }

      // No existe o difiere en nota/toppings: creamos una fila independiente
      const uid = `${product.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const newItem = {
        uid,
        id: product.id,
        name: product.name || product.nombre || 'Producto',
        basePrice,
        price: unitPrice,
        quantity,
        options: options || [],
        note: cleanNote
      };

      return {
        ...prev,
        [selectedTable]: [...currentList, newItem]
      };
    });
  };

  // Abrir modal de nota rápida para un plato del ticket
  const openItemNoteModal = (item) => {
    setEditingItemNote(item);
    setItemNoteText(item.note || '');
  };

  // Guardar o separar nota para un ítem del ticket
  const handleSaveItemNote = (uid, newNote, splitSingle = false) => {
    const cleanNote = (newNote || '').trim();
    setComandasByTable(prev => {
      const currentList = prev[selectedTable] || [];
      const itemIdx = currentList.findIndex(i => i.uid === uid);
      if (itemIdx === -1) return prev;

      const target = currentList[itemIdx];

      // Caso: El plato tiene cantidad > 1 y el mesero elige separar 1 con una nota diferente
      // (ej: de 2 carnes asadas, 1 va sin vegetales)
      if (splitSingle && target.quantity > 1) {
        const remaining = { ...target, quantity: target.quantity - 1 };
        const newUid = `${target.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const splitItem = {
          ...target,
          uid: newUid,
          quantity: 1,
          note: cleanNote
        };
        const updated = [...currentList];
        updated[itemIdx] = remaining;
        updated.splice(itemIdx + 1, 0, splitItem);
        return { ...prev, [selectedTable]: updated };
      }

      // Caso: Aplicar la nota a todo el ítem
      const updated = [...currentList];
      updated[itemIdx] = {
        ...target,
        note: cleanNote
      };
      return { ...prev, [selectedTable]: updated };
    });

    setEditingItemNote(null);
    setItemNoteText('');
    addToast('Instrucción guardada para el plato', 'success');
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

  // Vaciar ticket de la mesa actual y salir de modo edición si estaba activo
  const clearCurrentTicket = () => {
    setComandasByTable(prev => ({
      ...prev,
      [selectedTable]: []
    }));
    setEditingOrderByTable(prev => {
      const next = { ...prev };
      delete next[selectedTable];
      return next;
    });
  };

  // Cargar una orden activa en el editor para modificar platos/cantidades sin alterar su número de orden (solo si sigue En Cocina)
  const handleLoadOrderToEdit = (order) => {
    if (!order) return;
    if (getMesaStatusInfo(order).isServed) {
      addToast('Esta orden ya fue preparada y servida en mesa; no se puede modificar ni anexar más platos.', 'warning');
      return;
    }
    const rawItems = order.items || order.productos || [];
    const mappedItems = rawItems.map((it, idx) => {
      const qty = Number(it.cantidad ?? it.quantity ?? 1);
      const unitPrice = Number(it.precio ?? it.price ?? 0);
      const opts = Array.isArray(it.opciones)
        ? it.opciones
        : it.opciones_texto
          ? it.opciones_texto.split(',').map((s, i) => ({ id: `opt_${i}`, nombre: s.trim(), precio: 0 })).filter(o => o.nombre)
          : [];
      return {
        uid: `${it.id || idx}_${Date.now()}_${idx}`,
        id: it.id || `custom_${idx}`,
        name: it.nombre || it.name || 'Producto',
        basePrice: unitPrice,
        price: unitPrice,
        quantity: qty,
        options: opts,
        note: it.nota || it.note || ''
      };
    });

    setComandasByTable(prev => ({
      ...prev,
      [selectedTable]: mappedItems
    }));
    setEditingOrderByTable(prev => ({
      ...prev,
      [selectedTable]: order.id
    }));
    setGeneralNote(order.comentarios && order.comentarios !== 'Comanda de salón' ? order.comentarios : '');
    setMobileSection('ticket');
    addToast(`Editando Orden #${String(order.id).slice(-4).toUpperCase()} de Mesa #${selectedTable}`, 'info');
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

  // Mandar comanda a cocina (Solo permitido si la mesa está libre o su orden aún está En Cocina)
  const handleSendToKitchen = async () => {
    if (isTableOrderServed) {
      addToast(
        `La Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()} de la Mesa #${selectedTable} ya está lista y servida en mesa. No se pueden anexar más platos.`,
        'warning'
      );
      clearCurrentTicket();
      return;
    }
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
      const itemsPayload = activeTicket.map(i => ({
        id: i.id,
        nombre: i.name,
        cantidad: i.quantity,
        precio: i.price,
        nota: i.note || '',
        opciones_texto: (i.options || []).map(o => o.nombre || o.label || o.name).join(', '),
        opciones: i.options || []
      }));

      let finalOrderId = null;
      let finalOrderObj = null;

      // CASO 1: Estamos editando/modificando directamente una orden existente (mismo número de orden)
      if (editingOrderId) {
        const targetOrder = currentTableActiveOrders.find(o => o.id === editingOrderId) || primaryActiveOrder;
        const updatedComments = generalNote.trim() || targetOrder?.comentarios || 'Comanda de salón';

        await updateOrderRecord(
          editingOrderId,
          {
            items: itemsPayload,
            total: ticketSubtotal,
            total_amount: ticketSubtotal,
            subtotal_amount: ticketSubtotal,
            comentarios: updatedComments,
            status: 'preparando',
            estado: 'preparando'
          },
          business.id
        );

        finalOrderId = editingOrderId;
        finalOrderObj = {
          ...(targetOrder || {}),
          id: editingOrderId,
          mesa: String(selectedTable),
          table_number: String(selectedTable),
          items: itemsPayload,
          total: ticketSubtotal,
          total_amount: ticketSubtotal,
          subtotal_amount: ticketSubtotal,
          comentarios: updatedComments,
          status: 'preparando',
          estado: 'preparando'
        };

        addToast(`Orden #${String(editingOrderId).slice(-4).toUpperCase()} de Mesa #${selectedTable} modificada sin cambiar su número`, 'success');
      }
      // CASO 2: La mesa YA está ocupada con una orden activa -> Anexamos los nuevos platos a la MISMA orden activa
      else if (primaryActiveOrder) {
        const existingItems = Array.isArray(primaryActiveOrder.items || primaryActiveOrder.productos)
          ? [...(primaryActiveOrder.items || primaryActiveOrder.productos)]
          : [];

        const mergedItems = [...existingItems];
        itemsPayload.forEach(newItem => {
          const matchIdx = mergedItems.findIndex(ex =>
            String(ex.id) === String(newItem.id) &&
            String(ex.opciones_texto || '').trim() === String(newItem.opciones_texto || '').trim() &&
            String(ex.nota || '').trim() === String(newItem.nota || '').trim()
          );
          if (matchIdx >= 0) {
            const prevQty = Number(mergedItems[matchIdx].cantidad ?? mergedItems[matchIdx].quantity ?? 1);
            mergedItems[matchIdx] = {
              ...mergedItems[matchIdx],
              cantidad: prevQty + Number(newItem.cantidad || 1)
            };
          } else {
            mergedItems.push(newItem);
          }
        });

        const combinedTotal = mergedItems.reduce(
          (sum, it) => sum + (Number(it.precio ?? it.price ?? 0) * Number(it.cantidad ?? it.quantity ?? 1)),
          0
        );

        const prevComments = primaryActiveOrder.comentarios && primaryActiveOrder.comentarios !== 'Comanda de salón'
          ? primaryActiveOrder.comentarios
          : '';
        const newComments = generalNote.trim()
          ? (prevComments ? `${prevComments} | Adición: ${generalNote.trim()}` : generalNote.trim())
          : (prevComments || 'Comanda de salón');

        await updateOrderRecord(
          primaryActiveOrder.id,
          {
            items: mergedItems,
            total: combinedTotal,
            total_amount: combinedTotal,
            subtotal_amount: combinedTotal,
            comentarios: newComments,
            status: 'preparando',
            estado: 'preparando'
          },
          business.id
        );

        finalOrderId = primaryActiveOrder.id;
        finalOrderObj = {
          ...primaryActiveOrder,
          id: primaryActiveOrder.id,
          mesa: String(selectedTable),
          table_number: String(selectedTable),
          items: mergedItems,
          total: combinedTotal,
          total_amount: combinedTotal,
          subtotal_amount: combinedTotal,
          comentarios: newComments,
          status: 'preparando',
          estado: 'preparando',
          isAddition: true,
          addedItemsOnly: itemsPayload
        };

        addToast(`Platos anexados a la Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()} de Mesa #${selectedTable}`, 'success');
      }
      // CASO 3: La mesa está libre -> Creamos la orden única de la mesa
      else {
        const token = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
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

        finalOrderId = orderId;
        finalOrderObj = { ...payload, id: orderId, created_at: new Date().toISOString() };
        addToast(`Comanda de Mesa #${selectedTable} enviada a Cocina`, 'success');
      }

      // Notificar sonoramente
      playNewOrderSound();

      // Emitir evento por BroadcastChannel para que la vista de Pedidos se actualice inmediatamente
      try {
        const bc = new BroadcastChannel('negu_orders_channel');
        bc.postMessage({ type: 'NEW_ORDER', negocioId: business.id, orderId: finalOrderId, mesa: selectedTable });
        setTimeout(() => bc.close(), 1000);
      } catch (_) {}

      try {
        localStorage.setItem('negu_latest_order_event', JSON.stringify({ bid: business.id, orderId: finalOrderId, ts: Date.now() }));
      } catch (_) {}

      // Limpiar ticket y llamado activo
      clearCurrentTicket();
      clearTableCall(selectedTable);
      setGeneralNote('');
      setLastSentOrder(finalOrderObj);
      setTimeout(() => {
        setLastSentOrder(prev => (prev?.id === finalOrderId ? null : prev));
      }, 3000);
      reloadOrders();
    } catch (err) {
      console.error('Error enviando comanda a cocina:', err);
      addToast(`Error al enviar a cocina: ${err.message}`, 'error');
    } finally {
      setIsSending(false);
    }
  };

  // Imprimir ticket térmico separado según su propósito: 'kitchen' (solo platos/notas) o 'bill' (cuenta con precios)
  const handlePrintTicket = (orderToPrint, mode = 'kitchen', onlyAdded = false) => {
    const target = orderToPrint || lastSentOrder;
    if (!target) return;
    printThermalReceipt(target, business, {
      mode,
      isAddition: Boolean(onlyAdded && target.addedItemsOnly),
      itemsOverride: onlyAdded && target.addedItemsOnly ? target.addedItemsOnly : null
    });
  };

  // Imprimir por Bluetooth directo (ideal desde celular o tablet Android/PC)
  const handlePrintBluetoothTicket = async (orderToPrint, mode = 'kitchen') => {
    const target = orderToPrint || lastSentOrder;
    if (!target) return;
    if (!isWebBluetoothSupported()) {
      addToast('Abriendo ventana de impresión del sistema (puedes elegir tu impresora Bluetooth vinculada)...', 'info');
      handlePrintTicket(target, mode);
      return;
    }
    setPrintingBtOrderId(target.id);
    setBtMenuOrderId(null);
    addToast(`Conectando impresora Bluetooth (${mode === 'kitchen' ? 'Comanda Cocina' : 'Cuenta'})...`, 'info');
    try {
      const printerName = await printOrderViaBluetooth(target, business, { mode });
      addToast(`${mode === 'kitchen' ? 'Comanda de cocina' : 'Cuenta'} enviada a "${printerName}"`, 'success');
    } catch (err) {
      if (err.name !== 'NotFoundError') {
        addToast(err.message || 'No se pudo imprimir por Bluetooth', 'error');
      }
    } finally {
      setPrintingBtOrderId(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 pb-24 lg:pb-6 font-sans">
      {/* Modal de Configuración / Desbloqueo por PIN de 4 dígitos */}
      {pinModalMode && (
        <div className="fixed inset-0 z-[180] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <form
            onSubmit={handleConfirmPinModal}
            className="bg-white rounded-2xl p-5 max-w-xs w-full space-y-4 shadow-2xl border border-slate-200 animate-scale-up"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Lock size={15} />
                </div>
                <h3 className="text-sm font-bold text-slate-900">
                  {pinModalMode === 'setup' ? 'Configurar PIN Admin' : 'Desbloquear Panel'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPinModalMode(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {pinModalMode === 'setup'
                ? 'Define un PIN de 4 dígitos. Cuando actives el Modo Mesero, solo quien tenga este PIN podrá ver Pedidos, Ingresos o Configuración.'
                : 'Ingresa el PIN de 4 dígitos del administrador para volver al panel completo.'}
            </p>

            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              placeholder="••••"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-xl font-black tracking-[0.5em] text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPinModalMode(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={pinInput.length < 4}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-black disabled:opacity-40 rounded-xl cursor-pointer transition-colors"
              >
                {pinModalMode === 'setup' ? 'Guardar y Bloquear' : 'Desbloquear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Salón y Comandero Unificado (Ágil en móvil, cero espacios vacíos) */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 shrink-0">
              <Utensils className="text-slate-700 shrink-0" size={17} />
              <span>Comandero</span>
            </h1>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-brand text-white shadow-2xs shrink-0">
              Mesa #{selectedTable}
            </span>
            {primaryActiveOrder && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${getMesaStatusInfo(primaryActiveOrder).badgeClass}`}>
                {getMesaStatusInfo(primaryActiveOrder).label} · #{String(primaryActiveOrder.id).slice(-4).toUpperCase()}
              </span>
            )}
            {Object.keys(tableCalls).length > 0 && (
              <span className="flex items-center gap-1 font-bold text-[11px] text-rose-600 animate-pulse bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 truncate">
                <Bell size={11} className="shrink-0" /> {Object.keys(tableCalls).length} llamado(s)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleToggleWaiterLock}
              title={isWaiterLocked ? 'Ingresar PIN de administrador para desbloquear todo el panel' : 'Bloquear pantalla en Modo Mesero'}
              aria-label={isWaiterLocked ? 'Desbloquear panel con PIN' : 'Activar Modo Mesero con PIN'}
              className={`h-9 px-2.5 sm:px-3 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer border shrink-0 ${
                isWaiterLocked
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-900 hover:bg-black text-white border-slate-900'
              }`}
            >
              {isWaiterLocked ? <Unlock size={13} className="shrink-0" /> : <Lock size={13} className="shrink-0" />}
              <span className="hidden sm:inline">{isWaiterLocked ? 'Salir PIN' : 'Modo Mesero'}</span>
            </button>

            {!isWaiterLocked && localStorage.getItem(pinStorageKey) && (
              <button
                type="button"
                onClick={() => { setPinInput(''); setPinModalMode('setup'); }}
                title="Cambiar el PIN de 4 dígitos"
                className="h-9 px-2 sm:px-2.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer transition-colors shrink-0"
              >
                PIN
              </button>
            )}

            <button
              type="button"
              onClick={() => reloadOrders()}
              title="Refrescar comandas y mesas"
              aria-label="Refrescar comandas y mesas"
              className="h-9 w-9 sm:w-auto sm:px-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAllTablesMobile((v) => !v)}
              className="lg:hidden h-9 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              {showAllTablesMobile ? 'Fila' : 'Mesas ▾'}
            </button>
          </div>
        </div>

        {/* Selector de Mesas: Tira horizontal rápida en móvil por defecto, o cuadrícula completa */}
        <div
          className={
            showAllTablesMobile
              ? 'grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5 sm:gap-2'
              : 'flex lg:grid lg:grid-cols-12 items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-0.5'
          }
        >
          {PRESET_TABLES.map(num => {
            const strNum = String(num);
            const isSelected = selectedTable === strNum;
            const hasCall = Boolean(tableCalls[strNum]);
            const activeOrders = activeOrdersByTable[strNum] || [];
            const isOccupied = activeOrders.length > 0;
            const firstOrder = activeOrders[0] || null;
            const tableStatusInfo = firstOrder ? getMesaStatusInfo(firstOrder) : null;
            const hasPendingTicket = (comandasByTable[strNum] || []).length > 0;

            return (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectTable(num)}
                className={`relative px-3 py-2 lg:p-2 rounded-xl font-bold text-xs transition-all cursor-pointer flex flex-col items-center justify-center shrink-0 min-w-[68px] lg:min-w-0 min-h-[48px] lg:min-h-[54px] ${
                  isSelected
                    ? 'bg-brand text-white shadow-sm ring-2 ring-slate-900/15'
                    : hasCall
                      ? 'bg-rose-50 text-rose-900 border-2 border-rose-500 shadow-2xs animate-pulse'
                      : isOccupied
                        ? tableStatusInfo?.isServed
                          ? 'bg-indigo-50 border border-indigo-300 text-indigo-950 hover:bg-indigo-100/80'
                          : 'bg-amber-50 border border-amber-300 text-amber-950 hover:bg-amber-100/80'
                        : hasPendingTicket
                          ? 'bg-blue-50 border border-blue-300/90 text-blue-950 hover:bg-blue-100/80'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {hasCall && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] text-white shadow-xs">
                    <Bell size={8} />
                  </span>
                )}
                <span className="text-xs font-black leading-tight whitespace-nowrap">Mesa {num}</span>
                <span className={`text-[10px] font-medium leading-tight mt-0.5 truncate max-w-full ${
                  isSelected
                    ? 'text-white/90 font-semibold'
                    : hasCall
                      ? 'text-rose-700 font-bold'
                      : isOccupied
                        ? tableStatusInfo?.isServed
                          ? 'text-indigo-700 font-semibold'
                          : 'text-amber-800 font-semibold'
                        : hasPendingTicket
                          ? 'text-blue-700'
                          : 'text-slate-400'
                }`}>
                  {hasCall
                    ? 'Llamando'
                    : isOccupied
                      ? (tableStatusInfo?.isServed ? 'En Mesa' : 'En Cocina')
                      : hasPendingTicket
                        ? 'Borrador'
                        : 'Libre'}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setShowCustomTableModal(true)}
            className="px-3 py-2 lg:p-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-50 text-slate-600 border border-dashed border-slate-300 flex flex-col items-center justify-center shrink-0 min-w-[68px] lg:min-w-0 min-h-[48px] lg:min-h-[54px] transition-all cursor-pointer hover:border-slate-400"
          >
            <Plus size={14} className="text-slate-500 mb-0.5" />
            <span className="text-[10px] leading-tight whitespace-nowrap">Otra</span>
          </button>
        </div>
      </div>

      {/* Navegación Segmentada Móvil (Cero scroll largo: salta entre Carta, Comanda y Orden Activa en 1 toque sin truncar texto) */}
      <div className="lg:hidden grid grid-cols-3 gap-1 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs sticky top-14 z-30 overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileSection('menu')}
          className={`min-h-10 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer min-w-0 ${
            mobileSection === 'menu'
              ? 'bg-brand text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Utensils size={13} className="shrink-0" />
          <span className="truncate">Carta ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSection('ticket')}
          className={`min-h-10 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer min-w-0 ${
            mobileSection === 'ticket'
              ? 'bg-brand text-white shadow-2xs'
              : activeTicketQty > 0
                ? 'bg-blue-50 text-blue-900 border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ChefHat size={13} className="shrink-0" />
          <span className="truncate">Comanda ({activeTicketQty})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileSection('active')}
          className={`min-h-10 py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer min-w-0 ${
            mobileSection === 'active'
              ? 'bg-brand text-white shadow-2xs'
              : currentTableActiveOrders.length > 0
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock size={13} className="shrink-0" />
          <span className="truncate">Activa ({currentTableActiveOrders.length})</span>
        </button>
      </div>

      {/* Modal para ingresar número o nombre de mesa personalizada */}
      {showCustomTableModal && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
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
        <div className={`${mobileSection === 'menu' ? 'block' : 'hidden'} lg:block lg:col-span-7 space-y-3`}>
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

            {/* Chips de categorías con color de marca activo */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              {categoryNames.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-brand text-white shadow-2xs'
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
                      ? 'border-brand ring-2 ring-brand/15 shadow-xs'
                      : 'border-slate-200/90 hover:border-slate-400 hover:shadow-xs'
                  }`}
                >
                  {inTicketQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-xs">
                      {inTicketQty}
                    </span>
                  )}

                  <div className="flex items-start gap-2.5 min-w-0 overflow-hidden">
                    <div className="relative shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover bg-slate-100"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                          <Utensils size={17} />
                        </div>
                      )}
                      {hasOptions && (
                        <span
                          className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white flex items-center justify-center shadow-2xs"
                          title="Personalizable"
                        >
                          <Plus size={10} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 overflow-hidden">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 break-words leading-snug">
                        {product.name}
                      </h4>
                      {product.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 break-words text-ellipsis overflow-hidden leading-snug mt-0.5">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 min-w-0">
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900 tabular-nums shrink-0">
                      {formatMoney(product.price)}
                    </span>
                    <span className="inline-flex h-8 items-center justify-center gap-1 text-xs font-bold px-2.5 rounded-lg bg-slate-900 text-white shadow-2xs shrink-0 active:scale-95 transition-transform">
                      <Plus size={12} strokeWidth={2.5} />
                      <span>{hasOptions ? 'Elegir' : 'Agregar'}</span>
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

        {/* Columna Derecha: Ticket / Comanda de la Mesa y Órdenes En Cocina (5 cols) */}
        <div className={`${mobileSection !== 'menu' ? 'block' : 'hidden'} lg:block lg:col-span-5 space-y-3 lg:sticky lg:top-4`}>
          {/* Tarjeta de Comanda Activa (Visible siempre en PC y en tab 'ticket' en móvil) */}
          <div className={`${mobileSection === 'ticket' ? 'flex' : 'hidden'} lg:flex bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex-col`}>
            {/* Header del Ticket */}
            <div className="bg-slate-50 px-3.5 py-3 sm:p-4 flex items-center justify-between border-b border-slate-200 text-slate-900 gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-black text-xs shrink-0 shadow-2xs">
                  #{selectedTable}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {isTableOrderServed
                      ? `Mesa #${selectedTable} · Orden Lista`
                      : editingOrderId
                        ? `Editando Orden #${String(editingOrderId).slice(-4).toUpperCase()}`
                        : primaryActiveOrder
                          ? `Adicionar a Mesa #${selectedTable}`
                          : `Comanda Mesa #${selectedTable}`}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium block truncate mt-0.5">
                    {isTableOrderServed
                      ? `Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()} servida en mesa`
                      : editingOrderId
                        ? 'Mismo número de orden'
                        : primaryActiveOrder
                          ? `Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()}`
                          : `${activeTicketQty} ${activeTicketQty === 1 ? 'plato en orden' : 'platos en orden'}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isTableOrderServed && (
                  <button
                    type="button"
                    onClick={() => setMobileSection('menu')}
                    className="lg:hidden text-xs text-slate-700 hover:text-slate-900 font-bold px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 transition-colors active:scale-95 cursor-pointer"
                  >
                    + Platos
                  </button>
                )}
                {(activeTicket.length > 0 || editingOrderId) && (
                  <button
                    type="button"
                    onClick={clearCurrentTicket}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors border border-rose-200 shrink-0 active:scale-95 cursor-pointer"
                  >
                    {editingOrderId ? 'Cancelar' : 'Vaciar'}
                  </button>
                )}
              </div>
            </div>

            {/* Badge conciso cuando la mesa tiene una orden activa EN COCINA */}
            {primaryActiveOrder && !isTableOrderServed && !editingOrderId && (
              <div className="px-3.5 py-2 bg-amber-50/90 border-b border-amber-200/80 flex items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-amber-950 truncate">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>
                    En cocina • {(primaryActiveOrder.items || primaryActiveOrder.productos || []).reduce((acc, i) => acc + Number(i.cantidad ?? i.quantity ?? 1), 0)} platos
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleLoadOrderToEdit(primaryActiveOrder)}
                  className="px-3 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs shrink-0 transition-colors active:scale-95 cursor-pointer"
                >
                  Editar
                </button>
              </div>
            )}

            {/* Lista de ítems en el ticket o bloqueo cuando la orden ya fue preparada y servida en mesa */}
            <div className="p-3.5 max-h-[420px] overflow-y-auto">
              {isTableOrderServed ? (
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Lock size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-indigo-950 truncate">
                        Orden #{String(primaryActiveOrder.id).slice(-4).toUpperCase()} servida en Mesa #{selectedTable}
                      </p>
                      <p className="text-[11px] text-indigo-800/90 leading-snug">
                        Cerrada a adiciones. Finalízala en <strong>Pedidos en Vivo</strong>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePrintTicket(primaryActiveOrder, 'bill', false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-2xs cursor-pointer transition-colors shrink-0"
                  >
                    <Printer size={13} />
                    <span>Cuenta ({formatMoney(primaryActiveOrder.total_amount || primaryActiveOrder.total)})</span>
                  </button>
                </div>
              ) : activeTicket.length === 0 ? (
                <div className="py-6 text-center text-slate-400 space-y-2.5">
                  <ChefHat size={26} className="mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    {primaryActiveOrder
                      ? `Selecciona platos de la carta para anexar a la Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()}`
                      : `Comanda vacía para la Mesa #${selectedTable}`}
                  </p>
                  <button
                    type="button"
                    onClick={() => setMobileSection('menu')}
                    className="lg:hidden inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-2xs active:scale-95 transition-transform"
                  >
                    <Plus size={13} /> Ir a la Carta
                  </button>
                </div>
              ) : (
                activeTicket.map(item => (
                  <div
                    key={item.uid}
                    className="border-b border-slate-200/80 pb-3 mb-3 last:border-b-0 last:pb-0 last:mb-0 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <span className="inline-block bg-slate-900 text-white text-[11px] font-extrabold px-1.5 py-0.5 rounded-md shrink-0">
                            x{item.quantity}
                          </span>
                          <span className="font-bold text-sm text-slate-900 leading-snug break-words">
                            {item.name}
                          </span>
                        </div>

                        {item.options && item.options.length > 0 && (
                          <div className="ml-6 mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md inline-block break-words">
                            + {item.options.map(o => o.nombre || o.label || o.name).join(', ')}
                          </div>
                        )}

                        {/* Micro-píldora de nota del cocinero subordinada al plato */}
                        <div className="ml-6 mt-1.5">
                          {item.note ? (
                            <button
                              type="button"
                              onClick={() => openItemNoteModal(item)}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200/90 hover:bg-amber-100 transition-colors cursor-pointer text-left break-words"
                              title="Toca para editar instrucción"
                            >
                              <PenLine size={11} className="text-amber-700 shrink-0" />
                              <span>{item.note}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openItemNoteModal(item)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 bg-slate-100/80 hover:bg-slate-200/70 px-2 py-1 rounded-md transition-colors cursor-pointer"
                              title="Agregar instrucción para cocina a este plato"
                            >
                              <PenLine size={11} className="text-slate-400 shrink-0" />
                              <span>+ Nota cocina</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-slate-900 tabular-nums whitespace-nowrap">
                          {formatMoney(item.price * item.quantity)}
                        </span>
                        {item.quantity > 1 && (
                          <span className="block text-[11px] text-slate-500 tabular-nums whitespace-nowrap">
                            {formatMoney(item.price)} c/u
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Controles de cantidad y borrar con hit-target mínimo de 40x40px */}
                    <div className="flex items-center justify-between pt-0.5">
                      <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200/80 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.uid, -1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all cursor-pointer"
                          aria-label="Restar unidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-xs sm:text-sm font-bold tabular-nums text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItemQuantity(item.uid, 1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-700 hover:bg-white active:scale-95 transition-all cursor-pointer"
                          aria-label="Sumar unidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItemFromTicket(item.uid)}
                        className="w-10 h-10 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center cursor-pointer shrink-0 border border-slate-200/60 hover:border-rose-200 bg-white"
                        title="Eliminar plato de la comanda"
                        aria-label="Eliminar plato de la comanda"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pie del ticket: Totales, nota general y botón enviar */}
            {!isTableOrderServed && activeTicket.length > 0 && (
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
                  <span className="text-xs font-medium text-slate-600">
                    {editingOrderId
                      ? 'Nuevo Total de la Orden'
                      : primaryActiveOrder
                        ? 'Subtotal a anexar'
                        : 'Total Comanda'}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 tabular-nums">
                    {formatMoney(ticketSubtotal)}
                  </span>
                </div>

                {/* Botón Principal: Mandar a Cocina / Anexar / Guardar Cambios */}
                <button
                  type="button"
                  disabled={isSending}
                  onClick={handleSendToKitchen}
                  className="w-full min-h-12 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-brand hover:opacity-95 active:scale-98 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <RefreshCw className="animate-spin" size={16} />
                  ) : (
                    <ChefHat size={16} />
                  )}
                  <span>
                    {isSending
                      ? 'Actualizando en cocina...'
                      : editingOrderId
                        ? `Guardar Cambios en Orden #${String(editingOrderId).slice(-4).toUpperCase()}`
                        : primaryActiveOrder
                           ? `Anexar Platos a Orden #${String(primaryActiveOrder.id).slice(-4).toUpperCase()}`
                          : 'Mandar a Cocina'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Toast temporal compacto (3 s) al enviar comanda o adición */}
          {lastSentOrder && (
            <div className="px-3 py-2 bg-emerald-600 text-white rounded-xl flex items-center justify-between gap-2 text-xs shadow-sm animate-fade-in">
              <span className="font-bold truncate">
                ✓ Orden #{String(lastSentOrder.id).slice(-4).toUpperCase()} enviada a cocina
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handlePrintTicket(lastSentOrder, 'kitchen', Boolean(lastSentOrder.isAddition))}
                  className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={12} />
                  <span>Imprimir</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLastSentOrder(null)}
                  className="p-1 text-white/80 hover:text-white rounded-md"
                  aria-label="Cerrar"
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          )}

          {/* Órdenes activas de la mesa seleccionada */}
          <div
            className={`${
              mobileSection === 'active'
                ? 'block'
                : currentTableActiveOrders.length > 0
                  ? 'hidden lg:block'
                  : 'hidden'
            } bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 overflow-hidden`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 truncate">
                <Clock size={14} className="text-slate-500 shrink-0" />
                <span>Orden activa · Mesa #{selectedTable}</span>
              </span>
              {currentTableActiveOrders.length > 0 && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${getMesaStatusInfo(primaryActiveOrder).badgeClass}`}>
                  {getMesaStatusInfo(primaryActiveOrder).label}
                </span>
              )}
            </div>

            {currentTableActiveOrders.length === 0 ? (
              <div className="py-6 text-center space-y-1.5">
                <Clock size={24} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">
                  La Mesa #{selectedTable} está libre
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentTableActiveOrders.map(order => {
                  const stInfo = getMesaStatusInfo(order);
                  const orderItems = order.items || order.productos || [];
                  const isBtOpen = btMenuOrderId === order.id;
                  const totalDishes = orderItems.reduce((acc, i) => acc + Number(i.cantidad ?? i.quantity ?? 1), 0);

                  return (
                    <div key={order.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-2.5 overflow-hidden">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="font-extrabold text-slate-900 text-sm block truncate">
                            Orden #{String(order.id).slice(-4).toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {totalDishes} {totalDishes === 1 ? 'plato' : 'platos'} • <strong className="text-slate-900 font-bold">{formatMoney(order.total_amount || order.total)}</strong>
                          </span>
                        </div>

                        {!stInfo.isServed ? (
                          <button
                            type="button"
                            onClick={() => handleLoadOrderToEdit(order)}
                            className="h-9 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer shrink-0 shadow-2xs"
                            title="Modificar platos mientras sigue en cocina"
                          >
                            <PenLine size={12} />
                            <span>Editar</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold shrink-0">
                            <Lock size={11} />
                            <span>Orden lista</span>
                          </span>
                        )}
                      </div>

                      {/* Lista clara y separada de platos actuales en la mesa */}
                      {orderItems.length > 0 && (
                        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 max-h-48 overflow-y-auto">
                          {orderItems.map((it, idx) => {
                            const qty = it.cantidad ?? it.quantity ?? 1;
                            const name = it.nombre ?? it.name ?? 'Plato';
                            const note = it.nota || it.note || '';
                            const optText = it.opciones_texto || '';
                            return (
                              <div
                                key={idx}
                                className="border-b border-slate-100 pb-2 mb-2 last:border-b-0 last:pb-0 last:mb-0"
                              >
                                <div className="flex items-start justify-between gap-2 text-xs leading-snug">
                                  <div className="flex items-start gap-1.5 min-w-0">
                                    <span className="px-1.5 py-0.5 bg-slate-900 text-white rounded font-extrabold text-[10px] shrink-0">
                                      x{qty}
                                    </span>
                                    <span className="font-semibold text-slate-900 break-words">{name}</span>
                                  </div>
                                  <span className="font-bold text-slate-800 tabular-nums shrink-0">
                                    {formatMoney(Number(it.precio ?? it.price ?? 0) * Number(qty))}
                                  </span>
                                </div>
                                {optText && (
                                  <div className="ml-6 mt-1 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded inline-block break-words">
                                    + {optText}
                                  </div>
                                )}
                                {note && (
                                  <div className="ml-6 mt-1 text-[11px] font-semibold text-amber-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded inline-block break-words">
                                    Nota: {note}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Botones de impresión separados sin desborde en pantallas angostas */}
                      <div className="flex items-center gap-1.5 pt-0.5 w-full min-w-0 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handlePrintTicket(order, 'kitchen', false)}
                          className="flex-1 min-w-0 h-9 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
                          title="Imprimir comanda para cocina (solo platos y notas, sin precios)"
                        >
                          <ChefHat size={13} className="shrink-0" />
                          <span className="truncate">Comanda Cocina</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintTicket(order, 'bill', false)}
                          className="flex-1 min-w-0 h-9 px-2 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors active:scale-95 cursor-pointer"
                          title="Imprimir cuenta para el cliente (con precios y total)"
                        >
                          <Printer size={13} className="shrink-0" />
                          <span className="truncate">Cuenta / Cobro</span>
                        </button>

                        <button
                          type="button"
                          disabled={printingBtOrderId === order.id}
                          onClick={() => setBtMenuOrderId(isBtOpen ? null : order.id)}
                          className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors active:scale-95 cursor-pointer shrink-0 ${
                            isBtOpen
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                          }`}
                          title="Impresión directa a impresora portátil Bluetooth (Celular/Tablet)"
                        >
                          <Bluetooth size={14} className="shrink-0" />
                        </button>
                      </div>

                      {/* Selector compacto Bluetooth para celular/tablet */}
                      {isBtOpen && (
                        <div className="p-2 rounded-lg bg-blue-50/90 border border-blue-200 flex items-center justify-between gap-1.5">
                          <span className="text-[10px] font-bold text-blue-900 pl-1 truncate">
                            Bluetooth POS:
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePrintBluetoothTicket(order, 'kitchen')}
                              className="px-2 py-1 rounded bg-white hover:bg-blue-100 text-blue-900 border border-blue-200 text-[11px] font-bold cursor-pointer"
                            >
                              BT Cocina
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePrintBluetoothTicket(order, 'bill')}
                              className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold cursor-pointer"
                            >
                              BT Cuenta
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Nota concisa de control de estados */}
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-100/80 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Lock size={12} className="text-slate-400 shrink-0" />
                  <span className="truncate">
                    Estados y cierre de cuenta desde <strong>Pedidos en Vivo</strong>.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Barra Flotante Inferior en Móvil cuando el mesero está en la Carta y tiene platos en la comanda */}
      {mobileSection === 'menu' && activeTicket.length > 0 && (
        <div className="lg:hidden fixed bottom-3 inset-x-3 z-40 bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl border border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setMobileSection('ticket')}
            className="flex-1 min-w-0 flex items-center gap-2.5 text-left px-2 py-1 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="w-7 h-7 rounded-lg bg-brand text-white font-black text-xs flex items-center justify-center shrink-0">
              {activeTicketQty}
            </span>
            <div className="min-w-0">
              <span className="text-xs font-bold block truncate">
                {editingOrderId
                  ? `Editando Orden #${String(editingOrderId).slice(-4).toUpperCase()}`
                  : primaryActiveOrder
                    ? `Anexar a Mesa #${selectedTable}`
                    : `Ver Comanda Mesa #${selectedTable}`}
              </span>
              <span className="text-[11px] text-slate-300 font-semibold tabular-nums block">
                Total: {formatMoney(ticketSubtotal)}
              </span>
            </div>
          </button>

          <button
            type="button"
            disabled={isSending}
            onClick={handleSendToKitchen}
            className="px-3.5 py-2.5 rounded-xl bg-brand hover:opacity-95 text-white font-black text-xs flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSending ? <RefreshCw size={14} className="animate-spin" /> : <ChefHat size={14} />}
            <span>
              {editingOrderId
                ? 'Guardar'
                : primaryActiveOrder
                  ? 'Anexar'
                  : 'Mandar a Cocina'}
            </span>
          </button>
        </div>
      )}

      {/* Modal de personalización de producto (toppings y notas de cocina) */}
      {customizingProduct && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] sm:max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up border border-slate-200 my-auto">
            {/* Modal Header */}
            <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 sticky top-0 z-10">
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
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3 flex-1 overscroll-contain">
              {/* Grupos de opciones y toppings */}
              {Array.isArray(customizingProduct.opciones) && customizingProduct.opciones.map(group => {
                const currentSelections = selectedOptions[group.id] || [];
                const isSingle = group.tipo === 'unica' || Number(group.max_opciones) === 1;

                return (
                  <div key={group.id} className="space-y-1.5 rounded-xl border border-slate-200 bg-slate-50/60 p-2 sm:p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {group.titulo}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 border ${
                        group.requerido
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}>
                        {isSingle ? (group.requerido ? 'Elige 1 · Obligatorio' : 'Elige 1 · Opcional') : (group.requerido ? 'Obligatorio' : 'Opcional')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {(group.opciones || []).map(opt => {
                        const isChosen = currentSelections.some(o => o.id === opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => toggleOption(group, opt)}
                            className={`px-2 py-1.5 rounded-lg border text-left flex items-center justify-between gap-1.5 transition-colors cursor-pointer text-xs ${
                              isChosen
                                ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {isSingle ? (
                                <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${isChosen ? 'border-white' : 'border-slate-300'}`}>
                                  {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              ) : (
                                <div className={`w-3.5 h-3.5 rounded-md border-2 flex items-center justify-center shrink-0 ${isChosen ? 'border-white bg-white text-slate-900' : 'border-slate-300'}`}>
                                  {isChosen && <Check size={10} strokeWidth={3} />}
                                </div>
                              )}
                              <span className="text-xs font-medium truncate">{opt.nombre || opt.label}</span>
                            </div>
                            {Number(opt.precio) > 0 ? (
                              <span className={`text-xs tabular-nums shrink-0 ${isChosen ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                                +{formatMoney(opt.precio)}
                              </span>
                            ) : (
                              <span className={`text-[11px] shrink-0 ${isChosen ? 'text-slate-300' : 'text-slate-400'}`}>
                                Inc.
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
              <div className="space-y-1.5 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Indicaciones rápidas para cocina:
                </label>
                <div className="flex flex-wrap gap-1">
                  {QUICK_KITCHEN_TAGS.map(tag => {
                    const isTagActive = kitchenNote.toLowerCase().includes(tag.toLowerCase());
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setKitchenNote(prev => {
                            const parts = prev.split(',').map(s => s.trim()).filter(Boolean);
                            if (parts.some(p => p.toLowerCase() === tag.toLowerCase())) {
                              return parts.filter(p => p.toLowerCase() !== tag.toLowerCase()).join(', ');
                            }
                            return [...parts, tag].join(', ');
                          });
                        }}
                        className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                          isTagActive
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                        }`}
                      >
                        {isTagActive ? `✓ ${tag}` : `+${tag}`}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  placeholder="Nota personalizada (ej: Bien dorada, sin aderezo...)"
                  value={kitchenNote}
                  onChange={(e) => setKitchenNote(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-slate-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center gap-2.5">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setItemQuantity(q => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                >
                  <Minus size={13} />
                </button>
                <span className="w-6 text-center text-xs font-bold tabular-nums">
                  {itemQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => setItemQuantity(q => q + 1)}
                  className="w-7 h-7 rounded-lg text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-black active:scale-98 transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Agregar a comanda</span>
                <span className="tabular-nums font-bold text-xs sm:text-sm">
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

      {/* Modal para editar o agregar instrucción/nota directa a un plato del ticket */}
      {editingItemNote && (
        <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-5 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                  Instrucción: {editingItemNote.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingItemNote.quantity > 1
                    ? `Tienes ${editingItemNote.quantity} unidades de este plato en la comanda`
                    : 'Especifica detalles de preparación para cocina'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingItemNote(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Tags rápidos de cocina */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Selección rápida:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_KITCHEN_TAGS.map(tag => {
                  const isIncluded = itemNoteText.toLowerCase().includes(tag.toLowerCase());
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        if (isIncluded) {
                          const regex = new RegExp(`(^|,\\s*)${tag}`, 'i');
                          setItemNoteText(prev => prev.replace(regex, '').replace(/^,\s*/, '').trim());
                        } else {
                          setItemNoteText(prev => prev.trim() ? `${prev.trim()}, ${tag}` : tag);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isIncluded
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isIncluded ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input de texto para la nota */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Texto de la instrucción:
              </label>
              <input
                type="text"
                autoFocus
                value={itemNoteText}
                onChange={(e) => setItemNoteText(e.target.value)}
                placeholder="Ej: Sin vegetales, término bien cocido..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
              />
            </div>

            {/* Acciones */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setEditingItemNote(null)}
                className="py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors order-2 sm:order-1"
              >
                Cancelar
              </button>

              <div className="flex-1 flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
                {editingItemNote.quantity > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSaveItemNote(editingItemNote.uid, itemNoteText, true)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-colors cursor-pointer"
                      title="Separa 1 plato con esta nota y deja el otro plato normal"
                    >
                      Separar 1 con esta nota
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveItemNote(editingItemNote.uid, itemNoteText, false)}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs transition-colors cursor-pointer"
                    >
                      Aplicar a todos ({editingItemNote.quantity})
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveItemNote(editingItemNote.uid, itemNoteText, false)}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-black text-white shadow-xs transition-colors cursor-pointer"
                  >
                    Guardar instrucción
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
