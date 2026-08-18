import { useState, useEffect } from "react";
import { supabase } from "@/services/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

export function SalesList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [cashOperations, setCashOperations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        // Busca as vendas
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select(`
            id, created_at, payment_method, total_amount, status,
            sale_items ( quantity )
          `)
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;
        setOrders(sales || []);

        // Busca o histórico do caixa (se a tabela não existir ainda, vai dar erro e cair no catch)
        const { data: cashData, error: cashError } = await supabase
          .from('cash_register_operations')
          .select('*')
          .in('type', ['ABERTURA', 'FECHAMENTO'])
          .order('created_at', { ascending: false });

        if (cashError) {
          console.log('Tabela cash_register_operations pode não existir ainda:', cashError.message);
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
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Histórico de Vendas</h2>
        <p className="text-coffee-600 mt-1 font-medium">Auditoria das vendas realizadas armazenadas na nuvem.</p>
      </div>

      <Card className="border-none bg-white rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-coffee-950">Últimas Vendas</CardTitle>
          <CardDescription className="text-coffee-500">
            Mostrando os pedidos registrados em tempo real no Supabase.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data / Hora</TableHead>
                <TableHead>Nº Cupom</TableHead>
                <TableHead>Pagamento</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Itens (Qtd)</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-2" />
                    <span className="text-coffee-500">Buscando vendas na nuvem...</span>
                  </TableCell>
                </TableRow>
              ) : !orders?.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-slate-500">
                    Nenhuma venda registrada ainda.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const itemCount = order.sale_items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
                  
                  return (
                    <TableRow key={order.id} className="border-b border-coffee-100 hover:bg-cream-50 transition-colors">
                      <TableCell className="font-medium text-coffee-900">
                        {new Date(order.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-coffee-700">#{order.id.split('-')[0].toUpperCase()}</TableCell>
                      <TableCell className="text-coffee-700">{order.payment_method}</TableCell>
                      <TableCell className="font-bold text-coffee-950">
                        R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                      </TableCell>
                      <TableCell className="text-coffee-500 text-sm font-medium">
                        {itemCount} vol
                      </TableCell>
                      <TableCell className="text-right">
                        {order.status === 'completed' ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                            Aprovada
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                            {order.status}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-none bg-white rounded-2xl shadow-sm mt-8">
        <CardHeader>
          <CardTitle className="text-xl text-coffee-950">Histórico de Caixa</CardTitle>
          <CardDescription className="text-coffee-500">
            Aberturas e fechamentos de caixa registrados no sistema.
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
                    Nenhum evento de caixa registrado ainda.
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
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                          Fechamento
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
