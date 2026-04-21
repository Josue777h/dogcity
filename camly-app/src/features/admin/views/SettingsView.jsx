import { useState } from 'react';
import { 
  Save, User, Phone, MapPin, Globe, Loader2, 
  Instagram, Facebook, MessageSquare, Palette,
  CheckCircle2, CreditCard
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
          { id: 'redes', label: 'Redes Sociales', icon: Instagram },
          { id: 'diseno', label: 'Diseño y Tema', icon: Palette },
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
                    <User size={12} /> Nombre Público
                  </label>
                  <input 
                    type="text" 
                    value={formData.nombre_visible}
                    onChange={e => setFormData({...formData, nombre_visible: e.target.value})}
                    placeholder="Ej: Burger House"
                    className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Phone size={12} /> WhatsApp (Pedidos)
                  </label>
                  <input 
                    type="tel" 
                    value={formData.telefono}
                    onChange={e => setFormData({...formData, telefono: e.target.value})}
                    placeholder="573000000000"
                    className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                  <MapPin size={12} /> Dirección de Local
                </label>
                <input 
                  type="text" 
                  value={formData.direccion}
                  onChange={e => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Ej: Calle 10 # 45-20"
                  className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                />
              </div>

              <div className="pt-6 border-t border-border mt-8">
                <h4 className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <CreditCard size={14} /> Información de Pago (Transferencia)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                      Número o Alias de Pago
                    </label>
                    <input 
                      type="text" 
                      value={formData.pago_alias}
                      onChange={e => setFormData({...formData, pago_alias: e.target.value})}
                      placeholder="Ej: Nequi 300 123 4567"
                      className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                      Banco o Plataforma
                    </label>
                    <input 
                      type="text" 
                      value={formData.pago_banco}
                      onChange={e => setFormData({...formData, pago_banco: e.target.value})}
                      placeholder="Ej: Bancolombia / Nequi"
                      className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'redes' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Instagram size={12} /> Instagram (Usuario)
                  </label>
                  <input 
                    type="text" 
                    value={formData.instagram}
                    onChange={e => setFormData({...formData, instagram: e.target.value})}
                    placeholder="@tu_negocio"
                    className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                    <Facebook size={12} /> Facebook (Slug)
                  </label>
                  <input 
                    type="text" 
                    value={formData.facebook}
                    onChange={e => setFormData({...formData, facebook: e.target.value})}
                    placeholder="perfil_fb"
                    className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                  <MessageSquare size={12} /> Mensaje al pie de página
                </label>
                <textarea 
                  value={formData.footer_message}
                  onChange={e => setFormData({...formData, footer_message: e.target.value})}
                  placeholder="¡Gracias por elegirnos! El mejor sabor de la ciudad."
                  className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-medium text-dark outline-none focus:border-brand shadow-inner min-h-[100px]" 
                />
              </div>
            </div>
          )}

          {activeTab === 'diseno' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">Color Principal (Premium)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {THEME_COLORS.map(color => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setFormData({...formData, theme_color: color.hex})}
                      className={`relative aspect-square rounded-2xl ${color.class} border-4 transition-all
                        ${formData.theme_color === color.hex ? 'border-brand scale-105 shadow-xl shadow-brand/20' : 'border-transparent hover:scale-105'}`}
                    >
                      {formData.theme_color === color.hex && (
                        <div className="absolute inset-0 flex items-center justify-center text-white">
                          <CheckCircle2 size={32} />
                        </div>
                      )}
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/80 uppercase">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-bg-alt border border-dashed border-border rounded-2xl flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center text-white">
                    <Palette size={24} />
                 </div>
                 <div>
                    <h5 className="text-xs font-black text-dark uppercase">Personalización SaaS</h5>
                    <p className="text-[10px] font-bold text-muted uppercase mt-0.5">El color se aplicará en toda la tienda de tus clientes.</p>
                 </div>
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
