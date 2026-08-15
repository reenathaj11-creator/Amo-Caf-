import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase/client';
import { TrendingDown, TrendingUp } from 'lucide-react';

const EXPENSE_CATEGORIES = ['Aluguel', 'Salários', 'Insumos', 'Impostos', 'Manutenção', 'Outros'];
const INCOME_CATEGORIES = ['Encomenda', 'Evento', 'Gorjeta', 'Aporte (Capital)', 'Outros'];
const PAYMENT_METHODS = ['Dinheiro', 'PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Transferência'];

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Garantir que a categoria selecionada seja válida ao trocar de tipo
  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date || !paymentMethod) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('transactions').insert([{
        description,
        amount: parseFloat(amount),
        type,
        category,
        payment_method: paymentMethod,
        date
      }]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Reset form
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setPaymentMethod(PAYMENT_METHODS[0]);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Erro ao salvar transação:', error);
      alert('Erro ao salvar transação. Verifique se você tem permissão (Administrador).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] rounded-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 bg-brand-50 border-b border-brand-100">
          <DialogTitle className="text-xl font-bold text-coffee-900">Novo Lançamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Seletor de Tipo (Receita/Despesa) */}
          <div className="flex bg-coffee-50 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-coffee-500 hover:text-coffee-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Receita
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                type === 'expense' ? 'bg-white text-red-600 shadow-sm' : 'text-coffee-500 hover:text-coffee-700'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Despesa
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-coffee-700">Descrição</label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Pagamento de Fornecedor"
              required
              className="rounded-xl border-coffee-200 focus-visible:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee-700">Valor (R$)</label>
              <Input 
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
                className="rounded-xl border-coffee-200 focus-visible:ring-brand-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee-700">Data</label>
              <Input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="rounded-xl border-coffee-200 focus-visible:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee-700">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-10 px-3 py-2 rounded-xl border border-coffee-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {currentCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-coffee-700">Forma de Pagto</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="w-full h-10 px-3 py-2 rounded-xl border border-coffee-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {PAYMENT_METHODS.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="rounded-xl border-coffee-200 text-coffee-600 hover:bg-coffee-50"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className={`rounded-xl font-bold text-white ${type === 'income' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {loading ? 'Salvando...' : 'Salvar Lançamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
