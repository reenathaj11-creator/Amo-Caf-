import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Users, BarChart2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function DebtorsReport() {
  const navigate = useNavigate();
  const [debtors, setDebtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReceivables, setTotalReceivables] = useState(0);
  const [paymentsReceived, setPaymentsReceived] = useState(0);

  // Filtro de mês (aplica-se aos pagamentos recebidos)
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        const year = parseInt(selectedMonth.split('-')[0]);
        const month = parseInt(selectedMonth.split('-')[1]) - 1;
        const startOfMonth = new Date(year, month, 1).toISOString();
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

        // Saldo devedor atual (não depende do mês, é a dívida ativa atual)
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

        // Pagamentos recebidos NO MÊS selecionado
        const { data: payments } = await supabase
          .from('customer_payments')
          .select('amount, created_at')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        if (payments) {
          const totalPayments = payments.reduce((acc, p) => acc + Number(p.amount), 0);
          setPaymentsReceived(totalPayments);
        }

      } catch (err) {
        console.error("Erro ao buscar dados de devedores:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedMonth]);

  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
    monthOptions.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0 print:m-0 print:bg-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-xl border-coffee-200" onClick={() => navigate('/admin/relatorios')}>
            <ArrowLeft className="w-5 h-5 text-coffee-600" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Saldo Devedor (Fiados)</h2>
            <p className="text-coffee-600 mt-1 font-medium">Controle de clientes com contas em aberto e recebimentos.</p>
          </div>
        </div>
        <Button 
          onClick={handlePrint}
          className="bg-coffee-900 hover:bg-coffee-950 text-white rounded-xl shadow-sm gap-2 font-bold"
        >
          <Printer className="w-5 h-5" />
          Imprimir / Salvar PDF
        </Button>
      </div>

      <div className="print:block hidden mb-8 text-center border-b-2 border-coffee-900 pb-4">
        <h1 className="text-2xl font-black uppercase text-coffee-950">Relatório de Inadimplência</h1>
        <p className="text-sm font-medium text-coffee-600">Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-coffee-100 print:hidden">
        <div className="flex-1 w-full">
          <label className="text-sm font-bold text-coffee-900 mb-1 block">Filtrar Recebimentos por Período</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Selecione o mês" />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-coffee-500 font-medium md:max-w-xs">
          O filtro de mês afeta apenas os pagamentos recebidos. A tabela abaixo exibe a dívida ativa total atual de cada cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="shadow-sm border-none bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-4">
              <p className="text-sm font-semibold text-coffee-600">Dívida Ativa Total (Na Rua)</p>
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-red-600">
                R$ {totalReceivables.toFixed(2).replace('.', ',')}
              </h2>
              <p className="text-sm text-coffee-400 font-medium">Soma do saldo devedor de todos os clientes.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-none bg-white rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-4">
              <p className="text-sm font-semibold text-coffee-600">Pagamentos Recebidos (No Período)</p>
              <BarChart2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-emerald-600">
                R$ {paymentsReceived.toFixed(2).replace('.', ',')}
              </h2>
              <p className="text-sm text-coffee-400 font-medium">Dívidas pagas no mês selecionado.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 overflow-hidden">
        <div className="p-6 border-b border-coffee-100">
          <h3 className="text-lg font-bold text-red-700">Lista de Clientes com Saldo Devedor Atual</h3>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-10 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-2" />
              <span className="text-coffee-500">Buscando devedores...</span>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-red-50 text-red-900 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Nome do Cliente</th>
                  <th className="px-6 py-4">Telefone</th>
                  <th className="px-6 py-4 text-right">Dívida Ativa</th>
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
                    <tr key={i} className="hover:bg-red-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-coffee-900">{c.name}</td>
                      <td className="px-6 py-4 text-coffee-600">{c.phone || 'Não informado'}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        R$ {Number(c.balance).toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
