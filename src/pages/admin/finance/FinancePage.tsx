import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, TrendingUp, TrendingDown, DollarSign, Trash2, ArrowLeft, Printer, BarChart3 } from 'lucide-react';
import { TransactionModal } from './components/TransactionModal';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FinancePage() {
  const [loading, setLoading] = useState(true);
  const [posRevenue, setPosRevenue] = useState(0);
  const [manualRevenue, setManualRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [dailyRevenue, setDailyRevenue] = useState<any[]>([]);
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

      // 1. Buscar Totais de Vendas (Receita de PDV) usando RPC super rápido
      if (selectedMonth) {
        const { data: totalSales, error: salesError } = await supabase.rpc('get_sales_total', {
          p_start_date: startDateStr,
          p_end_date: endDateStr
        });
        if (salesError) throw salesError;
        setPosRevenue(totalSales || 0);

        // Buscar Faturamento Diário para o Gráfico
        const { data: dailyData, error: dailyError } = await supabase.rpc('get_daily_revenue', {
          p_start_date: startDateStr,
          p_end_date: endDateStr
        });
        
        if (!dailyError && dailyData) {
          // Formatar data para o gráfico ('YYYY-MM-DD' para 'DD/MM')
          const formattedDaily = dailyData.map((d: any) => {
            const [, m, day] = d.day.split('-');
            return {
              name: `${day}/${m}`,
              total: Number(d.total_revenue)
            };
          });
          setDailyRevenue(formattedDaily);
        } else {
          setDailyRevenue([]);
        }

      } else {
        // Sem filtro, pode usar aggregation simples do JS ou outra query se necessário
        const { data: salesData } = await supabase.from('sales').select('total_amount');
        setPosRevenue(salesData?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0);
        setDailyRevenue([]); // Grafico diário fica vazio sem filtro de mês
      }

      // 2. Buscar Totais do Livro Caixa Manual usando RPC
      if (selectedMonth) {
        const { data: txTotals, error: txTotalError } = await supabase.rpc('get_transactions_totals', {
          p_start_date: startDay,
          p_end_date: endDay
        });
        
        if (txTotalError) {
          console.error("Erro na RPC de transações", txTotalError);
        } else if (txTotals && txTotals.length > 0) {
          setManualRevenue(txTotals[0].manual_income || 0);
          setTotalExpenses(txTotals[0].manual_expense || 0);
        }
      }

      // 3. Buscar os registros detalhados das transações para exibir na tabela da tela
      // Aqui usamos limits se for "Ver Tudo" para não travar
      let txQuery = supabase.from('transactions').select('*').order('date', { ascending: false });
      if (selectedMonth) {
        txQuery = txQuery.gte('date', startDay).lte('date', endDay);
      } else {
        txQuery = txQuery.limit(100); // Prevenção de gargalo ao "Ver Tudo"
      }
      
      const { data: txData, error: txError } = await txQuery;

      if (txError) {
        console.error('Tabela transactions com erro:', txError.message);
      } else {
        setTransactions(txData || []);
        
        // Se for "Ver Tudo", precisamos calcular os totais manualmente pois a RPC exige datas
        if (!selectedMonth) {
          const manualIncomes = txData?.filter(t => t.type === 'income').reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
          const manualExpenses = txData?.filter(t => t.type === 'expense').reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
          setManualRevenue(manualIncomes);
          setTotalExpenses(manualExpenses);
        }
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

  const totalRevenue = posRevenue + manualRevenue;
  const netProfit = totalRevenue - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 print:p-0 print:m-0 print:bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl border-coffee-200" onClick={() => window.location.href = '/admin/relatorios'}>
            <ArrowLeft className="w-5 h-5 text-coffee-600" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-coffee-950">Livro Caixa (Financeiro)</h2>
            <p className="text-coffee-600">Acompanhamento completo de entradas, saídas e lucro.</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button 
            onClick={handlePrint}
            className="h-10 bg-coffee-900 hover:bg-coffee-950 text-white rounded-xl shadow-sm gap-2 font-bold"
          >
            <Printer className="w-5 h-5" />
            <span className="hidden sm:inline">Imprimir</span>
          </Button>
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
            onClick={() => setIsModalOpen(true)}
            className="h-10 bg-brand-500 hover:bg-brand-600 text-white rounded-xl shadow-sm gap-2 font-bold ml-auto sm:ml-2"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Novo</span> Lançamento
          </Button>
        </div>
      </div>

      <div className="print:block hidden mb-8 text-center border-b-2 border-coffee-900 pb-4">
        <h1 className="text-2xl font-black uppercase text-coffee-950">Relatório Financeiro</h1>
        <p className="text-sm font-medium text-coffee-600">Período: {selectedMonth.split('-').reverse().join('/') || 'Geral'} | Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <>
          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <TrendingUp className="w-16 h-16 text-emerald-500" />
              </div>
              <p className="text-sm font-semibold text-emerald-700 mb-1 z-10">Receita Bruta (PDV + Manual)</p>
              <h3 className="text-3xl font-black text-emerald-950 z-10">R$ {totalRevenue.toFixed(2).replace('.', ',')}</h3>
              <p className="text-xs text-emerald-600 mt-2 font-medium z-10">
                PDV: R$ {posRevenue.toFixed(2).replace('.', ',')} | Entradas: R$ {manualRevenue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <TrendingDown className="w-16 h-16 text-red-500" />
              </div>
              <p className="text-sm font-semibold text-red-700 mb-1 z-10">Despesas / Saídas</p>
              <h3 className="text-3xl font-black text-red-950 z-10">R$ {totalExpenses.toFixed(2).replace('.', ',')}</h3>
              <p className="text-xs text-red-600 mt-2 font-medium z-10">Todas as saídas manuais do período</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-sm border flex flex-col relative overflow-hidden ${netProfit >= 0 ? 'bg-brand-50 border-brand-200' : 'bg-red-50 border-red-200'}`}>
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <DollarSign className={`w-16 h-16 ${netProfit >= 0 ? 'text-brand-600' : 'text-red-600'}`} />
              </div>
              <p className={`text-sm font-semibold mb-1 z-10 ${netProfit >= 0 ? 'text-brand-800' : 'text-red-800'}`}>Resultado Líquido</p>
              <h3 className={`text-3xl font-black z-10 ${netProfit >= 0 ? 'text-brand-950' : 'text-red-950'}`}>R$ {netProfit.toFixed(2).replace('.', ',')}</h3>
              <p className={`text-xs mt-2 font-medium z-10 ${netProfit >= 0 ? 'text-brand-700' : 'text-red-700'}`}>
                {netProfit >= 0 ? 'Lucro no período' : 'Prejuízo no período'}
              </p>
            </div>
          </div>

          {/* GRÁFICO DE FATURAMENTO DIÁRIO */}
          {selectedMonth && dailyRevenue.length > 0 && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-coffee-100 mb-8 print:break-inside-avoid">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-brand-600" />
                <h3 className="text-lg font-bold text-coffee-950">Faturamento Diário do PDV</h3>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyRevenue} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }}
                      tickFormatter={(value) => `R$ ${value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [`R$ ${Number(value).toFixed(2).replace('.', ',')}`, 'Faturamento']}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold', marginBottom: '4px' }}
                    />
                    <Bar dataKey="total" fill="#D97706" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

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
