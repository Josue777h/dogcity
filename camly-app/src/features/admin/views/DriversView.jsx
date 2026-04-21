import { useState, useEffect } from 'react';
import { 
  UserPlus, Phone, Trash2, Loader2, Save, 
  Bike, CheckCircle2, XCircle 
} from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';

export default function DriversView({ businessId }) {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDriver, setNewDriver] = useState({ nombre: '', telefono: '', activo: true });
  const addToast = useToastStore(s => s.addToast);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await getSupabase()
        .from('domiciliarios')
        .select('*')
        .eq('negocio_id', businessId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDrivers(data || []);
    } catch (err) {
      console.error(err);
      addToast('Error al cargar domiciliarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) fetchDrivers();
  }, [businessId]);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriver.nombre || !newDriver.telefono) return;
    
    setLoading(true);
    try {
      const { error } = await getSupabase()
        .from('domiciliarios')
        .insert([{ ...newDriver, negocio_id: businessId }]);
      
      if (error) throw error;
      
      addToast('Domiciliario registrado', 'success');
      setNewDriver({ nombre: '', telefono: '', activo: true });
      setIsAdding(false);
      fetchDrivers();
    } catch (err) {
      console.error(err);
      addToast('Error al registrar. Verifica el SQL.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await getSupabase()
        .from('domiciliarios')
        .update({ activo: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDriver = async (id) => {
    if (!confirm('¿Eliminar a este domiciliario?')) return;
    try {
      const { error } = await getSupabase()
        .from('domiciliarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchDrivers();
      addToast('Eliminado correctamente', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && !drivers.length) {
    return (
      <div className="py-20 flex justify-center">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-border">
        <div>
           <h4 className="text-xl font-black text-dark uppercase tracking-tight">Gestión de Repartidores</h4>
           <p className="text-[10px] text-muted font-bold uppercase tracking-widest mt-1">Controla tu equipo de entregas</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary !py-3 !px-6 shadow-lg shadow-brand/20"
        >
          {isAdding ? <XCircle size={18} /> : <><UserPlus size={18} /> NUEVO REPARTIDOR</>}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddDriver} className="bg-brand/5 border border-brand/20 p-8 rounded-[2.5rem] animate-in zoom-in-95 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">Nombre Completo</label>
              <input 
                type="text" 
                value={newDriver.nombre}
                onChange={e => setNewDriver({...newDriver, nombre: e.target.value})}
                placeholder="Ej: Juan Pérez"
                className="w-full p-4 bg-white border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand" 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted uppercase tracking-widest ml-1">WhatsApp</label>
              <input 
                type="tel" 
                value={newDriver.telefono}
                onChange={e => setNewDriver({...newDriver, telefono: e.target.value})}
                placeholder="573000000000"
                className="w-full p-4 bg-white border border-border rounded-2xl font-bold text-dark outline-none focus:border-brand" 
                required
              />
            </div>
            <div className="flex items-end">
              <button type="submit" className="w-full btn-primary !py-4 shadow-xl shadow-brand/20">
                <Save size={18} /> GUARDAR AHORA
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map(driver => (
          <div key={driver.id} className="bg-white border border-border rounded-[2.5rem] p-6 hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl flex items-center justify-center transition-colors
                ${driver.activo ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
                <Bike size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deleteDriver(driver.id)}
                  className="p-2 text-error/40 hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <h5 className="text-lg font-black text-dark tracking-tight uppercase leading-none">{driver.nombre}</h5>
              <p className="text-xs font-bold text-muted flex items-center gap-2">
                <Phone size={12} className="text-brand" /> {driver.telefono}
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
              <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full
                ${driver.activo ? 'bg-success/10 text-success' : 'bg-muted/10 text-muted'}`}>
                {driver.activo ? 'Activo' : 'Inactivo'}
              </span>
              <button 
                onClick={() => toggleStatus(driver.id, driver.activo)}
                className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline"
              >
                {driver.activo ? 'Desactivar' : 'Reactivar'}
              </button>
            </div>
          </div>
        ))}

        {!drivers.length && !loading && (
          <div className="sm:col-span-2 lg:col-span-3 py-16 text-center border-2 border-dashed border-border rounded-[2.5rem]">
             <Bike className="mx-auto text-muted mb-4 opacity-20" size={48} />
             <p className="text-sm font-black text-muted uppercase tracking-widest leading-none">No hay domiciliarios registrados</p>
             <p className="text-[10px] text-muted font-bold uppercase mt-2">Agrega repartidores para asignar pedidos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
