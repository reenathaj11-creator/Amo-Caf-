import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CashRegisterReport() {
  const navigate = useNavigate();
  const [cashOperations, setCashOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtro de mês
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        
        // Define inicio e fim do mês
        const year = parseInt(selectedMonth.split('-')[0]);
        const month = parseInt(selectedMonth.split('-')[1]) - 1;
        const startOfMonth = new Date(year, month, 1).toISOString();
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

        const { data: cashData, error: cashError } = await supabase
          .from('cash_register_operations')
          .select('*')
          .in('type', ['ABERTURA', 'FECHAMENTO', 'SANGRIA', 'SUPRIMENTO'])
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth)
          .order('created_at', { ascending: false });

        if (cashError) {
          console.error('Erro:', cashError.message);
          setCashOperations([]);
        } else {
          setCashOperations(cashData || []);
        }

      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
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
            <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Abertura e Fechamento</h2>
            <p className="text-coffee-600 mt-1 font-medium">Histórico de movimentações e turnos do caixa.</p>
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
        <h1 className="text-2xl font-black uppercase text-coffee-950">Abertura e Fechamento</h1>
        <p className="text-sm font-medium text-coffee-600">Período: {selectedMonth.split('-').reverse().join('/')} | Impresso em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-coffee-100 print:hidden">
        <div className="flex-1">
          <label className="text-sm font-bold text-coffee-900 mb-1 block">Filtrar por Período</label>
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
      </div>

      <Card className="border-none bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-coffee-950">Histórico de Caixa do Período</CardTitle>
          <CardDescription className="text-coffee-500">
            Aberturas, fechamentos, sangrias e suprimentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead className="text-right">Valor em Caixa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-2" />
                    <span className="text-coffee-500">Buscando histórico na nuvem...</span>
                  </TableCell>
                </TableRow>
              ) : !cashOperations.length ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                    Nenhum evento de caixa registrado neste período.
                  </TableCell>
                </TableRow>
              ) : (
                cashOperations.map((op: any) => (
                  <TableRow key={op.id} className="border-b border-coffee-100 hover:bg-cream-50 transition-colors">
                    <TableCell className="font-medium text-coffee-900">
                      {new Date(op.created_at).toLocaleString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-coffee-700 font-medium">
                      {op.user_email?.split('@')[0] || 'Usuário Local'}
                    </TableCell>
                    <TableCell>
                      {op.type === 'ABERTURA' ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                          Abertura
                        </Badge>
                      ) : op.type === 'FECHAMENTO' ? (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          Fechamento
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                          {op.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-coffee-950">
                      R$ {Number(op.amount).toFixed(2).replace('.', ',')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
