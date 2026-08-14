-- Tabela: categories
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Política de RLS: Apenas usuários da empresa podem ver e gerenciar as categorias
CREATE POLICY "Users can manage categories of their company" ON public.categories
    FOR ALL USING (company_id = (SELECT company_id FROM public.users WHERE users.id = auth.uid()));

-- Trigger de updated_at
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- Tabela: products
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100),
    barcode VARCHAR(100),
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    stock_current DECIMAL(10, 3) NOT NULL DEFAULT 0,
    stock_min DECIMAL(10, 3) NOT NULL DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'UN',
    image_url TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage products of their company" ON public.products
    FOR ALL USING (company_id = (SELECT company_id FROM public.users WHERE users.id = auth.uid()));

-- Trigger de updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- Tabela: modifiers (Adicionais)
CREATE TABLE IF NOT EXISTS public.modifiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_required BOOLEAN DEFAULT FALSE,
    min_qty INTEGER DEFAULT 0,
    max_qty INTEGER DEFAULT 1,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.modifiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage modifiers of their company" ON public.modifiers
    FOR ALL USING (company_id = (SELECT company_id FROM public.users WHERE users.id = auth.uid()));

-- Trigger de updated_at
CREATE TRIGGER update_modifiers_updated_at
    BEFORE UPDATE ON public.modifiers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
