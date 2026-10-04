import { useState, useEffect } from 'react';
import { 
  UserPlus, Phone, Trash2, Loader2, Save, 
  Bike, CheckCircle2, X
} from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';
import PremiumLock from '../../../components/ui/PremiumLock';
import ConfirmModal from '../../../components/ui/ConfirmModal';

export default function DriversView({ businessId }) {
  const [itemToDelete, setItemToDelete] = useState(null);
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
      addToast('Error al registrar domiciliario', 'error');
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
        <Loader2 className="animate-spin text-orange-600" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="min-w-0 flex-1">
           <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Repartidores</h3>
           <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">Gestiona tu equipo de entregas y despacha pedidos con un clic</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="btn-primary w-full sm:w-auto py-2.5 px-4 text-xs font-semibold shrink-0 justify-center"
        >
          {isAdding ? <><X size={15} /> Cancelar</> : <><UserPlus size={15} /> Nuevo repartidor</>}
        </button>
      </div>

      <PremiumLock featureName="Gestión de Equipo de Repartidores">
        <div className="space-y-5">
          {/* Add form */}
          {isAdding && (
            <form onSubmit={handleAddDriver} className="card p-4 sm:p-5 border-orange-200 bg-orange-50/40 animate-fade-in">
              <p className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Registrar repartidor</p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5">
                  <input 
                    type="text" 
                    value={newDriver.nombre}
                    onChange={e => setNewDriver({...newDriver, nombre: e.target.value})}
                    placeholder="Nombre completo"
                    className="input-field text-sm" 
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <input 
                    type="tel" 
                    value={newDriver.telefono}
                    onChange={e => setNewDriver({...newDriver, telefono: e.target.value})}
                    placeholder="Teléfono / WhatsApp"
                    className="input-field text-sm font-mono" 
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="btn-primary w-full py-2.5 px-4 text-xs font-semibold h-[42px] justify-center"
                  >
                    {loading ? <Loader2 size={15} className="animate-spin" /> : <><Save size={15} /> Guardar</>}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Drivers Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {drivers.map(driver => (
              <div key={driver.id} className="card p-4 transition-all hover:border-gray-300 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${driver.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                    <Bike size={18} />
                  </div>
                  <button 
                    onClick={() => setItemToDelete(driver)}
                    className="btn-ghost p-1.5 -mr-1 text-gray-400 hover:text-red-600 tap-target"
                    title="Eliminar repartidor"
                    aria-label="Eliminar repartidor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate">{driver.nombre}</h4>
                  <a 
                    href={`tel:${driver.telefono}`}
                    className="text-xs text-gray-500 hover:text-orange-600 mt-1 inline-flex items-center gap-1.5 transition-colors truncate max-w-full"
                  >
                    <Phone size={12} className="text-orange-600 shrink-0" />
                    <span className="truncate">{driver.telefono}</span>
                  </a>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className={driver.activo ? 'badge badge-success text-[10px]' : 'badge badge-neutral text-[10px]'}>
                    {driver.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button 
                    onClick={() => toggleStatus(driver.id, driver.activo)}
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 hover:underline py-1 px-2 -mr-2"
                  >
                    {driver.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}

            {!drivers.length && !loading && !isAdding && (
              <div className="col-span-full py-16 text-center card border-dashed p-8">
                 <Bike className="mx-auto text-gray-300 mb-2" size={32} />
                 <p className="text-sm font-semibold text-gray-800">No hay domiciliarios registrados</p>
                 <p className="text-xs text-gray-500 mt-1">Agrega repartidores para asignarlos a tus pedidos y enviarles los datos directo a WhatsApp.</p>
              </div>
            )}
          </div>
        </div>
      </PremiumLock>

      <ConfirmModal 
        isOpen={!!itemToDelete}
        title="Desvincular Repartidor"
        message={`¿Estás seguro de eliminar a "${itemToDelete?.nombre}"?`}
        onConfirm={() => {
          deleteDriver(itemToDelete.id);
          setItemToDelete(null);
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
}
