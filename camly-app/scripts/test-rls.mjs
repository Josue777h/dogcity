import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const BIZ = '69a10caa-f581-448d-b5df-d65ea426e2fb';

const { error: e1 } = await supabase.from('pedidos').insert([{
  negocio_id: BIZ, nombre: 'Test', telefono: '573000000000', total: 10000,
  estado: 'nuevo', status: 'nuevo', items: [], token: 'test123'
}]);
console.log('pedidos:', e1?.message || 'OK');

const { error: e2 } = await supabase.from('domiciliarios').insert([{
  negocio_id: BIZ, nombre: 'Test', telefono: '573000000001', activo: true
}]);
console.log('domiciliarios:', e2?.message || 'OK');
