import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCashRegister } from "@/contexts/CashRegisterContext"
import { Lock, Unlock, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { printerService } from "@/services/printerService"

interface CashRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'MENU' | 'ABERTURA' | 'FECHAMENTO' | 'SANGRIA' | 'SUPRIMENTO';

export function CashRegisterModal({ isOpen, onClose }: CashRegisterModalProps) {
  const { isOpen: isRegisterOpen, currentBalance, openRegister, closeRegister, addOperation, operations } = useCashRegister();
  const [activeTab, setActiveTab] = useState<Tab>('MENU');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Reseta ao abrir/fechar o modal
  if (!isOpen && activeTab !== 'MENU') {
    setActiveTab('MENU');
    setAmount('');
    setDescription('');
  }

  const handleAction = async () => {
    const numericAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numericAmount) || numericAmount < 0) return;

    if (activeTab === 'ABERTURA') {
      openRegister(numericAmount);
    } else if (activeTab === 'FECHAMENTO') {
      let startIndex = -1;
      for (let i = operations.length - 1; i >= 0; i--) {
         if (operations[i].type === 'ABERTURA') {
            startIndex = i;
            break;
         }
      }
      
      const currentShiftOps = startIndex >= 0 ? operations.slice(startIndex) : operations;
      
      let dinheiro = 0;
      let pix = 0;
      let cartoes = 0;
      let naConta = 0;
      let abertura = 0;
      let suprimentos = 0;
      let sangrias = 0;

      currentShiftOps.forEach(op => {
         if (op.type === 'ABERTURA') abertura += op.amount;
         else if (op.type === 'SUPRIMENTO') suprimentos += op.amount;
         else if (op.type === 'SANGRIA') sangrias += op.amount;
         else if (op.type === 'VENDA') {
            if (op.description === 'Venda em Dinheiro') {
               dinheiro += op.amount;
            } else if (op.description?.includes('Venda em PIX')) {
               const match = op.description.match(/R\$ ([\d.]+)/);
               if (match) pix += parseFloat(match[1]);
            } else if (op.description?.includes('Venda em Cartão')) {
               const match = op.description.match(/R\$ ([\d.]+)/);
               if (match) cartoes += parseFloat(match[1]);
            } else if (op.description?.includes('Venda em Na Conta')) {
               const match = op.description.match(/R\$ ([\d.]+)/);
               if (match) naConta += parseFloat(match[1]);
            }
         }
      });

      const totalVendas = dinheiro + pix + cartoes + naConta;
      const saldoEsperado = abertura + dinheiro + suprimentos - sangrias;

      await printerService.printClosingReport({
         cashierName: localStorage.getItem('@amocafe:user') || 'Caixa',
         dinheiro, pix, cartoes, naConta, totalVendas,
         abertura, suprimentos, sangrias,
         saldoEsperado, 
         saldoInformado: numericAmount
      });

      closeRegister(numericAmount);
    } else if (activeTab === 'SANGRIA') {
      addOperation('SANGRIA', numericAmount, description);
    } else if (activeTab === 'SUPRIMENTO') {
      addOperation('SUPRIMENTO', numericAmount, description);
    }

    setAmount('');
    setDescription('');
    setActiveTab('MENU');
    if (activeTab === 'FECHAMENTO') onClose(); // Fecha modal se fechou o caixa
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Controle de Caixa</DialogTitle>
        </DialogHeader>

        {activeTab === 'MENU' ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            {!isRegisterOpen ? (
              <Button 
                className="h-24 flex flex-col gap-2 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => setActiveTab('ABERTURA')}
              >
                <Unlock className="w-6 h-6" />
                Abrir Caixa
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-red-200 hover:bg-red-50 text-red-600"
                  onClick={() => setActiveTab('SANGRIA')}
                >
                  <ArrowUpFromLine className="w-6 h-6" />
                  Sangria (Retirada)
                </Button>
                <Button 
                  variant="outline"
                  className="h-24 flex flex-col gap-2 border-emerald-200 hover:bg-emerald-50 text-emerald-600"
                  onClick={() => setActiveTab('SUPRIMENTO')}
                >
                  <ArrowDownToLine className="w-6 h-6" />
                  Suprimento (Entrada)
                </Button>
                <Button 
                  variant="outline"
                  className="h-24 flex flex-col gap-2 col-span-2 bg-slate-900 text-white hover:bg-slate-800"
                  onClick={() => setActiveTab('FECHAMENTO')}
                >
                  <Lock className="w-6 h-6" />
                  Fechar Caixa
                </Button>
                <div className="col-span-2 p-4 bg-slate-100 rounded-lg text-center mt-2">
                  <p className="text-sm text-slate-500">Saldo Atual em Dinheiro</p>
                  <p className="text-3xl font-bold text-slate-800">
                    R$ {currentBalance.toFixed(2).replace('.', ',')}
                  </p>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4 py-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{activeTab} DE CAIXA</h3>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('MENU')}>Voltar</Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Valor (R$)</label>
              <Input 
                type="number" 
                step="0.01" 
                className="text-xl h-12"
                placeholder="0,00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            {(activeTab === 'SANGRIA' || activeTab === 'SUPRIMENTO') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo / Descrição</label>
                <Input 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Pagamento de fornecedor"
                />
              </div>
            )}

            <Button 
              className="w-full h-12 text-lg mt-4" 
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Confirmar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
