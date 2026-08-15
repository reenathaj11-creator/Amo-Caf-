import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LockKeyhole, LockKeyholeOpen, ShoppingBag, Package, BarChart2, Users, Settings, Tag, LayoutDashboard, Menu, X, LogOut, ChevronDown, CircleDollarSign } from 'lucide-react';
import { useCashRegister } from '@/contexts/CashRegisterContext';
import { CashRegisterModal } from '@/pages/pos/components/CashRegisterModal';
import { supabase } from '@/services/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function NavItem({ icon, label, to, exact = false, onClick }: { icon: React.ReactNode, label: string, to: string, exact?: boolean, onClick?: () => void }) {
  const location = useLocation();
  const isActive = exact 
    ? location.pathname === to 
    : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link to={to} className="focus:outline-none" onClick={onClick}>
      <div className={`flex items-center gap-3 px-4 py-3 lg:py-2.5 rounded-xl lg:rounded-full font-semibold transition-colors ${
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const role = localStorage.getItem('@amocafe:role') || 'admin';
  const userName = localStorage.getItem('@amocafe:user') || 'Felipe';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('@amocafe:role');
    localStorage.removeItem('@amocafe:user');
    navigate('/login');
  };

  const NavigationItems = () => (
    <>
      <NavItem icon={<ShoppingBag className="w-5 h-5" />} label="PDV" to="/pos" onClick={() => setIsMobileMenuOpen(false)} />
      {role !== 'pdv' && (
        <>
          <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard" to="/admin" exact onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<Package className="w-5 h-5" />} label="Produtos" to="/admin/produtos" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<Tag className="w-5 h-5" />} label="Categorias" to="/admin/categorias" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<BarChart2 className="w-5 h-5" />} label="Vendas" to="/admin/vendas" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<Users className="w-5 h-5" />} label="Clientes" to="/admin/clientes" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<BarChart2 className="w-5 h-5" />} label="Relatórios" to="/admin/relatorios" onClick={() => setIsMobileMenuOpen(false)} />
          <NavItem icon={<CircleDollarSign className="w-5 h-5" />} label="Financeiro" to="/admin/financeiro" onClick={() => setIsMobileMenuOpen(false)} />
        </>
      )}
    </>
  );

  return (
    <>
      <header className="bg-white h-[72px] flex justify-between items-center px-4 sm:px-6 shrink-0 z-50 relative border-b border-coffee-100 shadow-sm print:hidden">
        
        {/* Esquerda - Mobile Menu Toggle & Logo */}
        <div className="flex items-center gap-3 min-w-[150px] sm:min-w-[200px]">
          <button 
            className="lg:hidden p-2 -ml-2 text-coffee-600 hover:bg-coffee-50 rounded-lg"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border border-brand-200 p-1 flex items-center justify-center bg-brand-50 shrink-0">
              <img src="/logo.png" alt="Amo Café Logo" className="h-full w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold tracking-tight text-coffee-950 leading-none mb-1">AMO CAFÉ</h1>
              <p className="text-sm text-coffee-400 font-medium leading-none">Gestão</p>
            </div>
          </div>
        </div>
        
        {/* Centro - Navegação Desktop (Corrigido flex para evitar corte) */}
        <nav className="hidden lg:flex flex-1 items-center overflow-x-auto mx-4 [&::-webkit-scrollbar]:hidden">
          <div className="flex mx-auto gap-1 w-max">
            <NavigationItems />
          </div>
        </nav>

        {/* Direita - Status e Perfil */}
        <div className="flex items-center gap-3 sm:gap-6 min-w-fit justify-end">
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 rounded-full h-9 px-3 sm:px-4 font-semibold border-brand-200 text-brand-600 hover:bg-brand-50 hover:text-brand-700 hidden sm:flex"
            onClick={() => setIsCashModalOpen(true)}
          >
            {isOpen ? <LockKeyholeOpen className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
            Caixa {isOpen ? '01' : 'Fechado'}
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-full h-9 w-9 p-0 border-brand-200 text-brand-600 hover:bg-brand-50 sm:hidden"
            onClick={() => setIsCashModalOpen(true)}
          >
            {isOpen ? <LockKeyholeOpen className="w-4 h-4" /> : <LockKeyhole className="w-4 h-4" />}
          </Button>

          <div className="hidden md:flex items-center gap-2 text-sm font-semibold text-emerald-600 mr-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            Online
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 sm:gap-3 border-l border-coffee-100 pl-3 sm:pl-6 ml-1 sm:ml-2 cursor-pointer hover:bg-coffee-50 p-1.5 rounded-full sm:rounded-xl transition-colors">
                <div className="text-right hidden xl:block">
                  <p className="text-sm font-bold text-coffee-950 leading-tight">{userName.split('@')[0]}</p>
                  <p className="text-xs font-medium text-coffee-400">{role === 'pdv' ? 'Caixa' : 'Administrador'}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-brand-500 text-white flex items-center justify-center font-bold text-base sm:text-lg shadow-sm shrink-0">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <ChevronDown className="w-4 h-4 text-coffee-400 hidden xl:block" />
                </div>
              </div>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-coffee-100 shadow-xl p-2 bg-white">
              <DropdownMenuLabel className="font-bold text-coffee-950">Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-coffee-100" />
              
              {role !== 'pdv' && (
                <DropdownMenuItem 
                  className="gap-2 cursor-pointer rounded-lg text-coffee-700 focus:bg-brand-50 focus:text-brand-700 py-2.5"
                  onClick={() => navigate('/admin/configuracoes')}
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuItem 
                className="gap-2 cursor-pointer rounded-lg text-red-600 focus:bg-red-50 focus:text-red-700 py-2.5 mt-1"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Sair do Sistema</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </header>

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-coffee-100 shadow-xl z-40 animate-in slide-in-from-top-2">
          <nav className="flex flex-col p-4 gap-1 max-h-[calc(100vh-72px)] overflow-y-auto">
            <NavigationItems />
          </nav>
        </div>
      )}

      <CashRegisterModal isOpen={isCashModalOpen} onClose={() => setIsCashModalOpen(false)} />
    </>
  )
}
