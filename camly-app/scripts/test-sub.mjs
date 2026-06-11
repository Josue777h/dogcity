import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { error } = await supabase.from('suscripciones').upsert({
  negocio_id: 'a4dda1ba-74b6-401f-937e-999303c12ca1',
  plan: 'pro',
  estado: 'trial',
  fecha_inicio: new Date().toISOString(),
  fecha_fin: new Date(Date.now() + 7*86400000).toISOString(),
}, { onConflict: 'negocio_id' });
console.log(error?.message || 'OK');
