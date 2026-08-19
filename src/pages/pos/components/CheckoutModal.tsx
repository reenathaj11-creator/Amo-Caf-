import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Banknote, CreditCard, QrCode, ArrowRight, LockKeyhole, Check, BookUser } from "lucide-react"
import { useKeyPress } from "@/hooks/useKeyPress"
import { printerService } from "@/services/printerService"
import { usePOS } from "@/contexts/POSContext"
import { useCashRegister } from "@/contexts/CashRegisterContext"
import { supabase } from "@/services/supabase/client"

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type PaymentMethod = "Dinheiro" | "Cartão de Crédito" | "Cartão de Débito" | "PIX" | "Na Conta";

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, subtotal, discount, total, clearCart, isToGo } = usePOS();
  const { isOpen: isRegisterOpen, addOperation } = useCashRegister();
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMethod(null);
      setCashReceived("");
      setCustomerId("");
      setIsSuccess(false);
      setLastOrderDetails(null);
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    const { data } = await supabase.from('customers').select('id, name, balance').eq('active', true).order('name');
    if (data) setCustomers(data);
  };

  useEffect(() => {
    if (method === "Dinheiro" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [method]);

  useKeyPress('Escape', () => {
    if (isOpen && !isProcessing && !isSuccess) {
      if (method) setMethod(null);
      else onClose();
    } else if (isOpen && isSuccess) {
      onClose();
    }
  });

  const numericCash = parseFloat(cashReceived.replace(',', '.'));
  const change = numericCash > total ? numericCash - total : 0;
  
  const isCashValid = method !== "Dinheiro" || (!isNaN(numericCash) && numericCash >= total);
  const isAccountValid = method !== "Na Conta" || customerId !== "";
  const canProceed = isCashValid && isAccountValid;

  const handleCheckout = async () => {
    if (!method || !canProceed || !isRegisterOpen) return;
    
    setIsProcessing(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        user_id: user?.id,
        total_amount: total,
        payment_method: method,
        customer_id: method === "Na Conta" ? customerId : null,
        status: 'completed'
      }).select().single();

      if (saleError) throw saleError;

      const orderId = saleData.id;

      const itemsToInsert = cart.map(c => ({
        sale_id: orderId,
        product_id: c.product.id,
        quantity: c.quantity,
        unit_price: c.product.price,
        total_price: c.subtotal
      }));

      const { error: itemsError } = await supabase.from('sale_items').insert(itemsToInsert);
      if (itemsError) throw itemsError;

      if (method === "Na Conta" && customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          const newBalance = Number(customer.balance) + total;
          await supabase.from('customers').update({ balance: newBalance }).eq('id', customerId);
        }
      }

      if (method === "Dinheiro") {
        await printerService.openCashDrawer();
        addOperation('VENDA', total, `Venda em Dinheiro`);
      } else {
        addOperation('VENDA', 0, `Venda em ${method} (R$ ${total.toFixed(2)})`);
      }

      const printParams = {
        orderId: orderId.split('-')[0], 
        items: cart.map(c => ({ name: c.product.name, quantity: c.quantity, subtotal: c.subtotal, modifiers: c.modifiers })),
        subtotal,
        discount,
        total,
        paymentMethod: method,
        cashReceived: method === "Dinheiro" ? numericCash : undefined,
        change: method === "Dinheiro" ? change : undefined,
        cashierName: user?.email?.split('@')[0] || "Caixa",
        isToGo: isToGo
      };

      await printerService.printReceipt(printParams);

      clearCart();
      setLastOrderDetails(printParams);
      setIsSuccess(true);
    } catch (error) {
      console.error("Erro ao salvar no banco:", error);
      alert("Erro ao finalizar venda no banco de dados.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-cream-50 p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        {!isSuccess && (
          <DialogHeader className="p-6 pb-4 bg-white border-b border-coffee-100">
            <DialogTitle className="text-2xl font-bold text-coffee-950">Finalizar Venda</DialogTitle>
            <div className="text-4xl font-black text-coffee-900 mt-2">
              R$ {total.toFixed(2).replace('.', ',')}
            </div>
          </DialogHeader>
        )}

        <div className={isSuccess ? "p-0" : "p-6"}>
          {isSuccess && lastOrderDetails ? (
            <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Check className="w-12 h-12 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-bold text-coffee-950 mb-2">Venda Concluída!</h3>
              <p className="text-coffee-500 font-medium text-lg">Pedido #{lastOrderDetails.orderId}</p>
              <p className="text-4xl font-black text-coffee-900 mt-4">R$ {lastOrderDetails.total.toFixed(2).replace('.', ',')}</p>
              
              <div className="flex gap-4 mt-10 w-full">
                <Button variant="outline" className="flex-1 h-14 text-lg border-coffee-200 text-coffee-700 hover:bg-coffee-50" onClick={() => printerService.printReceipt(lastOrderDetails)}>
                  Imprimir Novamente
                </Button>
                <Button className="flex-1 h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg" onClick={onClose}>
                  Nova Venda
                </Button>
              </div>
            </div>
          ) : !isRegisterOpen ? (
            <div className="text-center py-8 space-y-4">
              <LockKeyhole className="w-16 h-16 mx-auto text-red-400" />
              <h3 className="text-xl font-bold text-coffee-900">Caixa Fechado</h3>
              <p className="text-coffee-500">Você precisa abrir o caixa antes de realizar vendas.</p>
              <Button onClick={onClose} variant="outline" className="mt-4 border-coffee-200 text-coffee-700">Voltar</Button>
            </div>
          ) : !method ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <PaymentButton icon={<Banknote className="w-8 h-8 mb-2" />} label="Dinheiro" onClick={() => setMethod("Dinheiro")} />
              <PaymentButton icon={<QrCode className="w-8 h-8 mb-2" />} label="PIX" onClick={() => setMethod("PIX")} />
              <PaymentButton icon={<CreditCard className="w-8 h-8 mb-2" />} label="Débito" onClick={() => setMethod("Cartão de Débito")} />
              <PaymentButton icon={<CreditCard className="w-8 h-8 mb-2" />} label="Crédito" onClick={() => setMethod("Cartão de Crédito")} />
              <PaymentButton icon={<BookUser className="w-8 h-8 mb-2 text-brand-600" />} label="Na Conta" onClick={() => setMethod("Na Conta")} />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-coffee-900">
                  <Button variant="ghost" size="sm" className="px-2 text-coffee-500 hover:text-coffee-900" onClick={() => setMethod(null)}>
                    Voltar
                  </Button>
                  Método: <span className="text-coffee-600">{method}</span>
                </h3>
              </div>

              {method === "Dinheiro" && (
                <div className="space-y-4 bg-white p-6 rounded-xl border border-coffee-100 shadow-sm">
                  <div>
                    <label className="text-sm font-semibold text-coffee-700 mb-2 block">Valor Recebido (R$)</label>
                    <Input 
                      ref={inputRef}
                      type="number" 
                      min={total}
                      step="0.01"
                      className="text-2xl h-14 font-bold" 
                      placeholder="0,00"
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && canProceed && handleCheckout()}
                    />
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-coffee-100 mt-4">
                    <span className="text-lg font-medium text-coffee-600">Troco:</span>
                    <span className="text-3xl font-black text-coffee-900">
                      R$ {change.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}

              {method === "Na Conta" && (
                <div className="space-y-4 bg-white p-6 rounded-xl border border-coffee-100 shadow-sm">
                  <div>
                    <label className="text-sm font-semibold text-coffee-700 mb-2 block">Selecione o Cliente</label>
                    <Select value={customerId} onValueChange={setCustomerId}>
                      <SelectTrigger className="h-14 text-lg">
                        <SelectValue placeholder="Buscar cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.length === 0 ? (
                           <div className="p-4 text-sm text-slate-500">Nenhum cliente ativo. Cadastre no Painel.</div>
                        ) : (
                          customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.name} (Devendo: R$ {Number(c.balance).toFixed(2).replace('.', ',')})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    O valor da compra será adicionado ao saldo devedor deste cliente.
                  </p>
                </div>
              )}

              <Button 
                className="w-full h-16 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 shadow-lg rounded-xl" 
                disabled={!canProceed || isProcessing}
                onClick={handleCheckout}
              >
                {isProcessing ? "Processando..." : (
                  <>
                    Confirmar Pagamento
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function PaymentButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      className="h-28 flex flex-col items-center justify-center hover:bg-coffee-50 hover:border-coffee-400 hover:text-coffee-800 transition-all bg-white shadow-sm border-coffee-100 rounded-xl text-coffee-700"
      onClick={onClick}
    >
      {icon}
      <span className="font-semibold text-base">{label}</span>
    </Button>
  )
}
