import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart2, TrendingUp, DollarSign, Wallet, Users, Printer } from "lucide-react"
import { supabase } from "@/services/supabase/client"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  
  // Métricas
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalFiado, setTotalFiado] = useState(0);
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [paymentsReceived, setPaymentsReceived] = useState(0);

  // Listagens Detalhadas
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [debtors, setDebtors] = useState<any[]>([]);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // 1. Busca vendas totais do Mês Atual para os cards
      const currentMonth = new Date().toISOString().substring(0, 7);
      const startOfMonth = `${currentMonth}-01T00:00:00.000Z`;
      
      const { data: sales } = await supabase
        .from('sales')
        .select('id, total_amount, payment_method, created_at')
        .order('created_at', { ascending: false });

      if (sales) {
        // Filtrar apenas o mês atual para o resumo
        const thisMonthSales = sales.filter(s => s.created_at >= startOfMonth);
        setTotalSales(thisMonthSales.length);
        
        const revenue = thisMonthSales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
        setTotalRevenue(revenue);
        
        const fiado = thisMonthSales.filter(s => s.payment_method === 'Na Conta').reduce((acc, sale) => acc + Number(sale.total_amount), 0);
        setTotalFiado(fiado);

        // Pegar as 50 mais recentes gerais para a tabela
        setRecentSales(sales.slice(0, 50));
      }

      // 2. Busca total a receber (dívida atual dos clientes)
      const { data: customers } = await supabase
        .from('customers')
        .select('name, balance, phone')
        .gt('balance', 0)
        .order('balance', { ascending: false });

      if (customers) {
        const receivables = customers.reduce((acc, c) => acc + Number(c.balance), 0);
        setTotalReceivables(receivables);
        setDebtors(customers);
      }

      // 3. Busca total de pagamentos de dívida recebidos neste mês
      const { data: payments } = await supabase
        .from('customer_payments')
        .select('amount, created_at')
        .gte('created_at', startOfMonth);

      if (payments) {
        const totalPayments = payments.reduce((acc, p) => acc + Number(p.amount), 0);
        setPaymentsReceived(totalPayments);
      }

    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 print:p-0 print:m-0 print:bg-white">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Relatórios Gerenciais</h2>
          <p className="text-coffee-600 mt-1 font-medium print:hidden">Visão detalhada e relatórios para impressão.</p>
        </div>
        <Button 
          onClick={handlePrint}
          className="bg-coffee-900 hover:bg-coffee-950 text-white rounded-xl shadow-sm gap-2 font-bold print:hidden"
        >
          <Printer className="w-5 h-5" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <div className="print:block hidden mb-8 text-center border-b-2 border-coffee-900 pb-4">
        <h1 className="text-2xl font-black uppercase text-coffee-950">Relatório Consolidado AMO CAFÉ</h1>
        <p className="text-sm font-medium text-coffee-600">Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      {/* Relatórios Gerais do Mês */}
      <div className="print:break-inside-avoid">
        <h3 className="text-xl font-bold text-coffee-900 border-b pb-2">Resumo do Mês Atual</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          <StatCard 
            title="Faturamento Bruto" 
            value={`R$ ${totalRevenue.toFixed(2).replace('.', ',')}`} 
            icon={TrendingUp} 
            description={`${totalSales} pedidos no mês`}
          />
          <StatCard 
            title="Vendido a Prazo (Fiado)" 
            value={`R$ ${totalFiado.toFixed(2).replace('.', ',')}`} 
            icon={Wallet} 
            description="Lançamentos na modalidade Conta"
          />
          <StatCard 
            title="Receita Real (À Vista)" 
            value={`R$ ${(totalRevenue - totalFiado).toFixed(2).replace('.', ',')}`} 
            icon={DollarSign} 
            description="Dinheiro, PIX e Cartões"
          />
        </div>
      </div>

      {/* Controle de Fiados */}
      <div className="print:break-inside-avoid print:mt-8">
        <h3 className="text-xl font-bold text-coffee-900 border-b pb-2 pt-6 print:pt-0">Controle de Inadimplência (Geral)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          <StatCard 
            title="Dinheiro na Rua (A Receber)" 
            value={`R$ ${totalReceivables.toFixed(2).replace('.', ',')}`} 
            icon={Users} 
            description="Soma do saldo devedor de todos os clientes."
            valueClass="text-red-600"
          />
          <StatCard 
            title="Pagamentos Recebidos (Mês)" 
            value={`R$ ${paymentsReceived.toFixed(2).replace('.', ',')}`} 
            icon={BarChart2} 
            description="Dívidas pagas neste mês."
            valueClass="text-emerald-600"
          />
        </div>
      </div>

      {/* Tabela de Devedores */}
      <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden print:shadow-none print:border-none print:break-inside-avoid print:mt-8">
        <div className="p-6 border-b border-coffee-100 print:px-0">
          <h3 className="text-lg font-bold text-red-700">Lista de Clientes com Saldo Devedor</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-red-50 text-red-900 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4 print:px-2">Nome do Cliente</th>
                <th className="px-6 py-4 print:px-2">Telefone</th>
                <th className="px-6 py-4 text-right print:px-2">Dívida Ativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {debtors.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-emerald-600 font-bold">
                    Nenhum cliente inadimplente! 🎉
                  </td>
                </tr>
              ) : (
                debtors.map((c, i) => (
                  <tr key={i} className="hover:bg-red-50/30">
                    <td className="px-6 py-3 font-medium text-coffee-900 print:px-2">{c.name}</td>
                    <td className="px-6 py-3 text-coffee-600 print:px-2">{c.phone || 'Não informado'}</td>
                    <td className="px-6 py-3 text-right font-bold text-red-600 print:px-2">
                      R$ {Number(c.balance).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tabela de Vendas Recentes */}
      <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden print:shadow-none print:border-none print:mt-8">
        <div className="p-6 border-b border-coffee-100 print:px-0">
          <h3 className="text-lg font-bold text-coffee-900">Últimas 50 Vendas</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-coffee-50 text-coffee-700 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4 print:px-2">Data/Hora</th>
                <th className="px-6 py-4 print:px-2">ID Pedido</th>
                <th className="px-6 py-4 print:px-2">Pagamento</th>
                <th className="px-6 py-4 text-right print:px-2">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-coffee-100">
              {recentSales.map((s) => (
                <tr key={s.id} className="hover:bg-brand-50/50">
                  <td className="px-6 py-3 text-coffee-700 print:px-2">
                    {new Date(s.created_at).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-3 text-coffee-500 font-mono text-xs print:px-2">
                    #{s.id.split('-')[0]}
                  </td>
                  <td className="px-6 py-3 print:px-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      s.payment_method === 'Na Conta' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {s.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right font-bold text-coffee-900 print:px-2">
                    R$ {Number(s.total_amount).toFixed(2).replace('.', ',')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, valueClass = "text-coffee-950" }: { title: string, value: string, icon: any, description: string, valueClass?: string }) {
  return (
    <Card className="shadow-sm border-none bg-white rounded-2xl print:shadow-none print:border print:border-coffee-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <p className="text-sm font-semibold text-coffee-600">{title}</p>
          <Icon className="h-5 w-5 text-coffee-400 print:hidden" />
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-black tracking-tight ${valueClass}`}>{value}</h2>
          <p className="text-sm text-coffee-400 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
