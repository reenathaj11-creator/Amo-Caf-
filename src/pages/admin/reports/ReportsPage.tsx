import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart2, TrendingUp, DollarSign, Wallet, Users } from "lucide-react"
import { supabase } from "@/services/supabase/client"
import { Loader2 } from "lucide-react"

export function ReportsPage() {
  const [loading, setLoading] = useState(true);
  
  // Métricas
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalFiado, setTotalFiado] = useState(0); // Vendas lançadas na conta
  const [totalReceivables, setTotalReceivables] = useState(0); // Soma dos saldos devedores dos clientes
  const [paymentsReceived, setPaymentsReceived] = useState(0); // Pagamentos de dívidas recebidos

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // 1. Busca vendas totais
      const { data: sales } = await supabase.from('sales').select('total_amount, payment_method');
      if (sales) {
        setTotalSales(sales.length);
        const revenue = sales.reduce((acc, sale) => acc + Number(sale.total_amount), 0);
        setTotalRevenue(revenue);
        
        const fiado = sales.filter(s => s.payment_method === 'Na Conta').reduce((acc, sale) => acc + Number(sale.total_amount), 0);
        setTotalFiado(fiado);
      }

      // 2. Busca total a receber (dívida atual dos clientes)
      const { data: customers } = await supabase.from('customers').select('balance');
      if (customers) {
        const receivables = customers.reduce((acc, c) => acc + Number(c.balance), 0);
        setTotalReceivables(receivables);
      }

      // 3. Busca total de pagamentos de dívida recebidos
      const { data: payments } = await supabase.from('customer_payments').select('amount');
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

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Relatórios Gerenciais</h2>
        <p className="text-coffee-600 mt-1 font-medium">Visão geral do desempenho de vendas e controle financeiro.</p>
      </div>

      {/* Relatórios Gerais */}
      <h3 className="text-xl font-bold text-coffee-900 border-b pb-2">Visão Geral de Vendas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Faturamento Bruto (Todas as Vendas)" 
          value={`R$ ${totalRevenue.toFixed(2).replace('.', ',')}`} 
          icon={TrendingUp} 
          description={`${totalSales} pedidos realizados`}
        />
        <StatCard 
          title="Vendido a Prazo (Fiado)" 
          value={`R$ ${totalFiado.toFixed(2).replace('.', ',')}`} 
          icon={Wallet} 
          description="Total gerado na modalidade Na Conta"
        />
        <StatCard 
          title="Receita Real (À Vista)" 
          value={`R$ ${(totalRevenue - totalFiado).toFixed(2).replace('.', ',')}`} 
          icon={DollarSign} 
          description="Dinheiro, PIX e Cartões"
        />
      </div>

      {/* Relatórios de Inadimplência / Fiado */}
      <h3 className="text-xl font-bold text-coffee-900 border-b pb-2 pt-6">Controle de Fiados (Contas a Receber)</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Dinheiro na Rua (A Receber)" 
          value={`R$ ${totalReceivables.toFixed(2).replace('.', ',')}`} 
          icon={Users} 
          description="Soma do saldo devedor atual de todos os clientes."
          valueClass="text-red-600"
        />
        <StatCard 
          title="Pagamentos Recebidos (Baixas)" 
          value={`R$ ${paymentsReceived.toFixed(2).replace('.', ',')}`} 
          icon={BarChart2} 
          description="Total de dívidas que já foram pagas pelos clientes."
          valueClass="text-emerald-600"
        />
      </div>

      <div className="mt-10 p-6 bg-cream-50 border border-coffee-100 rounded-2xl text-center">
        <BarChart2 className="w-12 h-12 text-coffee-300 mx-auto mb-4" />
        <h4 className="text-lg font-bold text-coffee-900">Mais Relatórios em Breve</h4>
        <p className="text-coffee-500">Gráficos de vendas por categoria, fechamento de caixa e exportação para PDF estarão disponíveis nas próximas atualizações.</p>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, valueClass = "text-coffee-950" }: { title: string, value: string, icon: any, description: string, valueClass?: string }) {
  return (
    <Card className="shadow-sm border-none bg-white rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <p className="text-sm font-semibold text-coffee-600">{title}</p>
          <Icon className="h-5 w-5 text-coffee-400" />
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-black tracking-tight ${valueClass}`}>{value}</h2>
          <p className="text-sm text-coffee-400 font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
