import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/services/supabase/client"
import { Loader2 } from "lucide-react"
import { printerService } from "@/services/printerService"
import { useCashRegister } from "@/contexts/CashRegisterContext"

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  customer?: any | null;
}

export function PaymentModal({ isOpen, onClose, onSaved, customer }: PaymentModalProps) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Dinheiro");
  const [loading, setLoading] = useState(false);
  const { addOperation } = useCashRegister();

  useEffect(() => {
    if (isOpen && customer) {
      setAmount(customer.balance.toString());
      setMethod("Dinheiro");
    }
  }, [isOpen, customer]);

  const handleSave = async () => {
    const paymentAmount = parseFloat(amount.replace(',', '.'));
    if (!paymentAmount || isNaN(paymentAmount) || paymentAmount <= 0) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // 1. Inserir registro de pagamento
      const { error: paymentError } = await supabase
        .from('customer_payments')
        .insert([{
          customer_id: customer.id,
          amount: paymentAmount,
          payment_method: method,
          user_id: user?.id
        }]);
      if (paymentError) throw paymentError;

      // 2. Atualizar saldo do cliente (subtrair)
      const newBalance = Number(customer.balance) - paymentAmount;
      const { error: updateError } = await supabase
        .from('customers')
        .update({ balance: newBalance })
        .eq('id', customer.id);
      if (updateError) throw updateError;

      // 3. Registrar no Caixa atual
      if (method === "Dinheiro") {
        await printerService.openCashDrawer();
        addOperation('SUPRIMENTO', paymentAmount, `Recebimento Fiado - ${customer.name}`);
      } else {
        addOperation('SUPRIMENTO', 0, `Recebimento Fiado (${method}) - ${customer.name} - R$ ${paymentAmount.toFixed(2)}`);
      }

      // 4. Imprimir comprovante (opcional, o user disse 'Sim' no plano)
      await printerService.printReceipt({
        orderId: 'PAG-' + Math.floor(Math.random() * 10000),
        items: [{ name: `Abatimento de Dívida`, quantity: 1, subtotal: paymentAmount }],
        subtotal: paymentAmount,
        discount: 0,
        total: paymentAmount,
        paymentMethod: method,
        cashierName: user?.email || "Caixa"
      });

      onSaved();
      onClose();
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      alert("Erro ao processar pagamento.");
    } finally {
      setLoading(false);
    }
  };

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Receber Pagamento</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="bg-slate-50 p-4 rounded-lg border">
            <p className="text-sm text-slate-500">Cliente</p>
            <p className="font-bold text-lg">{customer.name}</p>
            <div className="flex justify-between mt-2 pt-2 border-t">
              <span className="text-sm font-medium">Saldo Devedor:</span>
              <span className="font-bold text-red-600">R$ {Number(customer.balance).toFixed(2).replace('.', ',')}</span>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Valor a Receber (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg font-bold"
            />
          </div>

          <div className="grid gap-2">
            <Label>Forma de Pagamento</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                <SelectItem value="PIX">PIX</SelectItem>
                <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                <SelectItem value="Transferência">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Confirmar Recebimento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
