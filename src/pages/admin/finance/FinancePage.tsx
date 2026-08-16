import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2 } from 'lucide-react';
import { TransactionModal } from './components/TransactionModal';

export function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [posRevenue, setPosRevenue] = useState(0);
  const [manualRevenue, setManualRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const currentMonthString = new Date().toISOString().substring(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthString);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      let startDateStr = '';
      let endDateStr = '';
      let startDay = '';
      let endDay = '';
      
      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        startDateStr = `${selectedMonth}-01T00:00:00.000Z`;
        // O Date usa zero-index pro mês, mas passando Number(month) estamos pedindo o mês +1
        endDateStr = new Date(Number(year), Number(month), 1).toISOString();
        
        startDay = `${selectedMonth}-01`;
        const lastDayObj = new Date(Number(year), Number(month), 0);
        endDay = lastDayObj.toISOString().split('T')[0];
      }

      // 1. Buscar todas as vendas (Receita de PDV)
      let salesQuery = supabase.from('sales').select('total_amount');
      if (selectedMonth) {
        salesQuery = salesQuery.gte('created_at', startDateStr).lt('created_at', endDateStr);
      }
      
      const { data: salesData, error: salesError } = await salesQuery;
      
      if (salesError) throw salesError;
      const pdvTotal = salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
      setPosRevenue(pdvTotal);

      // 2. Buscar todas as transações manuais (Receitas e Despesas do Livro Caixa)
      let txQuery = supabase.from('transactions').select('*').order('date', { ascending: false });
      if (selectedMonth) {
        txQuery = txQuery.gte('date', startDay).lte('date', endDay);
      }
      
      const { data: txData, error: txError } = await txQuery;

      if (txError) {
        console.error('Tabela transactions pode não existir:', txError.message);
      } else {
        setTransactions(txData || []);
        
        const manualIncomes = txData?.filter(t => t.type === 'income').reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
        const manualExpenses = txData?.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
        
        setManualRevenue(manualIncomes);
        setTotalExpenses(manualExpenses);
      }

    } catch (error) {
      console.error('Erro ao buscar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, [selectedMonth]);

  const handleDeleteTransaction = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este lançamento?')) return;
    
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      fetchFinancialData();
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      alert('Erro ao excluir transação.');
    }
  };

  const handleResetSystem = async () => {
    const confirm = window.prompt("ATENÇÃO PERIGO: Digite ZERAR para apagar definitivamente TODAS as Vendas, Transações e Clientes.");
    if (confirm !== "ZERAR") return;
    
    try {
      setLoading(true);
      // O frontend tem a permissão de usuário logado para realizar os deletes
      await supabase.from('sale_items').delete().not('id', 'is', null);
      await supabase.from('sales').delete().not('id', 'is', null);
      await supabase.from('transactions').delete().not('id', 'is', null);
      await supabase.from('customers').delete().not('id', 'is', null);
      
      // Limpa os pedidos offline também
      if (window.indexedDB) {
        window.indexedDB.deleteDatabase('amocafe_pos_db');
      }

      alert("Tudo zerado com sucesso! Recarregue a página.");
      window.location.reload();
    } catch (error) {
      console.error('Erro ao zerar sistema:', error);
      alert("Houve um erro ao zerar.");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = posRevenue + manualRevenue;
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-coffee-950">Livro Caixa (Financeiro)</h2>
          <p className="text-coffee-600">Acompanhamento completo de entradas, saídas e lucro.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-[140px] h-10 rounded-xl border-coffee-200"
          />
          <Button 
            variant={selectedMonth === '' ? 'default' : 'outline'}
            onClick={() => setSelectedMonth('')}
            className={`h-10 rounded-xl font-semibold border-coffee-200 transition-colors ${selectedMonth === '' ? 'bg-coffee-900 text-white hover:bg-coffee-800' : 'text-coffee-600 hover:bg-coffee-50'}`}
          >
            Ver Tudo
          </Button>
          <Button 
            onClick={handleResetSystem}
            variant="destructive"
            className="h-10 rounded-xl font-bold shadow-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Zerar Tudo
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm gap-2 font-bold ml-auto sm:ml-2"
          >
            <Plus className="w-5 h-5" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <TrendingUp className="w-16 h-16 text-emerald-500" />
              </div>
              <h3 className="text-sm font-semibold text-coffee-500 mb-1">Receita Total</h3>
              <p className="text-3xl font-bold text-coffee-900 mb-2">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div className="text-xs text-coffee-400 font-medium space-x-2">
                <span>PDV: R$ {posRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                <span>•</span>
                <span>Extra: R$ {manualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <TrendingDown className="w-16 h-16 text-red-500" />
              </div>
              <h3 className="text-sm font-semibold text-coffee-500 mb-1">Total de Despesas</h3>
              <p className="text-3xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className={`bg-white p-6 rounded-2xl shadow-sm border ${netProfit >= 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'} flex flex-col relative overflow-hidden`}>
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <DollarSign className={`w-16 h-16 ${netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
              </div>
              <h3 className="text-sm font-semibold text-coffee-600 mb-1">Lucro Líquido</h3>
              <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          {/* TABELA LIVRO CAIXA */}
          <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
            <div className="p-6 border-b border-coffee-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-coffee-900">Livro Caixa Mensal (Manual)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-coffee-50 text-coffee-700 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Descrição</th>
                    <th className="px-6 py-4">Categoria</th>
                    <th className="px-6 py-4">Pagamento</th>
                    <th className="px-6 py-4 text-right">Valor</th>
                    <th className="px-6 py-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-coffee-500">
                        Nenhum lançamento manual efetuado ainda.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-coffee-900 whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </td>
                        <td className="px-6 py-4 text-coffee-700 flex items-center gap-2">
                          {tx.type === 'income' ? (
                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-500" />
                          )}
                          {tx.description}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-coffee-100 text-coffee-800">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-coffee-600">
                          {tx.payment_method}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                          {tx.type === 'income' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-2 text-coffee-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchFinancialData} 
      />
    </div>
  );
}
