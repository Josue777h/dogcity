import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './src/lib/constants.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debug() {
  console.log('--- RE-AUDITORÍA DE EMERGENCIA ---');
  
  try {
    // Check 'negocios'
    const { data: neg, error: negErr } = await supabase.from('negocios').select('*').limit(1);
    if (negErr) {
      console.error('Error en negocios:', negErr.message);
    } else if (neg && neg.length > 0) {
      console.log('Columnas REALES en negocios:', Object.keys(neg[0] || {}).join(', '));
    }

    // Check 'productos'
    const { data: prod, error: prodErr } = await supabase.from('productos').select('*').limit(1);
    if (prodErr) {
      console.error('Error en productos:', prodErr.message);
    } else if (prod && prod.length > 0) {
      console.log('Columnas REALES en productos:', Object.keys(prod[0] || {}).join(', '));
    }

    // Check specifically for payment columns
    const { error: specErr } = await supabase.from('negocios').select('pago_alias, pago_banco').limit(1);
    if (specErr) {
      console.error('Columnas pago_alias/banco NO ENCONTRADAS:', specErr.message);
    } else {
      console.log('Columnas de pago CONFIRMADAS.');
    }
  } catch (e) {
    console.error('Error general:', e);
  }
}

debug();
