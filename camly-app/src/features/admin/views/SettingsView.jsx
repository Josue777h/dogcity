import { useState, useEffect, useRef } from 'react';
import { 
  Save, User, Phone, MapPin, Globe, Loader2, 
  Instagram, Facebook, MessageSquare, Palette,
  CheckCircle2, CreditCard, Upload, Smartphone, Check, Settings,
  Music2, Wallet, Truck, Navigation, Search
} from 'lucide-react';
import { getSupabase, uploadImage } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';
import PremiumLock from '../../../components/ui/PremiumLock';
const THEME_COLORS = [
  { name: 'Azul', hex: '#2563EB', class: 'bg-[#2563EB]' },
  { name: 'Morado', hex: '#7C3AED', class: 'bg-[#7C3AED]' },
  { name: 'Esmeralda', hex: '#10B981', class: 'bg-[#10B981]' },
  { name: 'Rosa', hex: '#DB2777', class: 'bg-[#DB2777]' },
  { name: 'Naranja', hex: '#EA580C', class: 'bg-[#EA580C]' },
  { name: 'Oscuro', hex: '#1F2937', class: 'bg-[#1F2937]' },
];

export default function SettingsView({ business, onUpdate }) {
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
    theme_color: business?.theme_color || '#2563EB',
    logo_url: business?.logo_url || '',
    whatsapp_contacto: business?.whatsapp_contacto || business?.telefono || '',
    metodos_pago: Array.isArray(business?.metodos_pago) ? business?.metodos_pago : ['efectivo', 'transferencia'],
    pago_alias: business?.pago_alias || '',
    pago_banco: business?.pago_banco || '',
    tiktok: business?.tiktok || '',
    lat: business?.lat || '',
    lng: business?.lng || '',
    costo_por_km: business?.costo_por_km || 1000,
    domicilio_minimo: business?.domicilio_minimo || 3000,
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        nombre_visible: formData.nombre_visible || '',
        telefono: formData.telefono || '',
        direccion: formData.direccion || '',
        instagram: formData.instagram || '',
        facebook: formData.facebook || '',
        tiktok: formData.tiktok || '',
        footer_message: formData.footer_message || '',
        theme_color: formData.theme_color || '#2563EB',
        logo_url: formData.logo_url || '',
        whatsapp_contacto: formData.whatsapp_contacto || '',
        metodos_pago: Array.isArray(formData.metodos_pago) ? formData.metodos_pago : ['efectivo', 'transferencia'],
        pago_alias: formData.pago_alias || '',
        pago_banco: formData.pago_banco || '',
        lat: formData.lat || null,
        lng: formData.lng || null,
        costo_por_km: parseInt(formData.costo_por_km) || 1000,
        domicilio_minimo: parseInt(formData.domicilio_minimo) || 3000,
      };

      const { error } = await getSupabase()
        .from('negocios')
        .update(payload)
        .eq('id', business.id);
        
      if (error) {
        console.error('Supabase Error:', error);
        addToast(`Error: ${error.message} - ${error.hint || ''}`, 'error');
        throw error;
      }
      
      addToast('Configuración guardada correctamente', 'success');
      onUpdate();
    } catch (err) {
      console.error('Caught Error:', err);
      if (!err.message?.includes('Error:')) {
        addToast('Error al guardar cambios. Revisa la consola.', 'error');
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
      addToast('Logo cargado correctamente', 'success');
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
      // Priorizar Cúcuta, Colombia en las búsquedas
      const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query + ', Cucuta, Colombia')}&limit=5`);
      const data = await response.json();
      setBizSuggestions(data.features || []);
    } catch (err) {
      console.error("Biz search error:", err);
    } finally {
      setIsSearchingBiz(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logistica' && typeof L !== 'undefined') {
      // Pequeño delay para que el contenedor esté listo en el DOM
      const timer = setTimeout(() => {
        if (!mapInstance.current) {
          const lat = parseFloat(formData.lat) || 7.89391;
          const lng = parseFloat(formData.lng) || -72.50782;

          mapInstance.current = L.map('map-picker', { zoomControl: false }).setView([lat, lng], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(mapInstance.current);

          L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstance.current);

          markerRef.current.on('dragend', () => {
             const pos = markerRef.current.getLatLng();
             setFormData(prev => ({ ...prev, lat: pos.lat, lng: pos.lng }));
          });

          mapInstance.current.on('click', (e) => {
             markerRef.current.setLatLng(e.latlng);
             setFormData(prev => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
          });
        }
      }, 300);

      return () => {
        clearTimeout(timer);
        if (mapInstance.current) {
          mapInstance.current.remove();
          mapInstance.current = null;
        }
      };
    }
  }, [activeTab]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tabs Header */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'perfil', label: 'Perfil', icon: User },
          { id: 'marca', label: 'Marca y Logo', icon: Palette },
          { id: 'pagos', label: 'Pagos', icon: CreditCard },
          { id: 'logistica', label: 'Logística', icon: Truck },
          { id: 'redes', label: 'Redes', icon: Instagram },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeTab === tab.id 
                ? 'bg-brand text-white shadow-lg shadow-brand/30' 
                : 'bg-white border border-border text-muted hover:border-brand/40'}`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mb-8">
        {activeTab === 'logistica' && (
          <div className="bg-brand/5 border border-brand/20 p-4 rounded-2xl animate-in zoom-in-95 duration-300">
             <div className="flex items-start gap-4">
                <div className="p-3 bg-brand text-white rounded-xl shadow-lg">
                   <MapPin size={20} />
                </div>
                <div>
                   <h4 className="text-sm font-black text-dark uppercase tracking-tighter">Ubicación del Negocio</h4>
                   <p className="text-[10px] text-muted font-bold leading-relaxed mt-1 uppercase">
                     Esta ubicación se usará para calcular automáticamente el costo de envío para tus clientes.
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-border rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-dark/5">
          
          {activeTab === 'perfil' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <User size={12} /> Nombre del Negocio
                  </label>
                  <input 
                    type="text" 
                    value={formData.nombre_visible}
                    onChange={e => setFormData({...formData, nombre_visible: e.target.value})}
                    className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-dark outline-none focus:border-brand" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Smartphone size={12} /> WhatsApp Público
                  </label>
                  <input 
                    type="tel" 
                    value={formData.whatsapp_contacto}
                    onChange={e => setFormData({...formData, whatsapp_contacto: e.target.value})}
                    className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-dark outline-none focus:border-brand" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                  <MapPin size={12} /> Dirección Física
                </label>
                <input 
                  type="text" 
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-dark outline-none focus:border-brand" 
                />
              </div>
            </div>
          )}

          {activeTab === 'marca' && (
            <PremiumLock featureName="Identidad Visual Avanzada">
              <div className="space-y-10 animate-in fade-in duration-300">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Logo del Negocio</label>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <div className="w-24 h-24 bg-bg-alt border-2 border-dashed border-border rounded-3xl flex items-center justify-center overflow-hidden">
                        {isUploading ? (
                          <Loader2 className="animate-spin text-brand" />
                        ) : formData.logo_url ? (
                          <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                        ) : <Upload className="text-muted" />}
                      </div>
                      <label className="absolute -bottom-2 -right-2 bg-brand text-white p-2 rounded-xl shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                        <Upload size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                      </label>
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="relative">
                        <input 
                          type="text" 
                          value={formData.logo_url}
                          onChange={e => setFormData({...formData, logo_url: e.target.value})}
                          placeholder="URL de tu logo (.png, .jpg)"
                          className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-xs outline-none focus:border-brand" 
                        />
                        <Globe size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
                      </div>
                      <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Sube tu archivo o pega una URL directa</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Color de Marca</label>
                      <div className="flex items-center gap-2">
                         <input 
                          type="color" 
                          value={formData.theme_color}
                          onChange={e => setFormData({...formData, theme_color: e.target.value})}
                          className="w-8 h-8 rounded-lg cursor-pointer border-2 border-white shadow-sm"
                         />
                         <span className="text-[10px] font-mono font-bold text-dark uppercase">{formData.theme_color}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      {THEME_COLORS.map(c => (
                        <button 
                          key={c.hex} type="button" 
                          onClick={() => setFormData({...formData, theme_color: c.hex})}
                          className={`aspect-square rounded-xl ${c.class} border-4 ${formData.theme_color === c.hex ? 'border-brand' : 'border-transparent'} transition-all hover:scale-110`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </PremiumLock>
          )}

          {activeTab === 'logistica' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand z-10">
                    {isSearchingBiz ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  </div>
                  <input 
                    type="text" 
                    value={bizSearchQuery}
                    onChange={(e) => handleBizSearch(e.target.value)}
                    placeholder="Busca tu dirección o nombre del local..."
                    className="w-full pl-12 pr-4 py-5 bg-white border-2 border-brand/20 rounded-[2rem] font-bold text-dark outline-none focus:border-brand transition-all shadow-xl shadow-brand/5" 
                  />
                  
                  {bizSuggestions.length > 0 && (
                    <div className="absolute top-[110%] left-0 w-full bg-white border border-border rounded-3xl shadow-2xl z-[100] max-h-72 overflow-y-auto p-3 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {bizSuggestions.map(f => (
                        <button 
                          key={f.properties.osm_id + Math.random()}
                          type="button"
                          onClick={() => {
                            const [lng, lat] = f.geometry.coordinates;
                            setFormData({...formData, lat, lng});
                            setBizSearchQuery([f.properties.name, f.properties.city].filter(Boolean).join(', '));
                            setBizSuggestions([]);
                            
                            // Mover el mapa y el marcador
                            if (mapInstance.current) {
                              mapInstance.current.setView([lat, lng], 17);
                              markerRef.current.setLatLng([lat, lng]);
                            }
                            
                            addToast('Ubicación fijada en el mapa', 'success');
                          }}
                          className="w-full text-left p-4 rounded-2xl hover:bg-brand/5 text-[11px] font-bold text-dark border border-transparent hover:border-brand/20 transition-all flex items-start gap-4"
                        >
                          <div className="p-2 bg-brand/10 rounded-xl text-brand">
                             <MapPin size={16} />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-black text-dark truncate">{f.properties.name || 'Lugar encontrado'}</span>
                            <span className="text-muted text-[10px] uppercase tracking-tighter truncate">
                              {[f.properties.city, f.properties.state, f.properties.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Mapa Interactivo de Leaflet */}
              <div className="space-y-4">
                <div className="relative group overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl">
                  <div id="map-picker" className="w-full h-80 z-10 bg-bg-alt"></div>
                  
                  <div className="absolute top-4 left-4 z-20 bg-brand text-white px-4 py-2 rounded-2xl shadow-lg border-2 border-white text-[10px] font-black uppercase tracking-widest">
                     Mapa Interactivo
                  </div>
                </div>
                <p className="text-[10px] text-muted font-bold text-center uppercase tracking-widest leading-loose">
                  Puedes <span className="text-brand">arrastrar el marcador</span> o <span className="text-brand">hacer clic</span> en cualquier parte del mapa para fijar tu ubicación exacta.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border/50">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Wallet size={12} className="text-brand" /> Precio Mínimo Domicilio
                  </label>
                  <input 
                    type="number" 
                    value={formData.domicilio_minimo}
                    onChange={e => setFormData({...formData, domicilio_minimo: e.target.value})}
                    placeholder="Ej: 3000"
                    className="w-full p-4 bg-brand/5 border border-brand/20 rounded-xl font-black text-brand outline-none focus:bg-brand/10" 
                  />
                  <p className="text-[9px] text-muted font-bold uppercase tracking-widest ml-1">Lo mínimo que cobrarás siempre</p>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Navigation size={12} className="text-brand" /> Precio por Kilómetro
                  </label>
                  <input 
                    type="number" 
                    value={formData.costo_por_km}
                    onChange={e => setFormData({...formData, costo_por_km: e.target.value})}
                    placeholder="Ej: 1000"
                    className="w-full p-4 bg-brand/5 border border-border rounded-xl font-black text-brand outline-none focus:border-brand" 
                  />
                  <p className="text-[9px] text-muted font-bold uppercase tracking-widest ml-1">Ej: 5km = $5.000 extras</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pagos' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Métodos Activos</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'efectivo', label: 'Efectivo', icon: Wallet },
                    { id: 'transferencia', label: 'Transferencia', icon: CreditCard },
                  ].map(m => (
                    <button
                      key={m.id} type="button"
                      onClick={() => {
                        const currentMethods = Array.isArray(formData.metodos_pago) ? formData.metodos_pago : [];
                        const active = currentMethods.includes(m.id);
                        setFormData({
                          ...formData,
                          metodos_pago: active 
                            ? currentMethods.filter(x => x !== m.id)
                            : [...currentMethods, m.id]
                        });
                      }}
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all
                        ${(Array.isArray(formData.metodos_pago) && formData.metodos_pago.includes(m.id)) ? 'border-brand bg-brand/5' : 'border-border bg-white opacity-60'}`}
                    >
                      <div className="flex items-center gap-4">
                        <m.icon size={20} className={(Array.isArray(formData.metodos_pago) && formData.metodos_pago.includes(m.id)) ? 'text-brand' : 'text-muted'} />
                        <span className="font-black text-xs uppercase tracking-widest">{m.label}</span>
                      </div>
                      {(Array.isArray(formData.metodos_pago) && formData.metodos_pago.includes(m.id)) && <Check size={16} className="text-brand" />}
                    </button>
                  ))}
                </div>
              </div>

              {formData.metodos_pago.includes('transferencia') && (
                <div className="p-8 bg-bg-alt rounded-3xl border border-border space-y-6">
                  <h5 className="text-[10px] font-black text-brand uppercase tracking-[0.2em] flex items-center gap-2">
                    <CreditCard size={14} /> Configuración de Transferencia
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Banco / Plataforma</label>
                      <input type="text" value={formData.pago_banco} onChange={e => setFormData({...formData, pago_banco: e.target.value})} className="w-full p-4 bg-white border border-border rounded-xl font-bold text-xs" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted uppercase tracking-widest ml-1">Cuenta / Alias</label>
                      <input type="text" value={formData.pago_alias} onChange={e => setFormData({...formData, pago_alias: e.target.value})} className="w-full p-4 bg-white border border-border rounded-xl font-bold text-xs" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'redes' && (
            <div className="space-y-8 animate-in fade-in duration-300">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Instagram size={12} /> Instagram
                  </label>
                  <input type="text" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-dark" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Facebook size={12} /> Facebook
                  </label>
                  <input type="text" value={formData.facebook} onChange={e => setFormData({...formData, facebook: e.target.value})} className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-dark" />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Music2 size={12} /> TikTok
                  </label>
                  <input type="text" value={formData.tiktok} onChange={e => setFormData({...formData, tiktok: e.target.value})} className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-dark" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                  <MessageSquare size={12} /> Mensaje del Footer
                </label>
                <textarea value={formData.footer_message} onChange={e => setFormData({...formData, footer_message: e.target.value})} className="w-full p-4 bg-bg-alt border border-border rounded-xl font-medium text-dark min-h-[100px]" />
              </div>
            </div>
          )}

          <div className="pt-10 border-t border-border mt-10">
            <button 
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto btn-primary !py-5 !px-12 shadow-2xl shadow-brand/30 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : <><Save size={24} /> GUARDAR CONFIGURACIÓN</>}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
