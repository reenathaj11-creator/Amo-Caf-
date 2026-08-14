-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Tabela opcional para armazenar o perfil: admin ou pdv)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role text check (role in ('admin', 'pdv')) default 'pdv',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  icon text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products
create table public.products (
  id uuid default uuid_generate_v4() primary key,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Sales
create table public.sales (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete set null, -- Quem vendeu
  total_amount decimal(10,2) not null,
  payment_method text not null,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Sale Items
create table public.sale_items (
  id uuid default uuid_generate_v4() primary key,
  sale_id uuid references public.sales(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null,
  unit_price decimal(10,2) not null,
  total_price decimal(10,2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configurando RLS (Row Level Security)
-- Por enquanto, liberando leitura/escrita autenticada e leitura de produtos anônima

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;

-- Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Categories are viewable by everyone." on categories for select using (true);
create policy "Products are viewable by everyone." on products for select using (true);

-- Permitir inserts e updates temporariamente para facilitar o desenvolvimento
create policy "Allow all actions for authenticated users on categories" on categories for all using (auth.role() = 'authenticated');
create policy "Allow all actions for authenticated users on products" on products for all using (auth.role() = 'authenticated');
create policy "Allow all actions for authenticated users on sales" on sales for all using (auth.role() = 'authenticated');
create policy "Allow all actions for authenticated users on sale_items" on sale_items for all using (auth.role() = 'authenticated');
