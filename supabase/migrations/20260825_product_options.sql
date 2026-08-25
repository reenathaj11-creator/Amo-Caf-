-- Adicionar suporte para variações/opções nos produtos (Ex: Sabores)
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS options JSONB DEFAULT NULL;

-- Adicionar coluna para salvar as variações escolhidas em cada item da venda
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS variations_text TEXT DEFAULT NULL;
