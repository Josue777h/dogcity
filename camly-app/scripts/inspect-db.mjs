import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function inspect() {
  for (const table of ['negocios', 'categorias', 'productos', 'pedidos', 'domiciliarios', 'suscripciones']) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' }).limit(2);
    if (error) {
      console.log(`${table} ERROR:`, error.message);
    } else {
      console.log(`\n=== ${table} (${count} rows) ===`);
      if (data?.[0]) {
        console.log('Columns:', Object.keys(data[0]).join(', '));
        console.log('Sample:', JSON.stringify(data[0], null, 2).slice(0, 500));
      } else {
        console.log('(empty)');
      }
    }
  }
}

inspect();
