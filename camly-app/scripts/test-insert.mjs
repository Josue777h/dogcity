import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BIZ = '69a10caa-f581-448d-b5df-d65ea426e2fb'; // pizzaliberty

async function test() {
  const { data, error } = await supabase.from('categorias').insert([{
    negocio_id: BIZ,
    nombre: 'TEST DELETE ME'
  }]).select();
  console.log('insert categorias:', error?.message || 'OK', data);

  if (data?.[0]) {
    await supabase.from('categorias').delete().eq('id', data[0].id);
    console.log('cleaned up test row');
  }
}
test();
