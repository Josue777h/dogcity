import { useState } from 'react';
import { Save, User, Phone, MapPin, Globe, Loader2 } from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';

export default function SettingsView({ business, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre_visible: business?.nombre_visible || '',
    telefono: business?.telefono || '',
    direccion: business?.direccion || '',
  });
  
  const addToast = useToastStore(s => s.addToast);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await getSupabase()
        .from('negocios')
        .update(formData)
        .eq('id', business.id);
        
      if (error) throw error;
      
      addToast('Configuración actualizada correctamente', 'success');
      onUpdate();
    } catch (err) {
      console.error(err);
      addToast('Error al guardar cambios', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-border rounded-[2.5rem] p-8 sm:p-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center">
            <Globe size={24} />
          </div>
          <div>
            <h4 className="text-xl font-black text-dark uppercase tracking-tight">Perfil del Negocio</h4>
            <p className="text-xs text-muted font-bold uppercase tracking-widest">Información pública de tu tienda</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                <User size={12} /> Nombre Comercial
              </label>
              <input 
                type="text" 
                value={formData.nombre_visible}
                onChange={e => setFormData({...formData, nombre_visible: e.target.value})}
                placeholder="Ej: Burger House"
                className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner transition-all" 
              />
            </div>
            
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
                <Phone size={12} /> WhatsApp de Pedidos
              </label>
              <input 
                type="tel" 
                value={formData.telefono}
                onChange={e => setFormData({...formData, telefono: e.target.value})}
                placeholder="573000000000"
                className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner transition-all" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-[0.2em] ml-1">
              <MapPin size={12} /> Dirección Física (Opcional)
            </label>
            <input 
              type="text" 
              value={formData.direccion}
              onChange={e => setFormData({...formData, direccion: e.target.value})}
              placeholder="Ej: Carrera 15 # 45-20, Bogotá"
              className="w-full p-4 bg-bg-alt border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand shadow-inner transition-all" 
            />
          </div>

          <div className="pt-6 border-t border-border">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto btn-primary !py-4 !px-10 shadow-xl shadow-brand/20 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <><Save size={20} /> GUARDAR CONFIGURACIÓN</>}
              </button>
              <p className="text-[10px] text-muted font-black uppercase tracking-widest text-center sm:text-left">
                Estos datos se mostrarán en el pie de página de tu tienda
              </p>
            </div>
          </div>
        </form>
      </div>

      {/* Advanced Settings Placeholder */}
      <div className="mt-8 bg-error/5 border border-error/10 rounded-[2.5rem] p-8">
        <h5 className="text-[10px] font-black text-error uppercase tracking-widest mb-2">Zona de Peligro</h5>
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-error/60">Eliminar cuenta de negocio permanentemente</p>
          <button className="px-4 py-2 border border-error/20 text-error text-[10px] font-black rounded-xl hover:bg-error/10 transition-colors">
            DESACTIVAR NEGOCIO
          </button>
        </div>
      </div>
    </div>
  );
}
