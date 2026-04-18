import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { getSupabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores';

export default function AuthGuard({ children }) {
  const [loading, setLoading] = useState(true);
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
    return (
      <div className="min-h-screen bg-bg-alt flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      </div>
    );
  }

  // If no session is found, we don't block the AdminPage itself 
  // because the AdminPage has its own login UI if !session.
  // HOWEVER, a real SaaS might want a separate /login page.
  // For now, we'll allow AdminPage to handle its own login state 
  // to maintain the user's current flow.
  
  return children;
}
