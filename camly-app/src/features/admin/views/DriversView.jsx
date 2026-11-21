import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  UserPlus, Phone, Trash2, Save,
  Bike, X
} from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { useToastStore } from '../../../stores';
import PremiumLock from '../../../components/ui/PremiumLock';
import ConfirmModal from '../../../components/ui/ConfirmModal';
import PageLoading from '../../../components/common/PageLoading';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function DriversView(props) {
  const outletCtx = useOutletContext() || {};
  const businessId = props.businessId ?? outletCtx.business?.id;

  const [itemToDelete, setItemToDelete] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newDriver, setNewDriver] = useState({ nombre: '', telefono: '', activo: true });
  const addToast = useToastStore(s => s.addToast);

  const fetchDrivers = useCallback(async () => {
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
  }, [businessId, addToast]);

  useEffect(() => {
    if (!businessId) return undefined;
    let active = true;
    Promise.resolve(
      getSupabase()
        .from('domiciliarios')
        .select('*')
        .eq('negocio_id', businessId)
        .order('created_at', { ascending: false })
    )
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error(error);
          addToast('Error al cargar domiciliarios', 'error');
        } else {
          setDrivers(data || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        addToast('Error al cargar domiciliarios', 'error');
        setLoading(false);
      });
    return () => { active = false; };
  }, [businessId, addToast]);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    const cleanName = newDriver.nombre.trim();
    const cleanPhone = newDriver.telefono.trim();
    if (!cleanName || !cleanPhone) return;

    setIsSaving(true);
    try {
      const { error } = await getSupabase()
        .from('domiciliarios')
        .insert([{ ...newDriver, nombre: cleanName, telefono: cleanPhone, negocio_id: businessId }]);

      if (error) throw error;

      addToast('Domiciliario registrado', 'success');
      setNewDriver({ nombre: '', telefono: '', activo: true });
      setIsAdding(false);
      fetchDrivers();
    } catch (err) {
      console.error(err);
      addToast('Error al registrar domiciliario', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      let query = getSupabase()
        .from('domiciliarios')
        .update({ activo: !currentStatus })
        .eq('id', id);
      if (businessId) query = query.eq('negocio_id', businessId);

      const { error } = await query;
      if (error) throw error;
      fetchDrivers();
    } catch (err) {
      console.error(err);
      addToast('No se pudo actualizar el estado del repartidor', 'error');
    }
  };

  const deleteDriver = async (id) => {
    try {
      let query = getSupabase()
        .from('domiciliarios')
        .delete()
        .eq('id', id);
      if (businessId) query = query.eq('negocio_id', businessId);

      const { error } = await query;
      if (error) throw error;
      fetchDrivers();
      addToast('Eliminado correctamente', 'info');
    } catch (err) {
      console.error(err);
      addToast('Error al eliminar repartidor', 'error');
    }
  };

  if (loading && !drivers.length) {
    return <PageLoading fullscreen={false} label="Cargando repartidores" />;
  }

  return (
    <div className="space-y-4 pb-10 animate-fade-in-up">
      {/* Encabezado limpio y profesional */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Bike size={19} className="text-slate-700 shrink-0" />
              <span>Repartidores</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {drivers.length} {drivers.length === 1 ? 'repartidor' : 'repartidores'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona tu equipo de entregas y despacha pedidos a domicilio con un clic.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className={`w-full sm:w-auto py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
            isAdding
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              : 'btn-primary'
          }`}
        >
          {isAdding ? <><X size={15} /><span>Cancelar</span></> : <><UserPlus size={15} /><span>Nuevo repartidor</span></>}
        </button>
      </div>

      <PremiumLock featureName="Gestión de Equipo de Repartidores">
        <div className="space-y-4">
          {/* Formulario de creación */}
          {isAdding && (
            <form onSubmit={handleAddDriver} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-300 shadow-xs space-y-3.5 animate-fade-in">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">Registrar repartidor</p>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    value={newDriver.nombre}
                    onChange={e => setNewDriver({ ...newDriver, nombre: e.target.value })}
                    placeholder="Nombre completo"
                    className="input-field text-sm"
                    required
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="tel"
                    value={newDriver.telefono}
                    onChange={e => setNewDriver({ ...newDriver, telefono: e.target.value })}
                    placeholder="Teléfono / WhatsApp"
                    className="input-field text-sm font-mono"
                    required
                  />
                </div>
                <div className="sm:col-span-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary w-full py-2.5 px-4 rounded-xl text-xs font-bold h-[42px] cursor-pointer"
                  >
                    {isSaving ? <LoadingSpinner size={15} /> : <><Save size={15} /> Guardar</>}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Grilla de repartidores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {drivers.map(driver => (
              <div key={driver.id} className="rounded-2xl border border-slate-200 hover:border-slate-300 bg-white p-4 shadow-2xs transition-all flex flex-col justify-between">
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${driver.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    <Bike size={18} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setItemToDelete(driver)}
                    className="btn-ghost p-1.5 -mr-1 text-slate-400 hover:text-red-600 tap-target"
                    title="Eliminar repartidor"
                    aria-label="Eliminar repartidor"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-950 truncate">{driver.nombre}</h4>
                  <a
                    href={`tel:${driver.telefono}`}
                    className="text-xs text-slate-600 hover:text-slate-950 mt-1 inline-flex items-center gap-1.5 transition-colors truncate max-w-full"
                  >
                    <Phone size={12} className="text-slate-500 shrink-0" />
                    <span className="truncate font-mono">{driver.telefono}</span>
                  </a>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={driver.activo ? 'badge badge-success text-[10px]' : 'badge badge-neutral text-[10px]'}>
                    {driver.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleStatus(driver.id, driver.activo)}
                    className="text-xs font-semibold text-brand hover:text-brand-dark hover:underline py-1 px-2 -mr-2 cursor-pointer"
                  >
                    {driver.activo ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}

            {!drivers.length && !loading && !isAdding && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Bike size={22} />
                </div>
                <p className="text-sm font-bold text-slate-800">No hay domiciliarios registrados</p>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Agrega repartidores para asignarlos a tus pedidos y enviarles los datos directo a WhatsApp.
                </p>
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
