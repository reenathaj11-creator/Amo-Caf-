import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/services/supabase/client"
import { Loader2 } from "lucide-react"

interface Category {
  id: string;
  name: string;
  icon: string | null;
  sort_order: number;
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categoryToEdit?: Category | null;
}

export function CategoryModal({ isOpen, onClose, onSaved, categoryToEdit }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (categoryToEdit) {
        setName(categoryToEdit.name);
        setIcon(categoryToEdit.icon || "");
        setSortOrder(categoryToEdit.sort_order || 0);
      } else {
        setName("");
        setIcon("");
        setSortOrder(0);
      }
    }
  }, [isOpen, categoryToEdit]);

  const handleSave = async () => {
    if (!name.trim()) return;

    setLoading(true);
    try {
      const payload = {
        name,
        icon: icon || null,
        sort_order: sortOrder
      };

      if (categoryToEdit) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', categoryToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([payload]);
        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      alert("Erro ao salvar categoria.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{categoryToEdit ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Bebidas Quentes"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="icon">Ícone (Nome do Lucide Icon)</Label>
            <Input
              id="icon"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Ex: Coffee, CupSoda, Sandwich"
            />
            <p className="text-xs text-slate-500">
              Ícones disponíveis: Coffee, CupSoda, Sandwich, CakeSlice, Gift
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sortOrder">Ordem de Exibição</Label>
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-brand-500 hover:bg-brand-600 text-white">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
