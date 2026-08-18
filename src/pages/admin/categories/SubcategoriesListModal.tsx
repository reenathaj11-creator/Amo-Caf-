import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { supabase } from "@/services/supabase/client"

interface SubcategoriesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any | null;
}

export function SubcategoriesListModal({ isOpen, onClose, category }: SubcategoriesListModalProps) {
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && category) {
      fetchSubcategories();
      setEditingId(null);
      setNameInput("");
    }
  }, [isOpen, category]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('category_id', category.id)
        .order('name');
      
      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar subcategorias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!nameInput.trim()) return;

    try {
      setIsSaving(true);
      if (editingId) {
        const { error } = await supabase
          .from('subcategories')
          .update({ name: nameInput.trim() })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert([{ name: nameInput.trim(), category_id: category.id }]);
        if (error) throw error;
      }
      
      setEditingId(null);
      setNameInput("");
      fetchSubcategories();
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      alert("Erro detalhado do banco de dados: " + (error.message || JSON.stringify(error)));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta pasta? Produtos dentro dela ficarão "soltos" na categoria.')) return;
    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', id);
      if (error) throw error;
      fetchSubcategories();
    } catch (error) {
      console.error("Erro ao deletar:", error);
    }
  };

  const startEdit = (sub: any) => {
    setEditingId(sub.id);
    setNameInput(sub.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNameInput("");
  };

  if (!category) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Subcategorias (Pastas) de {category.name}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 items-end mt-4 mb-2">
          <div className="grid gap-2 flex-1">
            <Label>Nova Subcategoria</Label>
            <Input 
              value={nameInput} 
              onChange={(e) => setNameInput(e.target.value)} 
              placeholder="Ex: Pão de Queijo"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving || !nameInput.trim()} className="bg-brand-500 hover:bg-brand-600 text-white">
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editingId ? "Salvar" : <Plus className="w-4 h-4 mr-2" />}
            {editingId ? "" : "Adicionar"}
          </Button>
          {editingId && (
            <Button variant="ghost" onClick={cancelEdit}>Cancelar</Button>
          )}
        </div>

        <div className="border rounded-md overflow-y-auto flex-1 mt-2">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nome</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-500" />
                  </TableCell>
                </TableRow>
              ) : subcategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-8 text-slate-500">
                    Nenhuma subcategoria criada.
                  </TableCell>
                </TableRow>
              ) : (
                subcategories.map(sub => (
                  <TableRow key={sub.id} className={editingId === sub.id ? "bg-brand-50" : ""}>
                    <TableCell className="font-medium">{sub.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => startEdit(sub)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(sub.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  )
}
