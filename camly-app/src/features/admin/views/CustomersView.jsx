import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, Search, MessageCircle, Download, Repeat,
  DollarSign, Award, MapPin, ShoppingBag, Clock,
  LayoutGrid, List, Copy, Check, ChevronRight, Settings, Save, RotateCcw
} from 'lucide-react';
import { formatMoney, buildWhatsAppUrl } from '../../../lib/utils';
import { updateBusiness } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SettingsDrawer from '../../../components/ui/SettingsDrawer';

const VIEW_MODE_KEY = 'negu_admin_customers_view_mode';

const DEFAULT_CRM_CONFIG = {
  inactiveDays: 15,
  recurringMinOrders: 2,
  helloTemplate: 'Hola {nombre}, te escribimos desde {tienda}. ¿En qué podemos ayudarte hoy?',
  reactivateTemplate: 'Hola {nombre}, ¡hace días no sabemos de ti en {tienda}! Mira lo nuevo de nuestro catálogo aquí: {link}',
  vipTemplate: 'Hola {nombre}, gracias por ser cliente frecuente de {tienda}. Aquí tienes nuestro catálogo actualizado cuando gustes pedir: {link}',
};

function resolveCrmConfig(business) {
  const fromDb = business?.catalog_design?.crm_config;
  if (fromDb && typeof fromDb === 'object') {
    return { ...DEFAULT_CRM_CONFIG, ...fromDb };
  }
  try {
    const raw = localStorage.getItem(`negu_crm_config_${business?.id || 'default'}`);
    if (raw) return { ...DEFAULT_CRM_CONFIG, ...JSON.parse(raw) };
  } catch {
    // ignore storage errors
  }
  return { ...DEFAULT_CRM_CONFIG };
}

function renderTemplate(template, { name, storeName, storeLink }) {
  const firstName = String(name || 'cliente').trim().split(' ')[0] || 'cliente';
  return String(template || '')
    .replace(/\{nombre\}/gi, firstName)
    .replace(/\{tienda\}/gi, storeName || 'nuestra tienda')
    .replace(/\{link\}/gi, storeLink || '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function normalizePhoneKey(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length < 7) return '';
  return digits.slice(-10);
}

function csvCell(value) {
  let text = String(value ?? '').replace(/\r?\n/g, ' ').trim();
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export default function CustomersView(props) {
  const outletCtx = useOutletContext() || {};
  const orders = useMemo(() => props.orders ?? outletCtx.orders ?? [], [props.orders, outletCtx.orders]);
  const business = props.business ?? outletCtx.business ?? null;
  const reloadOrders = outletCtx.reloadOrders;
  const addToast = useToastStore(s => s.addToast);

  const [crmConfig, setCrmConfig] = useState(() => resolveCrmConfig(business));
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configDraft, setConfigDraft] = useState(() => resolveCrmConfig(business));
  const [configTplTab, setConfigTplTab] = useState('helloTemplate');
  const [savingConfig, setSavingConfig] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [segment, setSegment] = useState('all'); // 'all' | 'recurring' | 'inactive'
  const [sortBy, setSortBy] = useState('orders'); // 'orders' | 'spent' | 'recent'
  const [copiedPhone, setCopiedPhone] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [activeTemplateKey, setActiveTemplateKey] = useState('hello');
  const [nowTs] = useState(() => Date.now());
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem(VIEW_MODE_KEY) === 'list' ? 'list' : 'grid';
    } catch {
      return 'grid';
    }
  });

  const inactiveDays = Math.max(1, Number(crmConfig.inactiveDays) || 15);
  const recurringMin = Math.max(2, Number(crmConfig.recurringMinOrders) || 2);

  const storeName = business?.nombre_visible || 'nuestra tienda';
  const storeLink = typeof window !== 'undefined' && business?.nombre
    ? `${window.location.origin}/${business.nombre}`
    : '';

  const changeViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem(VIEW_MODE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  };

  const openConfigModal = () => {
    setConfigDraft({ ...crmConfig });
    setShowConfigModal(true);
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    const cleanConfig = {
      inactiveDays: Math.max(1, Math.min(365, Number(configDraft.inactiveDays) || 15)),
      recurringMinOrders: Math.max(2, Math.min(50, Number(configDraft.recurringMinOrders) || 2)),
      helloTemplate: String(configDraft.helloTemplate || '').trim() || DEFAULT_CRM_CONFIG.helloTemplate,
      reactivateTemplate: String(configDraft.reactivateTemplate || '').trim() || DEFAULT_CRM_CONFIG.reactivateTemplate,
      vipTemplate: String(configDraft.vipTemplate || '').trim() || DEFAULT_CRM_CONFIG.vipTemplate,
    };

    setSavingConfig(true);
    try {
      try {
        localStorage.setItem(`negu_crm_config_${business?.id || 'default'}`, JSON.stringify(cleanConfig));
      } catch {
        // ignore storage errors
      }
      if (business?.id) {
        const nextDesign = {
          ...(business.catalog_design && typeof business.catalog_design === 'object' ? business.catalog_design : {}),
          crm_config: cleanConfig,
        };
        await updateBusiness(business.id, { catalog_design: nextDesign });
        if (typeof reloadOrders === 'function') reloadOrders();
      }
      setCrmConfig(cleanConfig);
      setShowConfigModal(false);
      addToast('Configuración de Clientes guardada', 'success');
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'No se pudo guardar la configuración', 'error');
    } finally {
      setSavingConfig(false);
    }
  };

  const buildCustomerMessage = (customer, key = 'hello') => {
    const tpl = key === 'reactivate'
      ? crmConfig.reactivateTemplate
      : key === 'vip'
        ? crmConfig.vipTemplate
        : crmConfig.helloTemplate;
    return renderTemplate(tpl, { name: customer?.name, storeName, storeLink });
  };

  const openCustomerModal = (customer) => {
    const defaultKey = customer.isInactive ? 'reactivate' : (customer.orderCount >= recurringMin ? 'vip' : 'hello');
    setSelectedCustomer(customer);
    setActiveTemplateKey(defaultKey);
    setDraftMessage(buildCustomerMessage(customer, defaultKey));
  };

  const customers = useMemo(() => {
    const map = new Map();
    const inactiveCutoff = nowTs - inactiveDays * 24 * 60 * 60 * 1000;

    for (const o of orders) {
      const status = String(o.status || o.estado || '').toLowerCase();
      if (status.includes('cancel')) continue;

      const rawName = String(o.nombre || o.cliente_nombre || '').trim();
      const rawPhone = String(o.telefono || o.cliente_telefono || '').trim();
      const phoneKey = normalizePhoneKey(rawPhone);

      if (!phoneKey && (!rawName || /^mesa\s*#?\s*\d+/i.test(rawName))) {
        continue;
      }

      const key = phoneKey ? `p:${phoneKey}` : `n:${rawName.toLowerCase()}`;
      const orderTotal = Number(o.total_amount || o.total || 0);
      const orderDate = o.created_at ? new Date(o.created_at).getTime() : 0;
      const address = String(o.direccion || '').trim();
      const isGenericAddress = !address || /recoger|mesa/i.test(address);

      let entry = map.get(key);
      if (!entry) {
        entry = {
          key,
          name: rawName || 'Cliente sin nombre',
          phone: rawPhone,
          address: isGenericAddress ? '' : address,
          orderCount: 0,
          totalSpent: 0,
          lastOrderAt: 0,
          productCounts: Object.create(null),
          orderHistory: [],
        };
        map.set(key, entry);
      }

      entry.orderCount += 1;
      entry.totalSpent += orderTotal;
      entry.orderHistory.push({
        id: o.id,
        createdAt: orderDate,
        total: orderTotal,
        status: o.estado || o.status || 'nuevo',
        items: Array.isArray(o.items || o.productos) ? (o.items || o.productos) : [],
      });

      if (orderDate >= entry.lastOrderAt) {
        entry.lastOrderAt = orderDate;
        if (rawName && !/^mesa\s*#?\s*\d+/i.test(rawName)) entry.name = rawName;
        if (rawPhone) entry.phone = rawPhone;
        if (!isGenericAddress) entry.address = address;
      }

      const items = o.items || o.productos;
      if (Array.isArray(items)) {
        for (const it of items) {
          const pName = String(it.nombre || it.name || '').trim();
          if (pName) {
            entry.productCounts[pName] = (entry.productCounts[pName] || 0) + (Number(it.cantidad || it.quantity || 1) || 1);
          }
        }
      }
    }

    return Array.from(map.values()).map(c => {
      const topEntry = Object.entries(c.productCounts).sort((a, b) => b[1] - a[1])[0];
      const sortedHistory = [...c.orderHistory].sort((a, b) => b.createdAt - a.createdAt);
      return {
        ...c,
        orderHistory: sortedHistory,
        favoriteProduct: topEntry ? topEntry[0] : '',
        avgTicket: c.orderCount > 0 ? Math.round(c.totalSpent / c.orderCount) : 0,
        isInactive: c.lastOrderAt > 0 && c.lastOrderAt < inactiveCutoff,
      };
    });
  }, [orders, nowTs, inactiveDays]);

  const stats = useMemo(() => {
    const total = customers.length;
    const recurring = customers.filter(c => c.orderCount >= recurringMin).length;
    const inactive = customers.filter(c => c.isInactive).length;
    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = customers.reduce((sum, c) => sum + c.orderCount, 0);
    const avgTicket = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
    const topCustomer = [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0] || null;
    const retentionPct = total > 0 ? Math.round((recurring / total) * 100) : 0;
    return { total, recurring, inactive, avgTicket, topCustomer, retentionPct };
  }, [customers, recurringMin]);

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const bySegment = customers.filter(c => {
      if (segment === 'recurring') return c.orderCount >= recurringMin;
      if (segment === 'inactive') return c.isInactive;
      return true;
    });

    const list = q
      ? bySegment.filter(c =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.address.toLowerCase().includes(q) ||
          c.favoriteProduct.toLowerCase().includes(q)
        )
      : bySegment;

    return [...list].sort((a, b) => {
      if (sortBy === 'spent') return b.totalSpent - a.totalSpent || b.orderCount - a.orderCount;
      if (sortBy === 'recent') return b.lastOrderAt - a.lastOrderAt;
      return b.orderCount - a.orderCount || b.totalSpent - a.totalSpent;
    });
  }, [customers, searchQuery, segment, sortBy, recurringMin]);

  const handleExportCsv = () => {
    if (filteredCustomers.length === 0) {
      addToast('No hay clientes para exportar', 'info');
      return;
    }
    const headers = ['Nombre', 'Teléfono', 'Dirección', 'Pedidos', 'Total Comprado', 'Ticket Promedio', 'Producto Favorito', 'Última Compra'];
    const rows = filteredCustomers.map(c => [
      csvCell(c.name),
      csvCell(c.phone || '—'),
      csvCell(c.address || '—'),
      csvCell(c.orderCount),
      csvCell(c.totalSpent),
      csvCell(c.avgTicket),
      csvCell(c.favoriteProduct || '—'),
      csvCell(c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('es-CO') : '—'),
    ]);
    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const bizSlug = (business?.nombre || 'negocio').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.href = url;
    a.download = `clientes_${bizSlug}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Exportados ${filteredCustomers.length} clientes a CSV`, 'success');
  };

  const openWhatsAppDirect = (customer, customText = null) => {
    if (!customer.phone) {
      addToast('Este cliente no tiene teléfono registrado', 'warning');
      return;
    }
    const text = customText !== null
      ? customText
      : buildCustomerMessage(customer, customer.isInactive ? 'reactivate' : 'hello');
    window.open(buildWhatsAppUrl(customer.phone, text), '_blank', 'noopener,noreferrer');
  };

  const handleCopyPhone = async (e, phone) => {
    e.stopPropagation();
    if (!phone) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhone(phone);
      addToast('Teléfono copiado', 'success');
      setTimeout(() => setCopiedPhone(null), 1600);
    } catch {
      addToast('No se pudo copiar el teléfono', 'error');
    }
  };

  const formatLastSeen = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="space-y-4 pb-10 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Users size={19} className="text-brand shrink-0" />
              <span>Directorio de Clientes</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 tabular-nums">
              {stats.total} {stats.total === 1 ? 'cliente' : 'clientes'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Toca cualquier cliente para ver su historial, editar el mensaje o escribirle por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={openConfigModal}
            className="btn-secondary flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer"
            title="Configurar mensajes de WhatsApp y reglas de clientes"
          >
            <Settings size={15} />
            <span>Configurar</span>
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={filteredCustomers.length === 0}
            className="btn-secondary flex-1 sm:flex-initial py-2.5 px-3.5 rounded-xl text-xs font-bold shrink-0 cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* KPIs compactos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500 truncate">Total clientes</p>
            <Users size={15} className="text-slate-400 shrink-0" />
          </div>
          <p className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-slate-950 tabular-nums">{stats.total}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500 truncate">Recurrentes</p>
            <Repeat size={15} className="text-emerald-600 shrink-0" />
          </div>
          <p className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-slate-950 tabular-nums">
            {stats.recurring} <span className="text-xs font-semibold text-emerald-700">({stats.retentionPct}%)</span>
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500 truncate">Ticket promedio</p>
            <DollarSign size={15} className="text-sky-600 shrink-0" />
          </div>
          <p className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-slate-950 tabular-nums truncate">{formatMoney(stats.avgTicket)}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500 truncate">Mejor cliente</p>
            <Award size={15} className="text-amber-600 shrink-0" />
          </div>
          <p className="mt-1.5 text-sm sm:text-base font-bold text-slate-950 truncate">
            {stats.topCustomer ? stats.topCustomer.name : '—'}
          </p>
          {stats.topCustomer && (
            <p className="text-[11px] text-slate-500 tabular-nums truncate">{formatMoney(stats.topCustomer.totalSpent)}</p>
          )}
        </div>
      </div>

      {/* Filtros rápidos + Buscador + Selector de vista */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: `Todos (${stats.total})` },
            { id: 'recurring', label: `Frecuentes (${stats.recurring})` },
            { id: 'inactive', label: `Sin pedir +${inactiveDays}d (${stats.inactive})` },
          ].map(seg => (
            <button
              key={seg.id}
              type="button"
              onClick={() => setSegment(seg.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                segment === seg.id
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {seg.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, teléfono o producto..."
              className="input-field pl-9 text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            <select
              aria-label="Ordenar clientes"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field py-2 text-xs font-semibold w-auto bg-white cursor-pointer"
            >
              <option value="orders">Ordenar: Más compras</option>
              <option value="spent">Ordenar: Mayor gasto</option>
              <option value="recent">Ordenar: Más recientes</option>
            </select>

            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-2xs">
              <button
                type="button"
                onClick={() => changeViewMode('grid')}
                aria-label="Vista en tarjetas"
                aria-pressed={viewMode === 'grid'}
                title="Vista en tarjetas"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-brand/10 text-brand font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                type="button"
                onClick={() => changeViewMode('list')}
                aria-label="Vista en lista"
                aria-pressed={viewMode === 'list'}
                title="Vista en lista"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-brand/10 text-brand font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estado vacío */}
      {filteredCustomers.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Users size={22} />
          </div>
          <p className="text-sm font-bold text-slate-800">
            {searchQuery || segment !== 'all' ? 'Sin clientes en este filtro' : 'Aún no tienes clientes registrados'}
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery || segment !== 'all'
              ? 'Prueba cambiando el filtro o buscando otro término.'
              : 'Cada vez que alguien realice un pedido en tu tienda, aparecerá aquí automáticamente.'}
          </p>
        </div>
      ) : viewMode === 'list' ? (
        /* ── VISTA LISTA (TABLA COMPACTA) ── */
        <div className="card overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-semibold">
                  <th className="py-3 px-4 whitespace-nowrap">Cliente</th>
                  <th className="py-3 px-4 whitespace-nowrap">Teléfono</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Pedidos</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Total comprado</th>
                  <th className="py-3 px-4 text-center whitespace-nowrap">Última compra</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map(c => (
                  <tr
                    key={c.key}
                    onClick={() => openCustomerModal(c)}
                    className="hover:bg-slate-50/90 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 uppercase">
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 truncate max-w-[180px]">{c.name}</span>
                            {c.orderCount >= recurringMin && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                                Frecuente
                              </span>
                            )}
                          </div>
                          {c.favoriteProduct && (
                            <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                              Fav: {c.favoriteProduct}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-600">
                      {c.phone || '—'}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-slate-900 tabular-nums">
                      {c.orderCount}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-slate-950 tabular-nums">
                      {formatMoney(c.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap text-slate-500 tabular-nums">
                      {formatLastSeen(c.lastOrderAt)}
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap" onClick={e => e.stopPropagation()}>
                      <div className="inline-flex items-center justify-end gap-1.5">
                        {c.phone && (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleCopyPhone(e, c.phone)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer"
                              title="Copiar teléfono"
                            >
                              {copiedPhone === c.phone ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => openWhatsAppDirect(c)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                              title="Escribir por WhatsApp"
                            >
                              <MessageCircle size={12} />
                              <span>Chat</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ── VISTA TARJETAS (LIMPIA Y DIRECTA) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filteredCustomers.map(c => (
            <div
              key={c.key}
              role="button"
              tabIndex={0}
              onClick={() => openCustomerModal(c)}
              onKeyDown={e => { if (e.key === 'Enter') openCustomerModal(c); }}
              className="rounded-2xl border border-slate-200 hover:border-slate-300 bg-white p-4 shadow-2xs transition-all flex flex-col justify-between gap-3 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2.5 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center shrink-0 uppercase">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-950 truncate">{c.name}</h4>
                      {c.orderCount >= recurringMin && (
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                          Frecuente
                        </span>
                      )}
                    </div>
                    {c.phone && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-slate-500 font-mono truncate">{c.phone}</span>
                        <button
                          type="button"
                          onClick={(e) => handleCopyPhone(e, c.phone)}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                          title="Copiar teléfono"
                        >
                          {copiedPhone === c.phone ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {c.phone && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openWhatsAppDirect(c); }}
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    title={`Escribir a ${c.name} por WhatsApp`}
                  >
                    <MessageCircle size={13} />
                    <span>Chat</span>
                  </button>
                )}
              </div>

              {(c.address || c.favoriteProduct) && (
                <div className="space-y-1 text-xs text-slate-600">
                  {c.favoriteProduct && (
                    <p className="flex items-center gap-1.5 truncate">
                      <ShoppingBag size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">Favorito: <strong className="text-slate-800 font-semibold">{c.favoriteProduct}</strong></span>
                    </p>
                  )}
                  {c.address && (
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </p>
                  )}
                </div>
              )}

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3.5">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Pedidos</span>
                    <span className="font-bold text-slate-900 tabular-nums">{c.orderCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                    <span className="font-bold text-slate-950 tabular-nums">{formatMoney(c.totalSpent)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock size={11} />
                  <span className="tabular-nums">{formatLastSeen(c.lastOrderAt)}</span>
                  <ChevronRight size={13} className="text-slate-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── DRAWER HISTORIAL RÁPIDO + MENSAJE EDITABLE DE WHATSAPP ── */}
      <SettingsDrawer
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Cliente'}
        subtitle={selectedCustomer?.phone || selectedCustomer?.address || 'Historial de compras'}
        icon={Users}
        widthClass="max-w-md"
      >
        {selectedCustomer && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Pedidos</span>
                <span className="text-base font-bold text-slate-950 tabular-nums">{selectedCustomer.orderCount}</span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Gastado</span>
                <span className="text-base font-bold text-slate-950 tabular-nums">{formatMoney(selectedCustomer.totalSpent)}</span>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3">
                <span className="text-[10px] font-semibold text-slate-500 uppercase block">Promedio</span>
                <span className="text-base font-bold text-slate-950 tabular-nums">{formatMoney(selectedCustomer.avgTicket)}</span>
              </div>
            </div>

            {selectedCustomer.phone && (
              <section className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Mensaje por WhatsApp
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSelectedCustomer(null); openConfigModal(); }}
                    className="text-[11px] font-semibold text-brand hover:underline cursor-pointer"
                  >
                    Editar plantillas
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'hello', label: 'Saludo' },
                    { id: 'reactivate', label: 'Reactivar' },
                    { id: 'vip', label: 'Frecuente' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setActiveTemplateKey(t.id);
                        setDraftMessage(buildCustomerMessage(selectedCustomer, t.id));
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        activeTemplateKey === t.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <textarea
                  value={draftMessage}
                  onChange={e => setDraftMessage(e.target.value)}
                  rows={3}
                  className="input-field bg-white text-xs leading-relaxed resize-none"
                  placeholder="Escribe o edita el mensaje antes de enviar..."
                />

                <button
                  type="button"
                  onClick={() => openWhatsAppDirect(selectedCustomer, draftMessage)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  <MessageCircle size={14} /> Abrir y enviar en WhatsApp
                </button>
              </section>
            )}

            <section className="space-y-2.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Historial de pedidos ({selectedCustomer.orderHistory.length})
              </p>
              <div className="space-y-2">
                {selectedCustomer.orderHistory.slice(0, 12).map(ord => (
                  <div key={ord.id} className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-800">
                        #{String(ord.id).slice(-4).toUpperCase()}
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                      <span className="font-bold text-slate-950 tabular-nums">{formatMoney(ord.total)}</span>
                    </div>
                    {ord.items.length > 0 && (
                      <p className="text-[11px] text-slate-500 line-clamp-2">
                        {ord.items.map(it => `${it.cantidad || it.quantity || 1}x ${it.nombre || it.name || 'Producto'}`).join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </SettingsDrawer>

      {/* ── DRAWER CONFIGURACIÓN DE CLIENTES (PLANTILLAS CON VISTA PREVIA + REGLAS) ── */}
      <SettingsDrawer
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        title="Ajustes de Clientes y WhatsApp"
        subtitle="Define tus mensajes predeterminados y las reglas de segmentación."
        icon={Settings}
        onSubmit={handleSaveConfig}
        widthClass="max-w-lg"
        footer={(
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setConfigDraft({ ...DEFAULT_CRM_CONFIG })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw size={13} /> Restaurar
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="btn-secondary py-2 px-3.5 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingConfig}
                className="btn-primary py-2 px-4 text-xs font-bold cursor-pointer"
              >
                {savingConfig ? <LoadingSpinner size={14} /> : <><Save size={14} /> Guardar cambios</>}
              </button>
            </div>
          </div>
        )}
      >
        {/* Grupo 1: Segmentación */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Reglas de segmentación
          </h4>
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-3.5">
            <div>
              <label htmlFor="crm-inactive-days" className="block text-xs font-bold text-slate-800 mb-1">
                Inactivo tras
              </label>
              <select
                id="crm-inactive-days"
                value={configDraft.inactiveDays}
                onChange={e => setConfigDraft(prev => ({ ...prev, inactiveDays: Number(e.target.value) }))}
                className="input-field bg-white text-xs cursor-pointer"
              >
                {[7, 15, 30, 45, 60].map(d => (
                  <option key={d} value={d}>{d} días sin pedir</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="crm-recurring-min" className="block text-xs font-bold text-slate-800 mb-1">
                Frecuente desde
              </label>
              <select
                id="crm-recurring-min"
                value={configDraft.recurringMinOrders}
                onChange={e => setConfigDraft(prev => ({ ...prev, recurringMinOrders: Number(e.target.value) }))}
                className="input-field bg-white text-xs cursor-pointer"
              >
                {[2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} o más pedidos</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Grupo 2: Plantillas con tabs + inserción rápida de variables + vista previa real */}
        <section className="space-y-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Plantillas de WhatsApp
          </h4>

          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-3">
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { key: 'helloTemplate', label: 'Saludo' },
                { key: 'reactivateTemplate', label: 'Reactivar' },
                { key: 'vipTemplate', label: 'Frecuente' },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setConfigTplTab(tab.key)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    configTplTab === tab.key
                      ? 'bg-white text-slate-950 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div>
              <textarea
                rows={4}
                value={configDraft[configTplTab] || ''}
                onChange={e => setConfigDraft(prev => ({ ...prev, [configTplTab]: e.target.value }))}
                className="input-field text-xs leading-relaxed resize-none"
                placeholder="Escribe tu mensaje personalizado..."
              />
              <div className="mt-2 flex items-center flex-wrap gap-1.5">
                <span className="text-[11px] text-slate-500 font-medium">Insertar:</span>
                {[
                  { token: '{nombre}', label: '+ Nombre cliente' },
                  { token: '{tienda}', label: '+ Tu negocio' },
                  { token: '{link}', label: '+ Enlace catálogo' },
                ].map(v => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => setConfigDraft(prev => ({
                      ...prev,
                      [configTplTab]: `${(prev[configTplTab] || '').trim()} ${v.token}`.trim(),
                    }))}
                    className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Vista previa real estilo burbuja de WhatsApp */}
            <div className="rounded-xl bg-[#EFEAE2] p-3 border border-slate-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Vista previa real
              </span>
              <div className="rounded-2xl rounded-tr-sm bg-[#D9FDD3] text-slate-900 px-3 py-2 text-xs leading-relaxed shadow-2xs break-words">
                {renderTemplate(configDraft[configTplTab], {
                  name: customers[0]?.name || 'Camila',
                  storeName,
                  storeLink: storeLink || 'https://negu.pro/tu-tienda',
                })}
              </div>
            </div>
          </div>
        </section>
      </SettingsDrawer>
    </div>
  );
}
