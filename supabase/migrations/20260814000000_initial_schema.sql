-- Ativar extensão de UUIDs caso ainda não esteja
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: companies (Empresas)
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    trade_name VARCHAR(255),
    document VARCHAR(20),
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: users (Vinculada ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'GERENTE', 'CAIXA')),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Política para companies: usuário vê apenas a empresa que ele pertence
CREATE POLICY "Users can view their own company" ON public.companies
    FOR SELECT USING (id = (SELECT company_id FROM public.users WHERE users.id = auth.uid()));

-- Habilitar RLS em users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para users: usuários veem os usuários da própria empresa
CREATE POLICY "Users can view users from their own company" ON public.users
    FOR SELECT USING (company_id = (SELECT company_id FROM public.users AS u WHERE u.id = auth.uid()));

-- Trigger para atualizar updated_at (função utilitária)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at
    BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
