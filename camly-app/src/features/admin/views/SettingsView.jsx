import { useState } from 'react';
import { 
  CheckCircle2, CreditCard, Upload, Smartphone, Check, Settings
} from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';

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
  const [formData, setFormData] = useState({
    nombre_visible: business?.nombre_visible || '',
    telefono: business?.telefono || '',
    direccion: business?.direccion || '',
    instagram: business?.instagram || '',
    facebook: business?.facebook || '',
    footer_message: business?.footer_message || '',
    theme_color: business?.theme_color || '#2563EB',
    color_secundario: business?.color_secundario || '#F9FAFB',
    logo_url: business?.logo_url || '',
    whatsapp_contacto: business?.whatsapp_contacto || business?.telefono || '',
    metodos_pago: business?.metodos_pago || ['efectivo', 'transferencia'],
    pago_alias: business?.pago_alias || '',
    pago_banco: business?.pago_banco || '',
  });
  
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await getSupabase()
        .from('negocios')
        .update({
          nombre_visible: formData.nombre_visible,
          telefono: formData.telefono,
          direccion: formData.direccion,
          instagram: formData.instagram,
          facebook: formData.facebook,
          footer_message: formData.footer_message,
          theme_color: formData.theme_color,
          color_secundario: formData.color_secundario,
          logo_url: formData.logo_url,
          whatsapp_contacto: formData.whatsapp_contacto,
          metodos_pago: formData.metodos_pago,
          pago_alias: formData.pago_alias,
          pago_banco: formData.pago_banco
        })
        .eq('id', business.id);
        
      if (error) throw error;
      
      addToast('Configuración guardada correctamente', 'success');
      onUpdate();
    } catch (err) {
      console.error(err);
      addToast('Error al guardar cambios. Verifica el SQL.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tabs Header */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'perfil', label: 'Perfil', icon: User },
          { id: 'marca', label: 'Marca y Logo', icon: Palette },
          { id: 'pagos', label: 'Pagos', icon: CreditCard },
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
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Logo del Negocio</label>
                <div className="flex items-center gap-6">
                  <div className="relative group">
                    <div className="w-24 h-24 bg-bg-alt border-2 border-dashed border-border rounded-3xl flex items-center justify-center overflow-hidden">
                      {formData.logo_url ? (
                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-cover" />
                      ) : <Upload className="text-muted" />}
                    </div>
                    <button type="button" className="absolute -bottom-2 -right-2 bg-brand text-white p-2 rounded-xl shadow-lg border-2 border-white">
                      <Upload size={14} />
                    </button>
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={formData.logo_url}
                      onChange={e => setFormData({...formData, logo_url: e.target.value})}
                      placeholder="URL de tu logo (.png, .jpg)"
                      className="w-full p-4 bg-bg-alt border border-border rounded-xl font-bold text-xs outline-none focus:border-brand" 
                    />
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest">Se recomienda fondo transparente</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Color de Marca</label>
                  <div className="grid grid-cols-5 gap-3">
                    {THEME_COLORS.map(c => (
                      <button 
                        key={c.hex} type="button" 
                        onClick={() => setFormData({...formData, theme_color: c.hex})}
                        className={`aspect-square rounded-xl ${c.class} border-4 ${formData.theme_color === c.hex ? 'border-brand' : 'border-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Color Secundario</label>
                  <input 
                    type="color" 
                    value={formData.color_secundario}
                    onChange={e => setFormData({...formData, color_secundario: e.target.value})}
                    className="w-full h-12 rounded-xl cursor-pointer border-none bg-transparent"
                  />
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
                        const active = formData.metodos_pago.includes(m.id);
                        setFormData({
                          ...formData,
                          metodos_pago: active 
                            ? formData.metodos_pago.filter(x => x !== m.id)
                            : [...formData.metodos_pago, m.id]
                        });
                      }}
                      className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all
                        ${formData.metodos_pago.includes(m.id) ? 'border-brand bg-brand/5' : 'border-border bg-white opacity-60'}`}
                    >
                      <div className="flex items-center gap-4">
                        <m.icon size={20} className={formData.metodos_pago.includes(m.id) ? 'text-brand' : 'text-muted'} />
                        <span className="font-black text-xs uppercase tracking-widest">{m.label}</span>
                      </div>
                      {formData.metodos_pago.includes(m.id) && <Check size={16} className="text-brand" />}
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
