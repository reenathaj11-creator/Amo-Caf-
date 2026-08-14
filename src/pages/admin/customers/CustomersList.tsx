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
import { Search, Plus, Edit, Trash2, Loader2, DollarSign } from "lucide-react"
import { supabase } from "@/services/supabase/client"
import { CustomerModal } from "./CustomerModal"
import { PaymentModal } from "./PaymentModal"

export function CustomersList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
    
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      fetchCustomers();
    } catch (error) {
      console.error("Erro ao excluir:", error);
      alert("Erro ao excluir cliente.");
    }
  };

  const openNewModal = () => {
    setSelectedCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const openEditModal = (customer: any) => {
    setSelectedCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const openPaymentModal = (customer: any) => {
    setSelectedCustomer(customer);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clientes e Fiados</h2>
          <p className="text-slate-500">Gerencie clientes que compram na conta e receba pagamentos.</p>
        </div>
        <Button onClick={openNewModal} className="bg-slate-900 text-white gap-2">
          <Plus className="w-4 h-4" />
          Novo Cliente
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="search"
            placeholder="Buscar por nome..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="border rounded-md bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Nome</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Saldo Devedor</TableHead>
              <TableHead>Status</TableHead>
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
            ) : customers.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                   Nenhum cliente cadastrado.
                 </TableCell>
               </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>
                    <span className={`font-bold ${customer.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      R$ {Number(customer.balance).toFixed(2).replace('.', ',')}
                    </span>
                  </TableCell>
                  <TableCell>
                    {customer.active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Inativo
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {customer.balance > 0 && (
                        <Button 
                          onClick={() => openPaymentModal(customer)} 
                          variant="outline" 
                          size="sm" 
                          className="h-8 border-brand-200 text-brand-600 hover:bg-brand-50"
                        >
                          <DollarSign className="w-4 h-4 mr-1" /> Receber
                        </Button>
                      )}
                      <Button onClick={() => openEditModal(customer)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDelete(customer.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-600">
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

      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSaved={fetchCustomers}
        customerToEdit={selectedCustomer}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSaved={fetchCustomers}
        customer={selectedCustomer}
      />
    </div>
  )
}
