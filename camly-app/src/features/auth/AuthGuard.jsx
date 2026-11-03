import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores';
import PageLoading from '../../components/common/PageLoading';

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { session, setSession } = useAuthStore();

  useEffect(() => {
    let active = true;
    const timeoutId = setTimeout(() => {
      if (active) setLoading(false);
    }, 6000);

    async function check() {
      try {
        if (session) {
          if (active) setLoading(false);
          return;
        }
        const { data } = await getSupabase().auth.getSession();
        if (active) {
          setSession(data?.session || null);
        }
      } catch (err) {
        console.error('Error comprobando sesión:', err);
      } finally {
        clearTimeout(timeoutId);
        if (active) setLoading(false);
      }
    }
    check();

    return () => {
      active = false;
      clearTimeout(timeoutId);
    };
  }, [session, setSession]);

  if (loading) {
    return <PageLoading label="Comprobando tu acceso" />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!(session.user?.email_confirmed_at || session.user?.confirmed_at)) {
    return <Navigate to="/verificar-correo" state={{ email: session.user?.email }} replace />;
  }
  
  return children;
}
