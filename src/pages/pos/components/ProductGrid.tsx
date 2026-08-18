import { useState } from "react"
import { usePOS } from "@/contexts/POSContext"
import type { Product } from "@/contexts/POSContext"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ComboModal } from "./ComboModal"

export function ProductGrid({ activeCategory, searchQuery }: { activeCategory: string, searchQuery?: string }) {
  const { products, loadingCatalog, addToCart } = usePOS();
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Product | null>(null);

  if (loadingCatalog) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-coffee-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
        <p className="font-medium">Carregando catálogo do sistema...</p>
      </div>
    );
  }

  const filteredProducts = searchQuery
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : products.filter(p => p.category === activeCategory);

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-coffee-500 font-medium text-lg">Nenhum produto encontrado nesta categoria.</p>
        <p className="text-coffee-400 text-sm mt-1">Verifique o banco de dados.</p>
      </div>
    );
  }

  const handleProductClick = (product: Product) => {
    if (product.description?.includes('[COMBO_CUSTOM]')) {
      setSelectedCombo(product);
      setComboModalOpen(true);
    } else {
      addToCart(product);
    }
  };

  const handleComboConfirm = (bebida: string, lanche: string) => {
    if (selectedCombo) {
      addToCart(selectedCombo, 1, [`Lanche: ${lanche}`, `Bebida: ${bebida}`]);
    }
    setComboModalOpen(false);
  };

  return (
    <>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-6">
      {filteredProducts.map((product) => (
        <Card 
          key={product.id}
          className="flex flex-col cursor-pointer transition-all bg-white overflow-hidden group rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-brand-500 hover:bg-brand-50"
          onClick={() => handleProductClick(product)}
        >
          <div className="p-3 flex flex-col items-center justify-center h-[120px] text-center">
            <h3 className="font-bold text-[13px] leading-tight text-coffee-950 uppercase mb-2 break-words w-full">
              {product.name}
            </h3>
            
            <span className="font-bold text-[15px] text-brand-600 mt-auto">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </Card>
      ))}
    </div>

    <ComboModal 
      isOpen={comboModalOpen}
      onClose={() => setComboModalOpen(false)}
      onConfirm={handleComboConfirm}
      comboProduct={selectedCombo}
      allProducts={products}
    />
    </>
  )
}
