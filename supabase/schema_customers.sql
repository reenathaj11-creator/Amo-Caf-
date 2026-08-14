-- 1. Customers Table (Clientes)
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  phone text,
  balance decimal(10,2) default 0.00 not null, -- Saldo devedor (Conta / Fiado)
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Customer Payments Table (Pagamentos de Dívida)
create table public.customer_payments (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers(id) on delete cascade not null,
  amount decimal(10,2) not null,
  payment_method text not null,
  user_id uuid references auth.users(id) on delete set null, -- Quem recebeu o pagamento
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Modify Sales Table
-- Adicionar coluna customer_id para vincular a venda a um cliente específico
alter table public.sales add column customer_id uuid references public.customers(id) on delete set null;

-- Configurando RLS
alter table public.customers enable row level security;
alter table public.customer_payments enable row level security;

-- Policies (Permitir acesso total para usuários autenticados por enquanto)
create policy "Allow all actions for authenticated users on customers" on customers for all using (auth.role() = 'authenticated');
create policy "Allow all actions for authenticated users on customer_payments" on customer_payments for all using (auth.role() = 'authenticated');
