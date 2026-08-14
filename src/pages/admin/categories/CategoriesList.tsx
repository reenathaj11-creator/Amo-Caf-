import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { supabase } from "@/services/supabase/client"
import { CategoryModal } from "./CategoryModal"

export function CategoriesList() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Busca categorias e a contagem de produtos vinculados a ela
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products ( count )
        `)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Os produtos vinculados perderão a categoria.')) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir categoria.");
    }
  };

  const openNewModal = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setCategoryToEdit(category);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorias</h2>
          <p className="text-slate-500">Gerencie as categorias do catálogo.</p>
        </div>
        <Button onClick={openNewModal} className="bg-slate-900 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Buscar categorias..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Nome</TableHead>
              <TableHead>Ícone</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead>Qtd Produtos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-10">
                   <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-500 mb-2" />
                 </TableCell>
               </TableRow>
            ) : categories.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                   Nenhuma categoria cadastrada.
                 </TableCell>
               </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.icon || '-'}</TableCell>
                  <TableCell>{category.sort_order}</TableCell>
                  <TableCell>{category.products?.[0]?.count || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button onClick={() => openEditModal(category)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(category.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchCategories}
        categoryToEdit={categoryToEdit}
      />
    </div>
  )
}
