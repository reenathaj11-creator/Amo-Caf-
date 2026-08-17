import { usePOS } from "@/contexts/POSContext"
import { Card } from "@/components/ui/card"
import { Plus, Loader2 } from "lucide-react"

export function ProductGrid({ activeCategory }: { activeCategory: string }) {
  const { products, loadingCatalog, addToCart } = usePOS();

  if (loadingCatalog) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-coffee-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand-500" />
        <p className="font-medium">Carregando catálogo do sistema...</p>
      </div>
    );
  }

  const filteredProducts = products.filter(p => p.category === activeCategory);

  if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-coffee-500 font-medium text-lg">Nenhum produto encontrado nesta categoria.</p>
        <p className="text-coffee-400 text-sm mt-1">Verifique o banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-6">
      {filteredProducts.map((product) => (
        <Card 
          key={product.id}
          className="flex flex-col cursor-pointer transition-all bg-white overflow-hidden group rounded-2xl border-none shadow-sm hover:shadow-md hover:-translate-y-1"
          onClick={() => addToCart(product)}
        >
          {/* Topo: Imagem sem margens */}
          <div className="h-40 w-full overflow-hidden bg-cream-100 relative">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                // Fallback elegante
                e.currentTarget.src = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80";
              }}
            />
          </div>
          
          {/* Base: Infos e Ação */}
          <div className="p-4 flex flex-col h-[110px] justify-between">
            <h3 className="font-bold text-sm leading-tight text-coffee-950 line-clamp-2 pr-2">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between mt-auto">
              <span className="font-bold text-base text-brand-500">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              <button className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-white">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
