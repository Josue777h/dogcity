import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Save, User, Phone, MapPin, Globe, Loader2, 
  Instagram, Facebook, MessageSquare, Palette,
  CheckCircle2, CreditCard, Upload, Smartphone, Check, Settings,
  Music2, Wallet, Truck, Navigation, Search, Clock
} from 'lucide-react';
import { getSupabase, uploadImage } from '../../../lib/supabase';
import { useToastStore, useAuthStore } from '../../../stores';
import PremiumLock from '../../../components/ui/PremiumLock';

const THEME_COLORS = [
  { name: 'Naranja', hex: '#EA580C', class: 'bg-[#EA580C]' },
  { name: 'Azul', hex: '#2563EB', class: 'bg-[#2563EB]' },
  { name: 'Morado', hex: '#7C3AED', class: 'bg-[#7C3AED]' },
  { name: 'Esmeralda', hex: '#10B981', class: 'bg-[#10B981]' },
  { name: 'Rosa', hex: '#DB2777', class: 'bg-[#DB2777]' },
  { name: 'Oscuro', hex: '#1F2937', class: 'bg-[#1F2937]' },
];

export default function SettingsView(props) {
  const outletCtx = useOutletContext() || {};
  const session = useAuthStore(s => s.session);
  const business = props.business ?? outletCtx.business ?? null;
  const onUpdate = props.onUpdate ?? (() => {
    if (session?.user?.id && outletCtx.loadData) {
      outletCtx.loadData(session.user.id, false);
    }
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('perfil');
  const [bizSuggestions, setBizSuggestions] = useState([]);
  const [isSearchingBiz, setIsSearchingBiz] = useState(false);
  const [bizSearchQuery, setBizSearchQuery] = useState('');
  
  const mapContainerRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [formData, setFormData] = useState({
    nombre_visible: business?.nombre_visible || '',
    telefono: business?.telefono || '',
    direccion: business?.direccion || '',
    instagram: business?.instagram || '',
    facebook: business?.facebook || '',
    footer_message: business?.footer_message || '',
    theme_color: business?.theme_color || '#EA580C',
    logo_url: business?.logo_url || '',
    whatsapp_contacto: business?.whatsapp_contacto || business?.telefono || '',
    metodos_pago: Array.isArray(business?.metodos_pago) ? business?.metodos_pago : ['efectivo', 'transferencia'],
    pago_alias: business?.pago_alias || '',
    pago_banco: business?.pago_banco || '',
    tiktok: business?.tiktok || '',
    lat: business?.lat || '',
    lng: business?.lng || '',
    tipo_domicilio: business?.tipo_domicilio || 'automatico',
    precio_domicilio: business?.precio_domicilio || 0,
    costo_por_km: business?.costo_por_km || 1000,
    domicilio_minimo: business?.domicilio_minimo || 3000,
  });

  const [scheduleData, setScheduleData] = useState(() => {
    const base = {
      abierto_manual: true,
      dias: {
        lunes: { activo: true, abre: '11:00', cierra: '23:00' },
        martes: { activo: true, abre: '11:00', cierra: '23:00' },
        miercoles: { activo: true, abre: '11:00', cierra: '23:00' },
        jueves: { activo: true, abre: '11:00', cierra: '23:00' },
        viernes: { activo: true, abre: '11:00', cierra: '23:59' },
        sabado: { activo: true, abre: '11:00', cierra: '23:59' },
        domingo: { activo: true, abre: '12:00', cierra: '22:00' }
      }
    };
    if (business?.horario && typeof business.horario === 'object') {
      return { ...base, ...business.horario, dias: { ...base.dias, ...(business.horario.dias || {}) } };
    }
    if (typeof business?.footer_message === 'string' && business.footer_message.includes('CAMLY_SCHEDULE:')) {
      try {
        const match = business.footer_message.match(/<!--CAMLY_SCHEDULE:(.*?)-->/);
        if (match && match[1]) {
          const parsed = JSON.parse(match[1]);
          return { ...base, ...parsed, dias: { ...base.dias, ...(parsed.dias || {}) } };
        }
      } catch (err) {
        console.warn('Error parsing schedule:', err);
      }
    }
    return base;
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handleUseCurrentGps = () => {
    if (!navigator.geolocation) {
      addToast('GPS no soportado en este navegador', 'error');
      return;
    }
    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setFormData(prev => ({ ...prev, lat, lng }));
        if (mapInstance.current && markerRef.current) {
          mapInstance.current.setView([lat, lng], 17);
          markerRef.current.setLatLng([lat, lng]);
        }
        addToast('Ubicación fijada con éxito por GPS', 'success');
        setIsLocatingGps(false);
      },
      (err) => {
        console.warn('GPS error:', err);
        addToast('No se pudo acceder al GPS. Asegúrate de dar permisos.', 'warning');
        setIsLocatingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const [isUpdatingPause, setIsUpdatingPause] = useState(false);

  const handleToggleStorePause = async () => {
    if (isUpdatingPause || !business?.id) return;
    const nextManualState = scheduleData.abierto_manual === false ? true : false;
    const updatedSchedule = { ...scheduleData, abierto_manual: nextManualState };
    
    setIsUpdatingPause(true);
    setScheduleData(updatedSchedule);

    try {
      const cleanFooter = (formData.footer_message || '').replace(/<!--CAMLY_SCHEDULE:[\s\S]*?-->/g, '').trim();
      const scheduleTag = `<!--CAMLY_SCHEDULE:${JSON.stringify(updatedSchedule)}-->`;
      const combinedFooter = cleanFooter ? `${cleanFooter}\n${scheduleTag}` : scheduleTag;

      const { error } = await getSupabase()
        .from('negocios')
        .update({ footer_message: combinedFooter })
        .eq('id', business.id);

      if (error) throw error;

      // Actualizar formData local
      setFormData(prev => ({ ...prev, footer_message: combinedFooter }));

      if (nextManualState) {
        addToast('¡Tienda reanudada! El catálogo ahora acepta pedidos.', 'success');
      } else {
        addToast('Tienda pausada. El catálogo ahora está en modo solo lectura.', 'warning');
      }

      // Sincronizar en tiempo real el store global
      if (typeof onUpdate === 'function') {
        onUpdate();
      }
    } catch (err) {
      console.error('Error toggling store pause:', err);
      // Revertir en caso de falla
      setScheduleData(prev => ({ ...prev, abierto_manual: !nextManualState }));
      addToast('Error al actualizar el estado de la tienda', 'error');
    } finally {
      setIsUpdatingPause(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanFooter = (formData.footer_message || '').replace(/<!--CAMLY_SCHEDULE:[\s\S]*?-->/g, '').trim();
      const scheduleTag = `<!--CAMLY_SCHEDULE:${JSON.stringify(scheduleData)}-->`;
      const combinedFooter = cleanFooter ? `${cleanFooter}\n${scheduleTag}` : scheduleTag;

      const payload = {
        nombre_visible: formData.nombre_visible || '',
        telefono: formData.telefono || '',
        direccion: formData.direccion || '',
        instagram: formData.instagram || '',
        facebook: formData.facebook || '',
        tiktok: formData.tiktok || '',
        footer_message: combinedFooter,
        theme_color: formData.theme_color || '#EA580C',
        logo_url: formData.logo_url || '',
        whatsapp_contacto: formData.whatsapp_contacto || '',
        metodos_pago: Array.isArray(formData.metodos_pago) ? formData.metodos_pago : ['efectivo', 'transferencia'],
        pago_alias: formData.pago_alias || '',
        pago_banco: formData.pago_banco || '',
        lat: formData.lat !== '' && !isNaN(Number(formData.lat)) ? Number(formData.lat) : null,
        lng: formData.lng !== '' && !isNaN(Number(formData.lng)) ? Number(formData.lng) : null,
        tipo_domicilio: formData.tipo_domicilio || 'automatico',
        precio_domicilio: Number(formData.precio_domicilio) || 0,
        costo_por_km: Number(formData.costo_por_km) || 0,
        domicilio_minimo: Number(formData.domicilio_minimo) || 0,
      };

      const { error } = await getSupabase()
        .from('negocios')
        .update(payload)
        .eq('id', business.id);
        
      if (error) {
        console.error('Supabase Error:', error);
        addToast(`Error: ${error.message}`, 'error');
        throw error;
      }
      
      addToast('Configuración guardada', 'success');
      onUpdate();
    } catch (err) {
      console.error('Caught Error:', err);
      if (!err.message?.includes('Error:')) {
        addToast('Error al guardar cambios', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('El logo no debe pesar más de 2MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      const path = `logos/${business.id}-${Date.now()}.${file.name.split('.').pop()}`;
      const url = await uploadImage(file, path);
      setFormData({ ...formData, logo_url: url });
      addToast('Logo actualizado', 'success');
    } catch (err) {
      console.error(err);
      addToast('Error al subir el logo', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleBizSearch = async (query) => {
    setBizSearchQuery(query);
    if (!query || query.length < 3) {
      setBizSuggestions([]);
      return;
    }
    setIsSearchingBiz(true);
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query + ', Colombia')}&limit=5`);
      const data = await response.json();
      setBizSuggestions(data.features || []);
    } catch (err) {
      console.error("Biz search error:", err);
    } finally {
      setIsSearchingBiz(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'logistica') return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const [{ default: L }] = await Promise.all([
        import('leaflet'),
        import('leaflet/dist/leaflet.css'),
      ]);
      if (cancelled || mapInstance.current) return;

      const lat = parseFloat(formData.lat) || 7.89391;
      const lng = parseFloat(formData.lng) || -72.50782;

      const container = document.getElementById('map-picker');
      if (!container) return;

      mapInstance.current = L.map('map-picker', { zoomControl: false }).setView([lat, lng], 16);
      L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '&copy; Google Maps',
        maxZoom: 20
      }).addTo(mapInstance.current);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      const googlePinIcon = new L.divIcon({
        className: 'bg-transparent border-none',
        html: `<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:36px; height:46px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); cursor:pointer;">
                 <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                   <path d="M18 0C8.06 0 0 8.06 0 18C0 31.5 18 46 18 46C18 46 36 31.5 36 18C36 8.06 27.94 0 18 0Z" fill="#EA4335"/>
                   <circle cx="18" cy="18" r="8" fill="#FFFFFF"/>
                   <circle cx="18" cy="18" r="4" fill="#B31412"/>
                 </svg>
               </div>`,
        iconSize: [36, 46],
        iconAnchor: [18, 46]
      });

      markerRef.current = L.marker([lat, lng], { draggable: true, icon: googlePinIcon }).addTo(mapInstance.current);

      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
      });

      mapInstance.current.on('click', (e) => {
        markerRef.current.setLatLng(e.latlng);
        setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
      });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeTab]);

  return (
    <div className="space-y-3 animate-fade-in-up">
      {/* Tabs Header */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {[
          { id: 'perfil', label: 'General', icon: User },
          { id: 'marca', label: 'Marca y Logo', icon: Palette },
          { id: 'horario', label: 'Horarios y Estado', icon: Clock },
          { id: 'pagos', label: 'Formas de Pago', icon: CreditCard },
          { id: 'logistica', label: 'Domicilios y GPS', icon: Truck },
          { id: 'redes', label: 'Redes Sociales', icon: Instagram },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 shadow-2xs
              ${activeTab === tab.id 
                ? 'bg-gray-900 text-white shadow-xs' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="card p-3.5 sm:p-4 lg:p-5 bg-white border-gray-200/80 shadow-xs rounded-xl">
          
          {/* ── PERFIL ── */}
          {activeTab === 'perfil' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Nombre comercial visible
                </label>
                <input 
                  type="text" 
                  value={formData.nombre_visible}
                  onChange={e => setFormData({...formData, nombre_visible: e.target.value})}
                  className="input-field" 
                  placeholder="Ej: Dog City Burger"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp para recibir pedidos
                </label>
                <input 
                  type="tel" 
                  value={formData.whatsapp_contacto}
                  onChange={e => setFormData({...formData, whatsapp_contacto: e.target.value})}
                  placeholder="573123456789"
                  className="input-field font-mono" 
                />
                <p className="text-xs text-gray-500 mt-1">
                  A este número se enviarán automáticamente los pedidos de tus clientes con su detalle y GPS.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dirección física o punto de despacho
                </label>
                <input 
                  type="text" 
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Ej: Calle 10 # 4-50, Centro"
                  className="input-field" 
                />
              </div>
            </div>
          )}

          {/* ── MARCA ── */}
          {activeTab === 'marca' && (
            <PremiumLock featureName="Identidad Visual Avanzada">
              <div className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Logo de tu tienda</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 border border-border rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {isUploading ? (
                        <Loader2 className="animate-spin text-orange-600" size={20} />
                      ) : formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : <Upload className="text-gray-400" size={20} />}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex gap-2">
                        <label className="btn-secondary text-xs py-2 px-3 cursor-pointer">
                          <Upload size={14} /> Subir imagen
                          <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                        </label>
                      </div>
                      <input 
                        type="text" 
                        value={formData.logo_url}
                        onChange={e => setFormData({...formData, logo_url: e.target.value})}
                        placeholder="O pega el URL de tu imagen..."
                        className="input-field text-xs py-1.5" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Color principal de tu tienda</label>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {THEME_COLORS.map(c => (
                      <button 
                        key={c.hex} 
                        type="button" 
                        onClick={() => setFormData({...formData, theme_color: c.hex})}
                        className={`w-8 h-8 rounded-lg ${c.class} border-2 ${formData.theme_color === c.hex ? 'border-gray-900 ring-2 ring-gray-900/20' : 'border-transparent'} transition-transform active:scale-95`}
                        title={c.name}
                      />
                    ))}
                    <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
                      <input 
                        type="color" 
                        value={formData.theme_color}
                        onChange={e => setFormData({...formData, theme_color: e.target.value})}
                        className="w-7 h-7 rounded border border-gray-300 cursor-pointer"
                      />
                      <span className="font-mono text-xs text-gray-700">{formData.theme_color}</span>
                    </div>
                  </div>
                </div>
              </div>
            </PremiumLock>
          )}

          {/* ── LOGÍSTICA & GPS ── */}
          {activeTab === 'logistica' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Ubicación del local en el mapa</h4>
                    <p className="text-xs text-gray-500">Se usará como punto de origen para calcular automáticamente la tarifa de entrega.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentGps}
                    disabled={isLocatingGps}
                    className="btn-secondary py-1.5 px-3 text-xs gap-1.5 shrink-0"
                  >
                    {isLocatingGps ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                    Fijar con mi GPS actual
                  </button>
                </div>

                <div className="relative">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={bizSearchQuery}
                    onChange={(e) => handleBizSearch(e.target.value)}
                    placeholder="Buscar dirección o punto de referencia para centrar el mapa..."
                    className="input-field pl-9 text-xs" 
                  />
                  {bizSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-[100] max-h-48 overflow-y-auto p-1 divide-y divide-gray-100">
                      {bizSuggestions.map(f => (
                        <button 
                          key={f.properties.osm_id + Math.random()}
                          type="button"
                          onClick={() => {
                            const [lng, lat] = f.geometry.coordinates;
                            setFormData({...formData, lat, lng});
                            setBizSearchQuery([f.properties.name, f.properties.city].filter(Boolean).join(', '));
                            setBizSuggestions([]);
                            if (mapInstance.current) {
                              mapInstance.current.setView([lat, lng], 17);
                              markerRef.current.setLatLng([lat, lng]);
                            }
                            addToast('Ubicación fijada en el mapa', 'success');
                          }}
                          className="w-full text-left p-2.5 hover:bg-gray-50 text-xs text-gray-800 transition-colors"
                        >
                          <p className="font-semibold truncate">{f.properties.name || 'Lugar encontrado'}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {[f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', ')}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-lg border border-border">
                  <div id="map-picker" className="w-full h-72 bg-[#e5e3df]"></div>
                </div>
                <p className="text-xs text-gray-500">
                  Arrastra el pin rojo o haz clic en el mapa para ajustar la posición exacta.
                </p>
              </div>

              {/* Modalidad de Domicilio */}
              <div className="pt-5 border-t border-border space-y-4">
                <h4 className="text-xs font-semibold text-gray-800">Modo de cobro del domicilio</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'automatico', label: 'Automático por GPS', desc: 'Calcula distancia en km y suma costo por km.' },
                    { id: 'fijo', label: 'Tarifa fija', desc: 'Mismo precio para todos los pedidos de la ciudad.' },
                    { id: 'manual', label: 'Por confirmar en WhatsApp', desc: 'Cotizas el domicilio con el cliente en el chat.' },
                  ].map(m => (
                    <button 
                      key={m.id}
                      type="button"
                      onClick={() => setFormData({...formData, tipo_domicilio: m.id})}
                      className={`p-3.5 rounded-lg border text-left transition-colors ${formData.tipo_domicilio === m.id ? 'border-orange-500 bg-orange-50/50' : 'border-border bg-white hover:bg-gray-50'}`}
                    >
                      <span className="block text-xs font-semibold text-gray-900">{m.label}</span>
                      <span className="block text-xs text-gray-500 mt-1 leading-snug">{m.desc}</span>
                    </button>
                  ))}
                </div>

                {formData.tipo_domicilio === 'fijo' && (
                  <div className="card p-4 bg-gray-50/50 max-w-sm">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Tarifa fija de entrega ($)
                    </label>
                    <input 
                      type="number" 
                      value={formData.precio_domicilio}
                      onChange={e => setFormData({...formData, precio_domicilio: e.target.value})}
                      placeholder="Ej: 5000"
                      className="input-field text-sm font-semibold" 
                    />
                  </div>
                )}

                {formData.tipo_domicilio === 'automatico' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tarifa mínima de entrega ($)
                      </label>
                      <input 
                        type="number" 
                        value={formData.domicilio_minimo}
                        onChange={e => setFormData({...formData, domicilio_minimo: e.target.value})}
                        placeholder="Ej: 3000"
                        className="input-field text-sm font-semibold" 
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Cobro base sin importar qué tan cerca esté.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Costo por kilómetro extra ($)
                      </label>
                      <input 
                        type="number" 
                        value={formData.costo_por_km}
                        onChange={e => setFormData({...formData, costo_por_km: e.target.value})}
                        placeholder="Ej: 1200"
                        className="input-field text-sm font-semibold" 
                      />
                      <p className="text-[10px] text-gray-500 mt-1">Multiplica la distancia GPS del cliente.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PAGOS ── */}
          {activeTab === 'pagos' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Métodos habilitados para el cliente</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'efectivo', label: 'Efectivo contra entrega', icon: Wallet },
                    { id: 'transferencia', label: 'Transferencia bancaria / Nequi', icon: CreditCard },
                  ].map(m => {
                    const current = Array.isArray(formData.metodos_pago) ? formData.metodos_pago : [];
                    const active = current.includes(m.id);
                    return (
                      <button
                        key={m.id} 
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            metodos_pago: active 
                              ? current.filter(x => x !== m.id)
                              : [...current, m.id]
                          });
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-lg border text-left transition-colors
                          ${active ? 'border-orange-500 bg-orange-50/50' : 'border-border bg-white text-gray-400'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <m.icon size={16} className={active ? 'text-orange-600' : 'text-gray-400'} />
                          <span className={`text-xs font-medium ${active ? 'text-gray-900' : 'text-gray-400'}`}>{m.label}</span>
                        </div>
                        {active && <Check size={16} className="text-orange-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formData.metodos_pago.includes('transferencia') && (
                <div className="card p-4 bg-gray-50/50 space-y-3">
                  <h5 className="text-xs font-semibold text-gray-800">Datos para transferencia</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Banco o Billetera</label>
                      <input 
                        type="text" 
                        value={formData.pago_banco} 
                        onChange={e => setFormData({...formData, pago_banco: e.target.value})} 
                        placeholder="Ej: Nequi / Bancolombia"
                        className="input-field text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Número de cuenta o alias</label>
                      <input 
                        type="text" 
                        value={formData.pago_alias} 
                        onChange={e => setFormData({...formData, pago_alias: e.target.value})} 
                        placeholder="Ej: 300 123 4567"
                        className="input-field text-xs font-mono" 
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">
                    El cliente podrá copiar este número con un solo clic y transferirte antes de confirmar por WhatsApp.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── HORARIOS Y ESTADO DE LA TIENDA ── */}
          {activeTab === 'horario' && (
            <div className="space-y-4 max-w-2xl animate-fade-in">
              {/* Switch Maestro: Abierto / Cerrado */}
              <div className="p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${scheduleData.abierto_manual !== false ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <h3 className="text-sm font-bold text-gray-900">
                      {scheduleData.abierto_manual !== false ? 'Tu tienda está ABIERTA' : 'Tu tienda está en PAUSA (Cerrada temporalmente)'}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {scheduleData.abierto_manual !== false 
                      ? 'Tus clientes pueden consultar el menú y realizar pedidos por WhatsApp con normalidad.'
                      : 'El catálogo mostrará un aviso de tienda cerrada y no permitirá finalizar pedidos temporalmente.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleStorePause}
                  disabled={isUpdatingPause}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
                    scheduleData.abierto_manual !== false
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isUpdatingPause ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Actualizando...</span>
                    </>
                  ) : scheduleData.abierto_manual !== false ? (
                    'Pausar tienda ahora'
                  ) : (
                    'Reanudar y abrir tienda'
                  )}
                </button>
              </div>

              {/* Horario Semanal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Horario semanal de atención</h4>
                    <p className="text-xs text-gray-500">Configura tus horas de apertura y cierre para cada día.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const lun = scheduleData.dias?.lunes || { activo: true, abre: '11:00', cierra: '23:00' };
                      setScheduleData(prev => {
                        const newDias = { ...prev.dias };
                        ['martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].forEach(d => {
                          newDias[d] = { ...lun };
                        });
                        return { ...prev, dias: newDias };
                      });
                      addToast('Horario del Lunes replicado a toda la semana', 'success');
                    }}
                    className="text-xs text-orange-600 font-semibold hover:underline cursor-pointer"
                  >
                    Replicar Lunes a toda la semana
                  </button>
                </div>

                <div className="space-y-2 border border-gray-200 rounded-xl divide-y divide-gray-100 bg-white overflow-hidden">
                  {[
                    { id: 'lunes', label: 'Lunes' },
                    { id: 'martes', label: 'Martes' },
                    { id: 'miercoles', label: 'Miércoles' },
                    { id: 'jueves', label: 'Jueves' },
                    { id: 'viernes', label: 'Viernes' },
                    { id: 'sabado', label: 'Sábado' },
                    { id: 'domingo', label: 'Domingo' },
                  ].map(day => {
                    const config = scheduleData.dias?.[day.id] || { activo: true, abre: '11:00', cierra: '23:00' };
                    return (
                      <div key={day.id} className="p-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 w-36">
                          <input
                            type="checkbox"
                            id={`day-${day.id}`}
                            checked={config.activo}
                            onChange={(e) => {
                              const val = e.target.checked;
                              setScheduleData(prev => ({
                                ...prev,
                                dias: {
                                  ...prev.dias,
                                  [day.id]: { ...(prev.dias?.[day.id] || {}), activo: val }
                                }
                              }));
                            }}
                            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                          />
                          <label htmlFor={`day-${day.id}`} className={`text-xs font-semibold select-none cursor-pointer ${config.activo ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                            {day.label}
                          </label>
                        </div>

                        {config.activo ? (
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">De:</span>
                            <input
                              type="time"
                              value={config.abre || '11:00'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setScheduleData(prev => ({
                                  ...prev,
                                  dias: {
                                    ...prev.dias,
                                    [day.id]: { ...(prev.dias?.[day.id] || {}), abre: val }
                                  }
                                }));
                              }}
                              className="input-field py-1 px-2 text-xs w-28 text-center font-mono"
                            />
                            <span className="text-gray-500">A:</span>
                            <input
                              type="time"
                              value={config.cierra || '23:00'}
                              onChange={(e) => {
                                const val = e.target.value;
                                setScheduleData(prev => ({
                                  ...prev,
                                  dias: {
                                    ...prev.dias,
                                    [day.id]: { ...(prev.dias?.[day.id] || {}), cierra: val }
                                  }
                                }));
                              }}
                              className="input-field py-1 px-2 text-xs w-28 text-center font-mono"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Cerrado todo el día</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── REDES SOCIALES ── */}
          {activeTab === 'redes' && (
            <div className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Instagram</label>
                <div className="relative">
                  <Instagram size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.instagram} 
                    onChange={e => setFormData({...formData, instagram: e.target.value})} 
                    placeholder="@tunegocio"
                    className="input-field pl-9 text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Facebook</label>
                <div className="relative">
                  <Facebook size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.facebook} 
                    onChange={e => setFormData({...formData, facebook: e.target.value})} 
                    placeholder="facebook.com/tunegocio"
                    className="input-field pl-9 text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">TikTok</label>
                <div className="relative">
                  <Music2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={formData.tiktok} 
                    onChange={e => setFormData({...formData, tiktok: e.target.value})} 
                    placeholder="@tunegocio"
                    className="input-field pl-9 text-xs" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mensaje en el pie de página de la tienda</label>
                <textarea 
                  value={(formData.footer_message || '').replace(/<!--CAMLY_SCHEDULE:[\s\S]*?-->/g, '').trim()} 
                  onChange={e => setFormData({...formData, footer_message: e.target.value})} 
                  placeholder="Ej: Las mejores hamburguesas artesanales de la ciudad."
                  className="input-field text-xs resize-none" 
                  rows={2}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-border mt-4">
            <button 
              type="submit"
              disabled={loading}
              className="btn-primary w-full sm:w-auto py-2.5 px-6 text-sm font-semibold justify-center"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Guardar cambios</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
