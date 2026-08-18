import { Routes, Route } from 'react-router-dom';

import { TopHeader } from '@/components/layout/TopHeader';
import { Dashboard } from './Dashboard';
import { ProductsList } from './products/ProductsList';
import { CategoriesList } from './categories/CategoriesList';
import { CustomersList } from './customers/CustomersList';
import { FinancePage } from './finance/FinancePage';
import { ReportsIndex } from './reports/ReportsIndex';
import { SalesReport } from './reports/SalesReport';
import { CashRegisterReport } from './reports/CashRegisterReport';
import { DebtorsReport } from './reports/DebtorsReport';

export function AdminLayout() {
  return (
      <div className="flex flex-col h-screen bg-[#FCFAFA] font-sans print:h-auto print:block print:bg-white">
        <TopHeader />

        <main className="flex-1 overflow-auto p-8 print:overflow-visible print:p-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produtos/*" element={<ProductsList />} />
            <Route path="/categorias/*" element={<CategoriesList />} />
            <Route path="/clientes/*" element={<CustomersList />} />
            
            {/* Novas Rotas de Relatórios */}
            <Route path="/relatorios" element={<ReportsIndex />} />
            <Route path="/relatorios/vendas" element={<SalesReport />} />
            <Route path="/relatorios/caixa" element={<CashRegisterReport />} />
            <Route path="/relatorios/devedores" element={<DebtorsReport />} />
            
            <Route path="/financeiro/*" element={<FinancePage />} />
            <Route path="*" element={<div className="text-slate-500">Página em construção</div>} />
          </Routes>
        </main>
      </div>
  );
}
