import { useState, useEffect, useRef } from "react"
import { CategoryNav } from "./components/CategoryNav"
import { ProductGrid } from "./components/ProductGrid"
import { CartSidebar } from "./components/CartSidebar"
import { CheckoutModal } from "./components/CheckoutModal"
import { usePOS } from "@/contexts/POSContext"
import { useKeyPress } from "@/hooks/useKeyPress"
import { ShoppingBag, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function POSDashboard() {
  const [activeCategory, setActiveCategory] = useState("")
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { cart, clearCart, total, categories } = usePOS()

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].name);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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
        
        {/* Header com Categorias e Pesquisa */}
        <div className="mb-4 flex flex-row items-center justify-between gap-2 lg:gap-4">
          <div className="flex-1 overflow-hidden">
            <CategoryNav 
              activeCategory={activeCategory} 
              onSelect={setActiveCategory} 
            />
          </div>

          {/* Área de Pesquisa */}
          <div className="flex items-center justify-end h-12 relative shrink-0 pt-2 pb-4">
            {!isSearchOpen ? (
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10 lg:h-12 lg:w-12 text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-full border-brand-200 shadow-sm bg-white"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2.5} />
              </Button>
            ) : (
              <div className="relative w-full sm:w-60 lg:w-72 animate-in slide-in-from-right-5 fade-in duration-200">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-500 w-4 h-4 lg:w-5 lg:h-5" strokeWidth={2.5} />
                <Input 
                  ref={searchInputRef}
                  placeholder="Pesquisar..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 h-10 lg:h-12 text-sm lg:text-base rounded-full border-brand-300 focus-visible:ring-brand-500 bg-white shadow-sm"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-gray-700 rounded-full"
                  onClick={() => {
                    setSearchQuery("");
                    setIsSearchOpen(false);
                  }}
                >
                  <X className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto mt-4 lg:mt-6 pb-24 lg:pb-20">
          <ProductGrid activeCategory={activeCategory} searchQuery={searchQuery} />
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


