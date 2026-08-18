import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/services/supabase/client"
import { Loader2 } from "lucide-react"

interface Product {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productToEdit?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSaved, productToEdit }: ProductModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [active, setActive] = useState(true);
  const [isComboCustom, setIsComboCustom] = useState(false);
  const [isComboItem, setIsComboItem] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      if (productToEdit) {
        setName(productToEdit.name);
        setDescription(productToEdit.description?.replace('[COMBO_CUSTOM]', '').replace('[COMBO_ITEM]', '').trim() || "");
        setPrice(productToEdit.price.toString());
        setImageUrl(productToEdit.image_url || "");
        setCategoryId(productToEdit.category_id || "");
        setActive(productToEdit.active);
        setIsComboCustom(productToEdit.description?.includes('[COMBO_CUSTOM]') || false);
        setIsComboItem(productToEdit.description?.includes('[COMBO_ITEM]') || false);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setCategoryId("");
        setActive(true);
        setIsComboCustom(false);
        setIsComboItem(false);
      }
    }
  }, [isOpen, productToEdit]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('id, name').order('sort_order');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !price || !categoryId) return;

    setLoading(true);
    try {
      let finalDescription = description.trim();
      if (isComboCustom) {
        finalDescription += (finalDescription ? ' ' : '') + '[COMBO_CUSTOM]';
      }
      if (isComboItem) {
        finalDescription += (finalDescription ? ' ' : '') + '[COMBO_ITEM]';
      }

      const payload = {
        name,
        description: finalDescription || null,
        price: parseFloat(price.replace(',', '.')),
        image_url: imageUrl || null,
        category_id: categoryId,
        active
      };

      if (productToEdit) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', productToEdit.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([payload]);
        if (error) throw error;
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert("Erro ao salvar produto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productToEdit ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          
          <div className="grid gap-2">
            <Label htmlFor="name">Nome do Produto *</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Cappuccino" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição</Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Café espresso com leite vaporizado..." />
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Switch id="isCombo" checked={isComboCustom} onCheckedChange={setIsComboCustom} />
            <Label htmlFor="isCombo">Abrir seleção de Bebida e Lanche no PDV</Label>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Switch id="isComboItem" checked={isComboItem} onCheckedChange={setIsComboItem} />
            <Label htmlFor="isComboItem">Permitir que este produto seja escolhido dentro de um Combo</Label>
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Switch id="active" checked={active} onCheckedChange={setActive} />
            <Label htmlFor="active">Produto Ativo (Aparece no PDV)</Label>
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
