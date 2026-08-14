import { useRef } from "react"
import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Search, LayoutGrid, Coffee, CupSoda, Sandwich, CakeSlice, Gift, SlidersHorizontal, Tag } from "lucide-react"
import { useKeyPress } from "@/hooks/useKeyPress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
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
  const searchRef = useRef<HTMLInputElement>(null);
  const { categories } = usePOS();

  useKeyPress('F2', () => {
    searchRef.current?.focus();
  });

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
            const Icon = category.name === 'Todos' ? LayoutGrid : getIconComponent(category.icon);
            const isActive = activeCategory === category.name;
            return (
              <button
                key={category.id}
                onClick={() => onSelect(category.name)}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all select-none",
                  isActive
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-transparent text-coffee-600 hover:bg-cream-50 hover:text-coffee-900"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-coffee-400")} />
                {category.name}
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden" />
      </ScrollArea>

      <div className="flex items-center gap-2 pl-4 border-l border-coffee-100 ml-2">
        <div className="relative w-64 hidden xl:block">
          <Search className="absolute left-3 top-3 h-4 w-4 text-coffee-400" />
          <Input
            ref={searchRef}
            type="search"
            placeholder="Buscar produto (F2)..."
            className="pl-9 bg-white border-coffee-200 focus-visible:ring-brand-500 rounded-xl h-10 font-medium text-coffee-700"
          />
        </div>
        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-coffee-200 text-coffee-600 hover:bg-cream-50 hover:text-coffee-900">
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
