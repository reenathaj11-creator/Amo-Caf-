import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';

export type Category = {
  id: string;
  name: string;
  icon?: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string; // name of the category
  image: string;
  category_id: string;
  description: string | null;
};

export type CartItem = {
  id: string;
  product: Product;
  quantity: number;
  modifiers: any[];
  subtotal: number;
};

interface POSContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, modifiers?: string[]) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  setDiscount: (val: number) => void;
  total: number;
  // Catalog Data
  products: Product[];
  categories: Category[];
  loadingCatalog: boolean;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export function POSProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);

  // Catalog State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      try {
        setLoadingCatalog(true);
        // Fetch Categories
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (catError) throw catError;
        setCategories(catData || []);

        // Fetch Products with category names
        const { data: prodData, error: prodError } = await supabase
          .from('products')
          .select(`
            id, name, price, image_url, category_id, description,
            categories ( name )
          `)
          .eq('active', true)
          .order('name', { ascending: true });
        
        if (prodError) throw prodError;

        const mappedProducts: Product[] = (prodData || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: p.image_url || 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&q=80',
          category: p.categories?.name || 'Sem Categoria',
          category_id: p.category_id,
          description: p.description
        }));

        setProducts(mappedProducts);
      } catch (error) {
        console.error("Erro ao buscar catálogo do Supabase:", error);
      } finally {
        setLoadingCatalog(false);
      }
    }

    loadCatalog();
  }, []);

  const addToCart = (product: Product, quantity = 1, modifiers: string[] = []) => {
    setCart((prev) => {
      // Se tiver modificadores, não agrupa com itens sem modificadores ou com modificadores diferentes
      const modifiersString = JSON.stringify(modifiers);
      const existingItem = prev.find(
        (item) => item.product.id === product.id && JSON.stringify(item.modifiers) === modifiersString
      );
      
      if (existingItem) {
        return prev.map((item) =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.product.price }
            : item
        );
      }

      const newItem: CartItem = {
        id: crypto.randomUUID(),
        product,
        quantity,
        modifiers,
        subtotal: product.price * quantity,
      };
      
      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity, subtotal: quantity * item.product.price }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
  };

  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discount);
  }, [subtotal, discount]);

  return (
    <POSContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        discount,
        setDiscount,
        total,
        products,
        categories,
        loadingCatalog,
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
}
