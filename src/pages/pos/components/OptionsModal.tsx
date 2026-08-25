import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Product } from "@/contexts/POSContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (modifiers: string[], extraPrice: number) => void;
  product: Product | null;
}

export function OptionsModal({ isOpen, onClose, onConfirm, product }: OptionsModalProps) {
  // Store selected choices: { "Sabor": "Chocolate" }
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setSelections({}); // Reset selections when modal opens
    }
  }, [isOpen]);

  const handleSelect = (optionName: string, choice: string) => {
    setSelections(prev => ({
      ...prev,
      [optionName]: choice
    }));
  };

  const handleConfirm = () => {
    if (!product || !product.options) return;

    const modifiers: string[] = [];
    let totalExtraPrice = 0;
    
    // Regex para pegar valor no formato (+1), (+ 1,50), (+1.50)
    const priceRegex = /\(\s*\+\s*([\d.,]+)\s*\)/;

    product.options.forEach(opt => {
      const selectedChoice = selections[opt.name];
      if (selectedChoice) {
        modifiers.push(`${opt.name}: ${selectedChoice}`);
        
        // Extrair o valor adicional, se houver
        const match = selectedChoice.match(priceRegex);
        if (match && match[1]) {
          const priceString = match[1].replace(',', '.');
          const price = parseFloat(priceString);
          if (!isNaN(price)) {
            totalExtraPrice += price;
          }
        }
      }
    });

    onConfirm(modifiers, totalExtraPrice);
  };

  const isComplete = product?.options?.every(opt => selections[opt.name]) ?? false;

  if (!product || !product.options) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[500px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="text-2xl text-coffee-950">
            {product.name}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="flex flex-col gap-6">
            {product.options.map(opt => (
              <div key={opt.name}>
                <h3 className="font-bold text-lg text-coffee-800 mb-3">{opt.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {opt.choices.map(choice => (
                    <div
                      key={choice}
                      onClick={() => handleSelect(opt.name, choice)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-center flex items-center justify-center min-h-[50px]
                        ${selections[opt.name] === choice 
                          ? 'bg-brand-500 text-white border-brand-600 shadow-md scale-[1.02]' 
                          : 'bg-white text-coffee-900 border-gray-200 hover:border-brand-300 hover:bg-brand-50'
                        }`}
                    >
                      <span className="font-semibold text-sm leading-tight">{choice}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter className="p-4 border-t bg-white flex justify-between items-center sm:justify-between">
          <div className="text-sm text-coffee-500">
            {isComplete ? 'Pronto para adicionar!' : 'Selecione todas as opções'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!isComplete}
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
