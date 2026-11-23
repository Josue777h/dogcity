import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, Volume2, CreditCard, Settings, LogOut,
  CheckCircle2, Save, Eye, EyeOff, BellRing, ShieldCheck,
} from 'lucide-react';
import { getSupabase } from '../../../lib/supabase';
import { readMigratedLocalStorage } from '../../../lib/localStorage';
import { playNewOrderSound } from '../../../lib/utils';
import { useAuthStore, useBusinessStore, useToastStore } from '../../../stores';
import SettingsDrawer from '../../../components/ui/SettingsDrawer';

export default function UserProfileMenu({ onSignOut }) {
  const navigate = useNavigate();
  const { session, setSession } = useAuthStore();
  const { isPro, isExpired, trialDaysLeft, subscription } = useBusinessStore();
  const addToast = useToastStore((s) => s.addToast);

  const user = session?.user;
  const userEmail = user?.email || '';
  const initialName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const initialPhone = user?.user_metadata?.phone || '';
  const displayName = initialName.trim() || (userEmail ? userEmail.split('@')[0] : 'Usuario');
  const userInitial = (displayName.charAt(0) || userEmail.charAt(0) || 'U').toUpperCase();
  const isVerified = Boolean(user?.email_confirmed_at);

  const [menuOpen, setMenuOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuRef = useRef(null);

  // Estado del formulario de perfil personal
  const [fullName, setFullName] = useState(initialName);
  const [personalPhone, setPersonalPhone] = useState(initialPhone);
  const [savingProfile, setSavingProfile] = useState(false);

  // Preferencias locales del panel
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return readMigratedLocalStorage('negu_order_sound', ['camly_order_sound']) !== 'false';
    } catch {
      return true;
    }
  });

  // Cambio de contraseña
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const openAccountDrawer = () => {
    setFullName(initialName);
    setPersonalPhone(initialPhone);
    setMenuOpen(false);
    setDrawerOpen(true);
  };

  // Cerrar menú desplegable al hacer clic fuera o presionar Escape
  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem('negu_order_sound', next ? 'true' : 'false');
    } catch (err) {
      console.debug('localStorage no disponible:', err);
    }
    addToast(next ? 'Alertas activadas' : 'Alertas silenciadas', 'info');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      addToast('Escribe tu nombre', 'warning');
      return;
    }
    setSavingProfile(true);
    try {
      const sb = getSupabase();
      const { data, error } = await sb.auth.updateUser({
        data: {
          full_name: trimmedName,
          phone: personalPhone.trim(),
        },
      });
      if (error) throw error;
      if (data?.user && session) {
        setSession({ ...session, user: data.user });
      }
      addToast('Perfil actualizado', 'success');
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Error al guardar perfil', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Mínimo 6 caracteres', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Las contraseñas no coinciden', 'warning');
      return;
    }
    setSavingPassword(true);
    try {
      const sb = getSupabase();
      const { error } = await sb.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword('');
      setConfirmPassword('');
      addToast('Contraseña actualizada', 'success');
    } catch (err) {
      console.error(err);
      addToast(err?.message || 'Error al cambiar contraseña', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  const planLabel = isExpired
    ? 'Vencido'
    : subscription?.estado === 'trial'
      ? `${trialDaysLeft}d prueba`
      : isPro
        ? 'Plan Pro'
        : 'Activo';

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="Abrir perfil de usuario"
          title={userEmail || 'Mi cuenta'}
          className={`flex w-9 h-9 rounded-full bg-brand text-white text-sm font-bold items-center justify-center shrink-0 select-none cursor-pointer transition-all ${
            menuOpen ? 'ring-2 ring-offset-2 ring-slate-900' : 'hover:opacity-90'
          }`}
        >
          {userInitial}
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-xl shadow-slate-950/10 py-1.5 z-[110] animate-fade-in"
          >
            {/* Identidad del usuario */}
            <div className="px-3.5 py-2.5 border-b border-slate-100">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-slate-950 truncate">{displayName}</p>
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  Propietario
                </span>
              </div>
              {userEmail && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{userEmail}</p>
              )}
            </div>

            {/* Opciones de cuenta */}
            <div className="py-1">
              <button
                type="button"
                role="menuitem"
                onClick={openAccountDrawer}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <User size={14} className="text-slate-400 shrink-0" />
                <span>Mi cuenta y seguridad</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('open-billing-modal'));
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center justify-between gap-2 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2.5">
                  <CreditCard size={14} className="text-slate-400 shrink-0" />
                  <span>Plan y facturación</span>
                </span>
                <span
                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                    isExpired
                      ? 'bg-red-50 text-red-700'
                      : isPro
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-800'
                  }`}
                >
                  {planLabel}
                </span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  navigate('/admin/configuracion');
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <Settings size={14} className="text-slate-400 shrink-0" />
                <span>Configuración de la tienda</span>
              </button>
            </div>

            {/* Cerrar sesión */}
            <div className="border-t border-slate-100 pt-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  onSignOut?.();
                }}
                className="w-full px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <LogOut size={14} className="shrink-0" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Panel completo de Mi Cuenta (independiente del negocio) */}
      <SettingsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Mi cuenta"
        subtitle="Tu perfil personal, alertas del panel y seguridad de acceso."
        icon={User}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false);
                onSignOut?.();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 cursor-pointer"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Listo
            </button>
          </div>
        }
      >
        {/* 1. Perfil personal */}
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div className="flex items-center gap-3 pb-1">
            <div className="w-12 h-12 rounded-full bg-brand text-white text-lg font-bold flex items-center justify-center shrink-0">
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950 truncate">{displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
                {isVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded shrink-0">
                    <CheckCircle2 size={10} />
                    Verificado
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <label htmlFor="account-full-name" className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre completo
              </label>
              <input
                id="account-full-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Josué Martínez"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="account-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono personal <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                id="account-phone"
                type="tel"
                value={personalPhone}
                onChange={(e) => setPersonalPhone(e.target.value)}
                placeholder="Ej. 300 123 4567"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Este dato es solo de tu cuenta. El WhatsApp de pedidos se configura en tu tienda.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Save size={13} />
              <span>{savingProfile ? 'Guardando...' : 'Guardar perfil'}</span>
            </button>
          </div>
        </form>

        {/* 2. Preferencias personales del panel */}
        <div className="pt-5 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <BellRing size={14} className="text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Preferencias en este dispositivo
            </h4>
          </div>

          <div className="rounded-xl border border-slate-200/90 p-3.5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">Sonido de nuevos pedidos</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Reproduce una alerta cuando entra un pedido o llamado de mesa.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={soundEnabled}
              onClick={handleToggleSound}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                soundEnabled ? 'bg-emerald-500' : 'bg-slate-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <button
            type="button"
            onClick={() => playNewOrderSound()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
          >
            <Volume2 size={13} />
            Probar sonido de alerta
          </button>
        </div>

        {/* 3. Seguridad y contraseña */}
        <form onSubmit={handleUpdatePassword} className="pt-5 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-slate-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Seguridad y contraseña
            </h4>
          </div>

          <div className="space-y-2.5">
            <div>
              <label htmlFor="account-new-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  id="account-new-password"
                  type={showPass ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  className="w-full h-10 pl-3 pr-10 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="account-confirm-password" className="block text-xs font-semibold text-slate-700 mb-1">
                Confirmar contraseña
              </label>
              <input
                id="account-confirm-password"
                type={showPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword || !newPassword}
              className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Lock size={13} />
              <span>{savingPassword ? 'Actualizando...' : 'Actualizar contraseña'}</span>
            </button>
          </div>

          {lastSignIn && (
            <p className="text-[11px] text-slate-400 pt-1">
              Último inicio de sesión: {lastSignIn}
            </p>
          )}
        </form>
      </SettingsDrawer>
    </>
  );
}
