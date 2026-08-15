import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/services/supabase/client';

const EXPENSE_CATEGORIES = [
  'Aluguel',
  'Salários',
  'Insumos',
  'Impostos',
  'Manutenção',
  'Outros'
];

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) return;

    try {
      setLoading(true);
      const { error } = await supabase.from('expenses').insert([{
        description,
        amount: parseFloat(amount),
        category,
        date
      }]);

      if (error) throw error;

      onSuccess();
      onClose();
      // Reset form
      setDescription('');
      setAmount('');
      setCategory(EXPENSE_CATEGORIES[0]);
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      alert('Erro ao salvar despesa. Verifique se você tem permissão (Administrador).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl p-0 overflow-hidden bg-white">
        <DialogHeader className="px-6 py-4 bg-brand-50 border-b border-brand-100">
          <DialogTitle className="text-xl font-bold text-coffee-900">Nova Despesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-coffee-700">Descrição</label>
            <Input 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Compra de pó de café"
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

          <div className="space-y-2">
            <label className="text-sm font-semibold text-coffee-700">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full h-10 px-3 py-2 rounded-xl border border-coffee-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {EXPENSE_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
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
              className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold"
            >
              {loading ? 'Salvando...' : 'Salvar Despesa'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
