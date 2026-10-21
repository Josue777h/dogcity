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
    async function check() {
      if (session) {
        setLoading(false);
        return;
      }
      
      const { data } = await getSupabase().auth.getSession();
      setSession(data.session);
      setLoading(false);
    }
    check();
  }, [session, setSession]);

  if (loading) {
    return <PageLoading title="Comprobando tu acceso" description="Estamos validando tu sesión segura." />;
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!(session.user?.email_confirmed_at || session.user?.confirmed_at)) {
    return <Navigate to="/verificar-correo" state={{ email: session.user?.email }} replace />;
  }
  
  return children;
}
