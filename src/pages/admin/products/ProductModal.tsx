import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/services/supabase/client"
import { Loader2, Plus, Trash2 } from "lucide-react"

interface Product {
  id: string;
  category_id: string | null;
  subcategory_id?: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  active: boolean;
  options?: { name: string; choices: string[] }[] | null;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  productToEdit?: Product | null;
}

export function ProductModal({ isOpen, onClose, onSaved, productToEdit }: ProductModalProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState<string>("none");
  const [active, setActive] = useState(true);
  const [isComboCustom, setIsComboCustom] = useState(false);
  const [isComboItem, setIsComboItem] = useState(false);
  const [options, setOptions] = useState<{ name: string; choices: string[] }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategoriesAndSubcategories();
      if (productToEdit) {
        setName(productToEdit.name);
        setDescription(productToEdit.description?.replace('[COMBO_CUSTOM]', '').replace('[COMBO_ITEM]', '').trim() || "");
        setPrice(productToEdit.price.toString());
        setImageUrl(productToEdit.image_url || "");
        setCategoryId(productToEdit.category_id || "");
        setSubcategoryId(productToEdit.subcategory_id || "none");
        setActive(productToEdit.active);
        setIsComboCustom(productToEdit.description?.includes('[COMBO_CUSTOM]') || false);
        setIsComboItem(productToEdit.description?.includes('[COMBO_ITEM]') || false);
        setOptions(productToEdit.options || []);
      } else {
        setName("");
        setDescription("");
        setPrice("");
        setImageUrl("");
        setCategoryId("");
        setSubcategoryId("none");
        setActive(true);
        setIsComboCustom(false);
        setIsComboItem(false);
        setOptions([]);
      }
    }
  }, [isOpen, productToEdit]);

  // When category changes, reset subcategory if it doesn't belong to new category
  useEffect(() => {
    if (subcategoryId !== "none") {
      const sub = subcategories.find(s => s.id === subcategoryId);
      if (sub && sub.category_id !== categoryId) {
        setSubcategoryId("none");
      }
    }
  }, [categoryId, subcategories, subcategoryId]);

  const fetchCategoriesAndSubcategories = async () => {
    try {
      const [catsRes, subsRes] = await Promise.all([
        supabase.from('categories').select('id, name').order('sort_order'),
        supabase.from('subcategories').select('id, name, category_id').order('name')
      ]);
      
      if (catsRes.error) throw catsRes.error;
      if (subsRes.error) throw subsRes.error;
      
      setCategories(catsRes.data || []);
      setSubcategories(subsRes.data || []);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
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

      // Filter out empty options
      const validOptions = options.map(opt => ({
        name: opt.name.trim(),
        choices: opt.choices.map(c => c.trim()).filter(c => c)
      })).filter(opt => opt.name && opt.choices.length > 0);

      const payload = {
        name,
        description: finalDescription || null,
        price: parseFloat(price.replace(',', '.')),
        image_url: imageUrl || null,
        category_id: categoryId,
        subcategory_id: subcategoryId === "none" ? null : subcategoryId,
        active,
        options: validOptions.length > 0 ? validOptions : null
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

  const addOption = () => {
    setOptions([...options, { name: "", choices: [] }]);
  };

  const updateOptionName = (index: number, newName: string) => {
    const newOptions = [...options];
    newOptions[index].name = newName;
    setOptions(newOptions);
  };

  const updateOptionChoices = (index: number, choicesString: string) => {
    const newOptions = [...options];
    newOptions[index].choices = choicesString.split(',').map(s => s.trim());
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const filteredSubcategories = subcategories.filter(sub => sub.category_id === categoryId);

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

          {categoryId && filteredSubcategories.length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="subcategory">Subcategoria / Pasta (Opcional)</Label>
              <Select value={subcategoryId} onValueChange={setSubcategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sem subcategoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma (Solto na categoria)</SelectItem>
                  {filteredSubcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-base font-bold text-coffee-800">Opções / Variações (Opcional)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="w-4 h-4 mr-1" /> Add Opção
              </Button>
            </div>
            {options.length === 0 ? (
              <div className="text-sm text-gray-500 italic space-y-1">
                <p>Ex: Sabor (Chocolate, Morango), Tamanho (P, M, G)</p>
                <p className="text-brand-600 font-medium mt-1">Dica: Para cobrar um valor adicional, coloque (+X) no final. Ex: Nutella (+1,50) ou Leite (+1)</p>
              </div>
            ) : (
              <div className="space-y-4">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex gap-2 items-start border p-3 rounded-md bg-slate-50">
                    <div className="grid gap-2 flex-1">
                      <Input 
                        placeholder="Nome (Ex: Sabor)" 
                        value={opt.name} 
                        onChange={(e) => updateOptionName(idx, e.target.value)}
                        className="bg-white"
                      />
                      <Input 
                        placeholder="Opções separadas por vírgula (Ex: Limão, Leite (+1,50))" 
                        value={opt.choices.join(', ')} 
                        onChange={(e) => updateOptionChoices(idx, e.target.value)}
                        className="bg-white"
                      />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
