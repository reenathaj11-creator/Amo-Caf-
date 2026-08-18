import { cn } from "@/lib/utils"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Coffee, CupSoda, Sandwich, CakeSlice, Gift, Tag } from "lucide-react"
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

const getCategoryStyle = (name: string, isActive: boolean) => {
  const n = name.toLowerCase();
  let baseColor = 'bg-brand-500';
  
  if (n.includes('bebida')) baseColor = 'bg-[#e04555]'; // vermelho
  else if (n.includes('bomboniere') || n.includes('chocolate')) baseColor = 'bg-[#895c46]'; // marrom
  else if (n.includes('café')) baseColor = 'bg-[#e89b33]'; // laranja
  else if (n.includes('doce') || n.includes('sobremesa')) baseColor = 'bg-[#ec4c7b]'; // rosa
  else if (n.includes('salgado')) baseColor = 'bg-[#ca333f]'; // vermelho escuro
  else if (n.includes('suco')) baseColor = 'bg-[#f08c16]'; // amarelo alaranjado
  else if (n.includes('vitamina')) baseColor = 'bg-[#2a9366]'; // verde
  
  // Se não estiver ativo, mantemos a cor base, mas você pode aplicar uma opacidade se preferir.
  // Pela imagem, parece que a cor é sempre sólida, e o que muda é um detalhe (como a setinha ou borda).
  // A imagem do usuário não mostra categorias inativas muito diferentes, apenas sem a seta.
  // Mas vamos deixar todas coloridas como na imagem!
  
  return { baseColor };
}

export function CategoryNav({ activeCategory, onSelect }: CategoryNavProps) {
  const { categories } = usePOS();

  return (
    <div className="w-full mt-2 relative">
      <div className="flex w-full gap-2 lg:gap-3 overflow-x-auto no-scrollbar pb-3">
        {categories.map((category) => {
          const Icon = getIconComponent(category.icon);
          const isActive = activeCategory === category.name;
          const { baseColor } = getCategoryStyle(category.name, isActive);
          
          return (
            <button
              key={category.id}
              onClick={() => onSelect(category.name)}
              className={cn(
                "relative flex-1 min-w-[80px] sm:min-w-[100px] h-[80px] lg:h-[90px] flex flex-col items-center justify-center transition-all select-none rounded-2xl font-bold text-white shadow-sm hover:shadow-md shrink-0 lg:shrink",
                baseColor,
                isActive ? "scale-105 shadow-md z-10 ring-2 ring-white ring-offset-2" : "opacity-90 hover:opacity-100"
              )}
            >
              <Icon className="w-6 h-6 mb-1 opacity-90" />
              <span className="text-xs lg:text-sm whitespace-nowrap">{category.name}</span>
              
              {isActive && (
                <div 
                  className={cn("absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px]", 
                  baseColor.replace('bg-', 'border-t-')
                  )}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  )
}
