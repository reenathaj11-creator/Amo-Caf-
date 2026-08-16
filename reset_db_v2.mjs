import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteAll() {
  console.log("Iniciando limpeza do banco de dados v2...");

  try {
    // Helper para apagar tabela por tabela
    const clearTable = async (tableName) => {
      console.log(`Buscando registros de ${tableName}...`);
      const { data, error } = await supabase.from(tableName).select('id');
      if (error) {
        console.error(`Erro ao buscar ${tableName}:`, error);
        return;
      }
      
      console.log(`Encontrados ${data.length} registros em ${tableName}.`);
      
      if (data.length > 0) {
        const ids = data.map(d => d.id);
        const { error: deleteError } = await supabase.from(tableName).delete().in('id', ids);
        if (deleteError) {
          console.error(`Erro ao apagar ${tableName}:`, deleteError);
        } else {
          console.log(`✅ ${data.length} registros apagados de ${tableName}.`);
        }
      }
    };

    await clearTable('sale_items');
    await clearTable('sales');
    await clearTable('transactions');
    await clearTable('customers');

    console.log("✅ Limpeza concluída com sucesso!");
  } catch (err) {
    console.error("Erro geral:", err);
  }
}

deleteAll();
