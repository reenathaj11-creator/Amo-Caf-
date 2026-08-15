import { useState } from "react"
import { CategoryNav } from "./components/CategoryNav"
import { ProductGrid } from "./components/ProductGrid"
import { CartSidebar } from "./components/CartSidebar"
import { CheckoutModal } from "./components/CheckoutModal"
import { usePOS } from "@/contexts/POSContext"
import { useKeyPress } from "@/hooks/useKeyPress"
import { Trash2, Tag, MessageSquare, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"

export function POSDashboard() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
  const { cart, clearCart, total } = usePOS()
  const userName = localStorage.getItem('@amocafe:user') || 'Felipe';

  useKeyPress('F4', () => {
    if (cart.length > 0) {
      setIsCheckoutOpen(true)
    }
  })

  useKeyPress('F5', () => clearCart())

  return (
    <div className="flex flex-col lg:flex-row h-full w-full bg-[#FCFAFA] overflow-hidden relative">
      
      {/* Esquerda: Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 p-4 lg:p-6 lg:pl-8">
        
        {/* Saudação */}
        <div className="mb-4 lg:mb-6 flex items-center text-xl lg:text-3xl text-coffee-900 tracking-tight">
          <span className="text-xl lg:text-2xl mr-2">☕</span>
          Olá, <span className="font-bold text-brand-500 mx-1 lg:mx-2">{userName.split('@')[0]}!</span>
          <span className="hidden sm:inline ml-1">O que vamos servir hoje?</span>
        </div>

        <CategoryNav 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
        
        <div className="flex-1 overflow-auto mt-4 lg:mt-6 pb-24 lg:pb-20">
          <ProductGrid activeCategory={activeCategory} />
        </div>

        {/* Rodapé - Atalhos Rápidos (Desktop) */}
        <div className="hidden lg:flex absolute bottom-6 left-8 gap-4">
          <ShortcutButton icon={<Trash2 className="w-4 h-4" />} label="Limpar Pedido" shortcut="F5" onClick={clearCart} />
          <ShortcutButton icon={<Tag className="w-4 h-4" />} label="Desconto" shortcut="F6" />
          <ShortcutButton icon={<MessageSquare className="w-4 h-4" />} label="Observação" shortcut="F7" />
        </div>
        
        {/* Mobile Cart Floating Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-coffee-100 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.05)] z-30">
          <Button 
            onClick={() => setIsMobileCartOpen(true)}
            className="w-full h-14 bg-[#33845B] hover:bg-[#2A6D4B] text-white rounded-2xl font-bold text-lg flex items-center justify-between px-6 shadow-md"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              <span>{cart.length} itens</span>
            </div>
            <span>R$ {total.toFixed(2).replace('.', ',')}</span>
          </Button>
        </div>

      </div>

      {/* Direita: Carrinho */}
      <CartSidebar 
        isOpen={isMobileCartOpen} 
        onClose={() => setIsMobileCartOpen(false)}
        onCheckout={() => {
          setIsMobileCartOpen(false)
          setIsCheckoutOpen(true)
        }} 
      />

      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
    </div>
  )
}

function ShortcutButton({ icon, label, shortcut, onClick }: { icon: React.ReactNode, label: string, shortcut: string, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 bg-white border border-coffee-100 hover:bg-cream-50 text-coffee-700 px-4 py-2.5 rounded-lg shadow-sm font-semibold transition-colors"
    >
      {icon}
      <span className="text-sm">{label}</span>
      <span className="text-xs text-coffee-400 font-bold ml-1">{shortcut}</span>
    </button>
  );
}
