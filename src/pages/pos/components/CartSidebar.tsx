import { useState } from "react"
import { usePOS } from "@/contexts/POSContext"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Trash2, Plus, Minus, CreditCard, X, ShoppingBag, Printer, Loader2, Unlock } from "lucide-react"
import { useKeyPress } from "@/hooks/useKeyPress"
import { printerService } from "@/services/printerService"

import { cn } from "@/lib/utils"

interface CartSidebarProps {
  onCheckout?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CartSidebar({ onCheckout, isOpen, onClose }: CartSidebarProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, total, discount, isToGo, setIsToGo } = usePOS();
  const [isPrintingPreview, setIsPrintingPreview] = useState(false);

  useKeyPress('Escape', () => {
    if (cart.length > 0) clearCart();
  });

  const handlePrintPreview = async () => {
    if (cart.length === 0) return;
    setIsPrintingPreview(true);
    try {
      const itemsForPrinter = cart.map(c => ({
        name: c.product.name,
        quantity: c.quantity,
        price: c.product.price,
        subtotal: c.subtotal,
        modifiers: c.modifiers
      }));
      
      const userName = localStorage.getItem('@amocafe:user') || 'Caixa';
      const cashierName = userName.split('@')[0];

      await printerService.printReceipt({
        orderId: "PREVIA", // dummy order ID
        items: itemsForPrinter,
        subtotal: subtotal,
        discount: discount,
        total: total,
        paymentMethod: "NAO PAGO",
        cashierName: cashierName,
        isToGo: isToGo,
        isPreCheckout: true // Flag to tell the printer server it's just a preview
      });
      // Optionally notify user here
    } catch (error) {
      console.error("Erro ao imprimir prévia:", error);
      alert("Erro ao enviar para impressora.");
    } finally {
      setIsPrintingPreview(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "bg-white flex flex-col shadow-sm overflow-hidden z-50 shrink-0",
        // Desktop styles
        "lg:static lg:w-[400px] lg:border lg:border-coffee-100 lg:rounded-3xl lg:my-6 lg:mr-6 lg:h-[calc(100%-48px)] lg:transform-none lg:transition-none",
        // Mobile styles
        "fixed inset-y-0 right-0 w-full sm:w-[400px] transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
      )}>
        <div className="p-4 lg:p-6 bg-white flex items-center justify-between border-b lg:border-none border-coffee-100">
          <div className="flex items-center gap-3">
            {/* Mobile close button */}
            <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden text-coffee-400 hover:text-coffee-600 -ml-2">
              <X className="w-5 h-5" />
            </Button>
            <h2 className="font-bold text-lg lg:text-xl flex items-center gap-2 lg:gap-3 text-coffee-950">
              <ShoppingBag className="w-4 h-4 lg:w-5 lg:h-5 text-brand-500" />
              Pedido Atual
            </h2>
          </div>
        <span className="bg-brand-50 text-brand-600 text-xs py-1 px-3 rounded-full font-bold">
          {cart.length} {cart.length === 1 ? 'item' : 'itens'}
        </span>
        {cart.length > 0 && (
          <Button variant="ghost" size="icon" onClick={clearCart} className="text-coffee-300 hover:text-brand-600 hover:bg-brand-50 rounded-full h-8 w-8 ml-2">
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <EmptyBagIllustration />
            <h3 className="text-xl font-bold text-coffee-950 mt-6">O carrinho está vazio</h3>
            <p className="text-coffee-400 font-medium max-w-[200px] text-sm leading-relaxed">
              Adicione produtos para iniciar o pedido
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="flex flex-col gap-2 p-4 bg-white border border-coffee-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm text-coffee-950 leading-tight pr-4">
                    {item.product.name}
                    {item.modifiers && item.modifiers.length > 0 && (
                      <div className="flex flex-col mt-1 space-y-0.5">
                        {item.modifiers.map((mod: string, i: number) => (
                          <span key={i} className="text-xs text-brand-600 font-medium">
                            + {mod}
                          </span>
                        ))}
                      </div>
                    )}
                  </span>
                  <span className="font-bold text-sm text-coffee-900 whitespace-nowrap">
                    R$ {item.subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-3 bg-cream-50 rounded-lg p-1 border border-cream-200">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-md bg-white shadow-sm hover:bg-cream-100 text-coffee-600"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="text-sm font-bold w-4 text-center text-coffee-900">
                      {item.quantity}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 rounded-md bg-white shadow-sm hover:bg-cream-100 text-coffee-600"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-coffee-300 hover:text-red-500 hover:bg-red-50"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="p-6 bg-cream-50 mt-auto">
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-coffee-600 text-sm font-semibold">
            <span>Subtotal</span>
            <span className="text-coffee-900">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between text-coffee-600 text-sm font-semibold">
            <span>Desconto</span>
            <span className="text-coffee-900">R$ 0,00</span>
          </div>
        </div>
        
        <div className="border-t border-dashed border-coffee-200 w-full mb-4" />
        
        <div className="flex items-center justify-between font-black text-2xl text-coffee-950 mb-4">
          <span>Total</span>
          <span className="text-brand-500 text-3xl tracking-tight">R$ {total.toFixed(2).replace('.', ',')}</span>
        </div>

        <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-coffee-100 mb-4 shadow-sm">
          <Label htmlFor="to-go-switch" className="flex flex-col gap-1 cursor-pointer">
            <span className="font-bold text-coffee-950">Pedido Para Levar</span>
            <span className="text-xs text-coffee-500">Embalar para viagem</span>
          </Label>
          <Switch 
            id="to-go-switch" 
            checked={isToGo} 
            onCheckedChange={setIsToGo}
            className="data-[state=checked]:bg-brand-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Button 
              variant="outline"
              className="w-1/2 h-12 font-bold border-coffee-200 text-coffee-700 hover:bg-coffee-50 rounded-xl"
              disabled={cart.length === 0 || isPrintingPreview}
              onClick={handlePrintPreview}
            >
              {isPrintingPreview ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Printer className="w-5 h-5 mr-2" />
              )}
              Imprimir
            </Button>

            <Button 
              variant="outline"
              className="w-1/2 h-12 font-bold border-coffee-200 text-coffee-700 hover:bg-coffee-50 rounded-xl"
              onClick={() => printerService.openCashDrawer()}
            >
              <Unlock className="w-5 h-5 mr-2" />
              Abrir Gaveta
            </Button>
          </div>

          <Button 
            className="w-full h-16 text-xl font-bold bg-[#33845B] hover:bg-[#2A6D4B] text-white rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
            disabled={cart.length === 0}
            onClick={onCheckout}
          >
            <CreditCard className="w-6 h-6 mr-2" />
            Cobrar (F4)
          </Button>
        </div>
      </div>
    </aside>
    </>
  )
}

function EmptyBagIllustration() {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      {/* Sparkles laterais */}
      <svg className="absolute -left-2 top-8 w-6 h-6 text-brand-200" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
      </svg>
      <svg className="absolute right-2 top-2 w-8 h-8 text-brand-200" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
      </svg>
      <svg className="absolute -right-4 bottom-12 w-4 h-4 text-brand-200" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L13.5 10.5L22 12L13.5 13.5L12 22L10.5 13.5L2 12L10.5 10.5L12 2Z" />
      </svg>
      
      {/* Bag Icon */}
      <svg width="100" height="110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-300">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      {/* Coração na bolsa */}
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-brand-300 absolute mt-4">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </div>
  )
}
