import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect() {
  const { data: negocios } = await supabase.from('negocios').select('*');
  console.log('NEGOCIOS:', JSON.stringify(negocios, null, 2));

  const { data: productos } = await supabase.from('productos').select('id, nombre, precio, categoria, negocio_id, categoria_id').order('id');
  console.log('\nPRODUCTOS:', JSON.stringify(productos, null, 2));

  const { data: pedidos } = await supabase.from('pedidos').select('id, negocio_id, estado, status, total, created_at').order('created_at', { ascending: false }).limit(5);
  console.log('\nRECENT PEDIDOS:', JSON.stringify(pedidos, null, 2));
}

inspect();
