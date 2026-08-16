import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { LayoutGrid, Coffee, CupSoda, Sandwich, CakeSlice, Gift, Tag } from "lucide-react"
import { usePOS } from "@/contexts/POSContext"

interface CategoryNavProps {
  activeCategory: string;
  onSelect: (cat: string) => void;
}

// Map de ícones em string do banco para componentes do Lucide
const getIconComponent = (iconName: string | undefined) => {
  switch (iconName?.toLowerCase()) {
    case 'coffee': return Coffee;
    case 'cupsoda': return CupSoda;
    case 'sandwich': return Sandwich;
    case 'cakeslice': return CakeSlice;
    case 'gift': return Gift;
    default: return Tag; // ícone genérico se não especificado
  }
}

export function CategoryNav({ activeCategory, onSelect }: CategoryNavProps) {
  const { categories } = usePOS();

  // Sempre adicionar "Todos" como primeira opção localmente na interface
  const allCategories = [
    { id: 'all', name: 'Todos', icon: 'LayoutGrid' }, // Usaremos LayoutGrid hardcoded para o 'Todos'
    ...categories
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 p-2 flex items-center justify-between">
      <ScrollArea className="whitespace-nowrap flex-1">
        <div className="flex w-max space-x-2">
          {allCategories.map((category) => {
            const isTodos = category.name === 'Todos';
            const Icon = isTodos ? LayoutGrid : getIconComponent(category.icon);
            const isActive = activeCategory === category.name;
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.name)}
                title={isTodos ? "Todas as Categorias" : undefined}
                className={cn(
                  "flex items-center justify-center transition-all select-none rounded-xl font-bold",
                  isTodos ? "w-10 h-10 shrink-0" : "gap-2 px-5 py-2.5 text-sm",
                  isActive
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-transparent text-coffee-600 hover:bg-cream-50 hover:text-coffee-900"
                )}
              >
                <Icon className={cn(isTodos ? "w-5 h-5" : "w-4 h-4", isActive ? "text-white" : "text-coffee-400")} />
                {!isTodos && category.name}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>
    </div>
  )
}
