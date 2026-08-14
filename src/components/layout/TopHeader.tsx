import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LockKeyhole, LockKeyholeOpen, ShoppingBag, Package, BarChart2, Users, Settings, Bell, Tag, LayoutDashboard } from 'lucide-react';
import { useCashRegister } from '@/contexts/CashRegisterContext';
import { CashRegisterModal } from '@/pages/pos/components/CashRegisterModal';

function NavItem({ icon, label, to, exact = false }: { icon: React.ReactNode, label: string, to: string, exact?: boolean }) {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link to={to} className="focus:outline-none">
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold transition-colors ${
        isActive 
          ? 'bg-brand-50 text-brand-600' 
          : 'text-coffee-500 hover:bg-coffee-50 hover:text-coffee-900'
      }`}>
        {icon}
        <span className="text-sm">{label}</span>
      </div>
    </Link>
  );
}

export function TopHeader() {
  const { isOpen } = useCashRegister();
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  const role = localStorage.getItem('@amocafe:role') || 'admin';
  const userName = localStorage.getItem('@amocafe:user') || 'Felipe';

  return (
    <>
      <header className="bg-white h-[72px] flex justify-between items-center px-6 shrink-0 z-20 relative border-b border-coffee-100">
        
        {/* Esquerda - Logo e Marca */}
        <div className="flex items-center gap-4 min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full border border-brand-200 p-1 flex items-center justify-center bg-brand-50">
              <img src="/logo.png" alt="Amo Café Logo" className="h-full w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-coffee-950 leading-none mb-1">AMO CAFÉ</h1>
              <p className="text-sm text-coffee-400 font-medium leading-none">Gestão</p>
            </div>
          </div>
        </div>
        
        {/* Centro - Navegação */}
        <nav className="hidden lg:flex flex-1 justify-center items-center gap-1 overflow-x-auto mx-4 [&::-webkit-scrollbar]:hidden">
          <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="PDV" to="/pos" />
          {role !== 'pdv' && (
            <>
              <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" to="/admin" exact />
              <NavItem icon={<Package className="w-5 h-5" />} label="Produtos" to="/admin/produtos" />
              <NavItem icon={<Tag className="w-5 h-5" />} label="Categorias" to="/admin/categorias" />
              <NavItem icon={<BarChart2 className="w-5 h-5" />} label="Vendas" to="/admin/vendas" />
              <NavItem icon={<Users className="w-5 h-5" />} label="Clientes" to="/admin/clientes" />
              <NavItem icon={<BarChart2 className="w-5 h-5" />} label="Relatórios" to="/admin/relatorios" />
              <NavItem icon={<Settings className="w-5 h-5" />} label="Configurações" to="/admin/configuracoes" />
            </>
          )}
        </nav>

        {/* Direita - Status e Perfil */}
        <div className="flex items-center gap-6 min-w-[200px] justify-end">
          
          <Button 
            variant="outline" 
            size="sm" 
            className={`gap-2 rounded-full h-9 px-4 font-semibold border-brand-200 text-brand-600 hover:bg-brand-50 hover:text-brand-700`}
            onClick={() => setIsCashModalOpen(true)}
          >
            {isOpen ? <LockKeyholeOpen className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
            Caixa {isOpen ? '01' : 'Fechado'}
          </Button>

          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>
          
          <div className="relative cursor-pointer text-coffee-400 hover:text-coffee-600">
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              2
            </span>
          </div>

          <div className="flex items-center gap-3 border-l border-coffee-100 pl-6 ml-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-coffee-950 leading-tight">{userName.split('@')[0]}</p>
              <p className="text-xs font-medium text-coffee-400">{role === 'pdv' ? 'Caixa' : 'Administrador'}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>

        </div>
      </header>

      <CashRegisterModal isOpen={isCashModalOpen} onClose={() => setIsCashModalOpen(false)} />
    </>
  )
}
