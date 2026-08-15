import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, TrendingUp, Users, Loader2 } from "lucide-react";
import { supabase } from "@/services/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useCashRegister } from "@/contexts/CashRegisterContext";

export function Dashboard() {
  const { isOpen } = useCashRegister();
  const [totalFaturamento, setTotalFaturamento] = useState(0);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#D97706', '#059669', '#2563EB', '#DC2626', '#7C3AED', '#DB2777', '#475569'];

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Fetch Sales Basic Info
        const { data: sales, error: salesError } = await supabase
          .from('sales')
          .select('id, total_amount, status')
          .gte('created_at', today.toISOString());

        if (salesError) throw salesError;

        if (sales && sales.length > 0) {
          const total = sales.reduce((acc, order) => acc + Number(order.total_amount), 0);
          setTotalFaturamento(total);
          setTotalPedidos(sales.length);
          setTicketMedio(total / sales.length);
        }

        // 2. Fetch Items for Charts
        const { data: items, error: itemsError } = await supabase
          .from('sale_items')
          .select(`
            quantity,
            total_price,
            sales!inner(created_at),
            products (
              name,
              categories (
                name
              )
            )
          `)
          .gte('sales.created_at', today.toISOString());

        if (itemsError) throw itemsError;

        if (items && items.length > 0) {
          // Processar vendas por categoria
          const catMap: Record<string, number> = {};
          const prodMap: Record<string, number> = {};

          items.forEach((item: any) => {
            const catName = item.products?.categories?.name || 'Sem Categoria';
            const prodName = item.products?.name || 'Produto Desconhecido';
            
            // Soma o valor total daquele item para a categoria
            catMap[catName] = (catMap[catName] || 0) + Number(item.total_price);
            
            // Soma a quantidade vendida do produto
            prodMap[prodName] = (prodMap[prodName] || 0) + Number(item.quantity);
          });

          // Formatar para o Recharts (Gráfico de Rosca)
          const catArray = Object.keys(catMap).map(key => ({
            name: key,
            value: catMap[key]
          })).sort((a, b) => b.value - a.value);
          setCategoryData(catArray);

          // Formatar para o Recharts (Gráfico de Barras)
          const prodArray = Object.keys(prodMap).map(key => ({
            name: key.length > 15 ? key.substring(0, 15) + '...' : key,
            fullName: key,
            qtd: prodMap[key]
          })).sort((a, b) => b.qtd - a.qtd).slice(0, 5); // Pega o Top 5
          setTopProducts(prodArray);
        }

      } catch (err) {
        console.error("Erro ao buscar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Dashboard</h2>
        <p className="text-coffee-600 mt-1 font-medium">Resumo de desempenho da cafeteria hoje.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Faturamento Total" 
          value={loading ? "..." : `R$ ${totalFaturamento.toFixed(2).replace('.', ',')}`} 
          icon={TrendingUp} 
          trend="" 
        />
        <StatCard 
          title="Total de Pedidos" 
          value={loading ? "..." : totalPedidos.toString()} 
          icon={ShoppingCart} 
          trend="" 
        />
        <StatCard 
          title="Ticket Médio" 
          value={loading ? "..." : `R$ ${ticketMedio.toFixed(2).replace('.', ',')}`} 
          icon={Users} 
          trend="" 
        />
        <StatCard title="Caixa" value={isOpen ? "Aberto" : "Fechado"} icon={Package} trend="" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Vendas por Categoria */}
        <Card className="col-span-1 shadow-sm border-none bg-white rounded-2xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-coffee-950">Faturamento por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {loading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : categoryData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-400">Sem dados suficientes</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `R$ ${Number(value).toFixed(2).replace('.', ',')}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Produtos Mais Vendidos */}
        <Card className="col-span-1 shadow-sm border-none bg-white rounded-2xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg text-coffee-950">Top 5 Produtos (Unidades Vendidas)</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-[300px]">
            {loading ? (
               <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>
            ) : topProducts.length === 0 ? (
               <div className="h-full flex items-center justify-center text-slate-400">Sem dados suficientes</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E2E8F0" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#475569' }} />
                  <Tooltip 
                    cursor={{fill: '#F1F5F9'}} 
                    formatter={(value: any, _: any, props: any) => [`R$ ${Number(value).toFixed(2)}`, props.payload.productName]}
                  />
                  <Bar dataKey="qtd" fill="#D97706" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend }: { title: string, value: string, icon: any, trend: string }) {
  return (
    <Card className="shadow-sm border-none bg-white rounded-2xl hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-4">
          <p className="text-sm font-semibold text-coffee-600">{title}</p>
          <Icon className="h-5 w-5 text-brand-500 bg-brand-50 p-1 rounded-md" />
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="text-3xl font-black text-coffee-950 tracking-tight">{value}</h2>
          {trend && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">{trend}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
