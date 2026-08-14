import { useState } from "react"
import { CategoryNav } from "./components/CategoryNav"
import { ProductGrid } from "./components/ProductGrid"
import { CartSidebar } from "./components/CartSidebar"
import { CheckoutModal } from "./components/CheckoutModal"
import { usePOS } from "@/contexts/POSContext"
import { useKeyPress } from "@/hooks/useKeyPress"
import { Trash2, Tag, MessageSquare } from "lucide-react"

export function POSDashboard() {
  const [activeCategory, setActiveCategory] = useState("Todos")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { cart, clearCart } = usePOS()
  const userName = localStorage.getItem('@amocafe:user') || 'Felipe';

  useKeyPress('F4', () => {
    if (cart.length > 0) {
      setIsCheckoutOpen(true)
    }
  })

  useKeyPress('F5', () => clearCart())

  return (
    <div className="flex h-full w-full bg-[#FCFAFA] overflow-hidden relative">
      
      {/* Esquerda: Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-w-0 p-6 pl-8">
        
        {/* Saudação */}
        <div className="mb-6 flex items-center text-3xl text-coffee-900 tracking-tight">
          <span className="text-2xl mr-2">☕</span>
          Olá, <span className="font-bold text-brand-500 mx-2">{userName.split('@')[0]}!</span> O que vamos servir hoje?
        </div>

        <CategoryNav 
          activeCategory={activeCategory} 
          onSelect={setActiveCategory} 
        />
        
        <div className="flex-1 overflow-auto mt-6 pb-20">
          <ProductGrid activeCategory={activeCategory} />
        </div>

        {/* Rodapé - Atalhos Rápidos */}
        <div className="absolute bottom-6 left-8 flex gap-4">
          <ShortcutButton icon={<Trash2 className="w-4 h-4" />} label="Limpar Pedido" shortcut="F5" onClick={clearCart} />
          <ShortcutButton icon={<Tag className="w-4 h-4" />} label="Desconto" shortcut="F6" />
          <ShortcutButton icon={<MessageSquare className="w-4 h-4" />} label="Observação" shortcut="F7" />
        </div>

      </div>

      {/* Direita: Carrinho */}
      <CartSidebar onCheckout={() => setIsCheckoutOpen(true)} />

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
