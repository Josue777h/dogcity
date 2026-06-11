import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

for (const id of ['69a10caa-f581-448d-b5df-d65ea426e2fb', 'a4dda1ba-74b6-401f-937e-999303c12ca1']) {
  const { count: p } = await supabase.from('productos').select('*', { count: 'exact', head: true }).eq('negocio_id', id);
  const { count: c } = await supabase.from('categorias').select('*', { count: 'exact', head: true }).eq('negocio_id', id);
  const { count: o } = await supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('negocio_id', id);
  const { data: n } = await supabase.from('negocios').select('nombre_visible, direccion, theme_color').eq('id', id).single();
  console.log({ id: id.slice(0,8), productos: p, categorias: c, pedidos: o, negocio: n });
}
