import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/contexts/POSContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";

interface ComboModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bebida: Product, lanche: Product) => void;
  comboProduct: Product | null;
  allProducts: Product[];
}

export function ComboModal({ isOpen, onClose, onConfirm, comboProduct, allProducts }: ComboModalProps) {
  const [selectedBebida, setSelectedBebida] = useState<Product | null>(null);
  const [selectedLanche, setSelectedLanche] = useState<Product | null>(null);
  const [searchBebida, setSearchBebida] = useState("");
  const [searchLanche, setSearchLanche] = useState("");

  // Separar categorias baseado em palavras-chave para Bebidas e Lanches
  const { bebidas, lanches } = useMemo(() => {
    const isBebida = (p: Product) => {
      const cat = p.category.toLowerCase();
      return cat.includes("café") || cat.includes("bebida") || cat.includes("suco") || cat.includes("refri") || cat.includes("água") || cat.includes("capuccino") || cat.includes("espresso") || cat.includes("quente") || cat.includes("gelado") || p.name.toLowerCase().includes("café") || p.name.toLowerCase().includes("suco");
    };

    const b: Product[] = [];
    const l: Product[] = [];

    allProducts.forEach(p => {
      // Mostrar APENAS se tiver a flag [COMBO_ITEM]
      if (!p.description?.includes('[COMBO_ITEM]')) return;
      
      if (isBebida(p)) {
        b.push(p);
      } else {
        l.push(p); // Se não for bebida, entra como opção de lanche
      }
    });

    return { bebidas: b, lanches: l };
  }, [allProducts]);

  const filteredBebidas = bebidas.filter(b => b.name.toLowerCase().includes(searchBebida.toLowerCase()));
  const filteredLanches = lanches.filter(l => l.name.toLowerCase().includes(searchLanche.toLowerCase()));

  const handleConfirm = () => {
    if (!selectedBebida || !selectedLanche) return;
    onConfirm(selectedBebida, selectedLanche);
    // Limpar
    setSelectedBebida(null);
    setSelectedLanche(null);
    setSearchBebida("");
    setSearchLanche("");
  };

  const handleClose = () => {
    setSelectedBebida(null);
    setSelectedLanche(null);
    setSearchBebida("");
    setSearchLanche("");
    onClose();
  };

  if (!comboProduct) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-[800px] h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl text-coffee-950">
            Montar Combo: {comboProduct.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Lado Esquerdo: Lanches */}
          <div className="flex-1 border-r border-coffee-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b bg-white">
              <h3 className="font-bold text-lg text-coffee-800 mb-2">1. Escolha o Lanche</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar lanche..."
                  className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:border-brand-500"
                  value={searchLanche}
                  onChange={(e) => setSearchLanche(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-2">
                {filteredLanches.map(l => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLanche(l)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-center flex items-center justify-center min-h-[60px]
                      ${selectedLanche?.id === l.id 
                        ? 'bg-brand-500 text-white border-brand-600 shadow-md scale-[1.02]' 
                        : 'bg-white text-coffee-900 border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                  >
                    <span className="font-semibold text-sm leading-tight uppercase">{l.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Lado Direito: Bebidas */}
          <div className="flex-1 flex flex-col bg-slate-50">
            <div className="p-4 border-b bg-white">
              <h3 className="font-bold text-lg text-coffee-800 mb-2">2. Escolha a Bebida</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar bebida..."
                  className="w-full pl-9 pr-3 py-2 border rounded-md text-sm outline-none focus:border-brand-500"
                  value={searchBebida}
                  onChange={(e) => setSearchBebida(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="grid grid-cols-2 gap-2">
                {filteredBebidas.map(b => (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBebida(b)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-center flex items-center justify-center min-h-[60px]
                      ${selectedBebida?.id === b.id 
                        ? 'bg-brand-500 text-white border-brand-600 shadow-md scale-[1.02]' 
                        : 'bg-white text-coffee-900 border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                      }`}
                  >
                    <span className="font-semibold text-sm leading-tight uppercase">{b.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-white flex justify-between items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-sm text-coffee-500">Lanche: <strong className="text-coffee-900 uppercase">{selectedLanche?.name || '---'}</strong></span>
            <span className="text-sm text-coffee-500">Bebida: <strong className="text-coffee-900 uppercase">{selectedBebida?.name || '---'}</strong></span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>Cancelar</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedBebida || !selectedLanche}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              Adicionar ao Pedido
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
