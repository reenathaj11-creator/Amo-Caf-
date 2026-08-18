import { useState, useEffect } from "react"
import { usePOS } from "@/contexts/POSContext"
import type { Product } from "@/contexts/POSContext"
import { Card } from "@/components/ui/card"
import { Loader2, Folder, ArrowLeft } from "lucide-react"
import { ComboModal } from "./ComboModal"
import { Button } from "@/components/ui/button"

export function ProductGrid({ activeCategory, searchQuery }: { activeCategory: string, searchQuery?: string }) {
  const { products, loadingCatalog, addToCart } = usePOS();
  const [comboModalOpen, setComboModalOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Product | null>(null);

  // State for active subcategory view
  const [activeSubcategoryId, setActiveSubcategoryId] = useState<string | null>(null);
  const [activeSubcategoryName, setActiveSubcategoryName] = useState<string | null>(null);

  // Reset subcategory view when category or search changes
  useEffect(() => {
    setActiveSubcategoryId(null);
    setActiveSubcategoryName(null);
  }, [activeCategory, searchQuery]);

  if (loadingCatalog) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-coffee-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
        <p className="font-medium">Carregando catálogo do sistema...</p>
      </div>
    );
  }

  let displayItems: any[] = [];
  
  if (searchQuery) {
    // If searching, flat list of all matching products
    displayItems = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  } else {
    // If viewing a specific subcategory
    if (activeSubcategoryId) {
      displayItems = products.filter(p => p.category === activeCategory && p.subcategory_id === activeSubcategoryId);
    } else {
      // Viewing main category: products without subcategory + folders
      const categoryProducts = products.filter(p => p.category === activeCategory);
      
      const subcategoryMap = new Map();
      const directProducts: Product[] = [];
      
      categoryProducts.forEach(p => {
        if (p.subcategory_id) {
          if (!subcategoryMap.has(p.subcategory_id)) {
            subcategoryMap.set(p.subcategory_id, {
              isFolder: true,
              id: p.subcategory_id,
              name: p.subcategory || 'Subcategoria',
              count: 1
            });
          } else {
            subcategoryMap.get(p.subcategory_id).count++;
          }
        } else {
          directProducts.push(p);
        }
      });
      
      const folders = Array.from(subcategoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      
      displayItems = [...folders, ...directProducts];
    }
  }

  if (displayItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        {activeSubcategoryId ? (
          <>
            <p className="text-coffee-500 font-medium text-lg">Esta pasta está vazia.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setActiveSubcategoryId(null);
                setActiveSubcategoryName(null);
              }}
            >
              Voltar
            </Button>
          </>
        ) : (
          <>
            <p className="text-coffee-500 font-medium text-lg">Nenhum produto encontrado nesta categoria.</p>
            <p className="text-coffee-400 text-sm mt-1">Verifique o banco de dados.</p>
          </>
        )}
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
    {activeSubcategoryId && !searchQuery && (
      <div className="mb-4 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => {
            setActiveSubcategoryId(null);
            setActiveSubcategoryName(null);
          }}
          className="text-coffee-600 hover:text-brand-600 hover:bg-brand-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para {activeCategory}
        </Button>
        <span className="ml-2 font-bold text-coffee-800 border-l-2 border-brand-300 pl-4">
          {activeSubcategoryName}
        </span>
      </div>
    )}

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-6">
      {displayItems.map((item) => {
        if (item.isFolder) {
          return (
            <Card 
              key={`folder-${item.id}`}
              className="flex flex-col cursor-pointer transition-all bg-[#FFFBF8] overflow-hidden group rounded-xl border border-brand-200 shadow-sm hover:shadow-md hover:border-brand-500 hover:bg-brand-50"
              onClick={() => {
                setActiveSubcategoryId(item.id);
                setActiveSubcategoryName(item.name);
              }}
            >
              <div className="p-3 flex flex-col items-center justify-center h-[120px] text-center relative">
                <Folder className="w-10 h-10 text-brand-400 mb-2 group-hover:text-brand-500 transition-colors" />
                <h3 className="font-bold text-[13px] leading-tight text-coffee-950 uppercase mb-1 break-words w-full">
                  {item.name}
                </h3>
                <span className="text-[11px] text-brand-600 font-bold bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                  {item.count} itens
                </span>
              </div>
            </Card>
          )
        }

        const product = item as Product;
        return (
          <Card 
            key={`product-${product.id}`}
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
        )
      })}
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
