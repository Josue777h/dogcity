import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect() {
  const { data } = await supabase.from('suscripciones').select('*');
  console.log(JSON.stringify(data, null, 2));
  const { data: cols } = await supabase.from('domiciliarios').select('*').limit(1);
  console.log('domiciliarios cols sample:', cols);
}
inspect();
