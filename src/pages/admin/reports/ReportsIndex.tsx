import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart2, Wallet, Users, CircleDollarSign } from "lucide-react";

export function ReportsIndex() {
  const navigate = useNavigate();

  const reports = [
    {
      id: "vendas",
      title: "Relatório de Vendas",
      description: "Histórico detalhado de todos os pedidos e faturamento bruto.",
      icon: BarChart2,
      path: "/admin/relatorios/vendas",
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      id: "caixa",
      title: "Abertura / Fechamento",
      description: "Histórico das operações de caixa, sangrias e suprimentos.",
      icon: Wallet,
      path: "/admin/relatorios/caixa",
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      id: "devedores",
      title: "Saldo Devedor",
      description: "Controle de clientes inadimplentes e pagamentos na modalidade 'Conta'.",
      icon: Users,
      path: "/admin/relatorios/devedores",
      color: "text-red-600",
      bg: "bg-red-50"
    },
    {
      id: "financeiro",
      title: "Relatório Financeiro",
      description: "DRE, controle de despesas e conciliação bancária.",
      icon: CircleDollarSign,
      path: "/admin/financeiro", // We can keep /admin/financeiro or move it. Let's keep it there and just link to it.
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-coffee-950">Central de Relatórios</h2>
        <p className="text-coffee-600 mt-1 font-medium">Selecione o relatório que deseja visualizar.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {reports.map((report) => {
          const Icon = report.icon;
          return (
            <Card 
              key={report.id} 
              className="border-none bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group"
              onClick={() => navigate(report.path)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 rounded-xl ${report.bg} ${report.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-coffee-950 mb-2">{report.title}</h3>
                <p className="text-coffee-600 text-sm font-medium">{report.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
