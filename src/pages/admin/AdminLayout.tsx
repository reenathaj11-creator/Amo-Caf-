import { Routes, Route } from 'react-router-dom';

import { TopHeader } from '@/components/layout/TopHeader';
import { Dashboard } from './Dashboard';
import { ProductsList } from './products/ProductsList';
import { CategoriesList } from './categories/CategoriesList';
import { SalesList } from './sales/SalesList';
import { CustomersList } from './customers/CustomersList';
import { ReportsPage } from './reports/ReportsPage';
import { FinancePage } from './finance/FinancePage';

export function AdminLayout() {
  return (
      <div className="flex flex-col h-screen bg-[#FCFAFA] font-sans">
        <TopHeader />

        <main className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/produtos/*" element={<ProductsList />} />
            <Route path="/categorias/*" element={<CategoriesList />} />
            <Route path="/vendas" element={<SalesList />} />
            <Route path="/clientes/*" element={<CustomersList />} />
            <Route path="/relatorios" element={<ReportsPage />} />
            <Route path="/financeiro/*" element={<FinancePage />} />
            <Route path="*" element={<div className="text-slate-500">Página em construção</div>} />
          </Routes>
        </main>
      </div>
  );
}
