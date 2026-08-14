-- Limpar tabelas caso já existam dados
TRUNCATE public.products CASCADE;
TRUNCATE public.categories CASCADE;

-- 1. Inserir Categorias
INSERT INTO public.categories (id, name, sort_order) VALUES 
('11111111-1111-1111-1111-111111111111', 'Bebidas Quentes', 1),
('22222222-2222-2222-2222-222222222222', 'Bebidas Geladas', 2),
('33333333-3333-3333-3333-333333333333', 'Salgados', 3),
('44444444-4444-4444-4444-444444444444', 'Sobremesas', 4);

-- 2. Inserir Produtos
INSERT INTO public.products (category_id, name, description, price, image_url, active) VALUES 
('11111111-1111-1111-1111-111111111111', 'Cappuccino Tradicional', 'O clássico café espresso com leite vaporizado e espuma cremosa.', 14.00, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&q=80', true),
('11111111-1111-1111-1111-111111111111', 'Espresso Duplo', 'Dose dupla de café espresso encorpado.', 8.50, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80', true),
('11111111-1111-1111-1111-111111111111', 'Mocha', 'Café espresso com calda de chocolate e leite vaporizado.', 16.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80', true),
('22222222-2222-2222-2222-222222222222', 'Latte Gelado', 'Café com leite resfriado e cubos de gelo.', 15.00, 'https://images.unsplash.com/photo-1517701550927-30cfcb64ac45?w=400&q=80', true),
('22222222-2222-2222-2222-222222222222', 'Frappuccino', 'Bebida batida com café, leite, gelo e chantilly.', 18.00, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80', true),
('33333333-3333-3333-3333-333333333333', 'Pão de Queijo', 'Pão de queijo tradicional mineiro assado na hora.', 6.00, 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=400&q=80', true),
('33333333-3333-3333-3333-333333333333', 'Croissant', 'Croissant amanteigado, crocante por fora e macio por dentro.', 12.00, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80', true),
('44444444-4444-4444-4444-444444444444', 'Torta de Limão', 'Fatia deliciosa de torta de limão com merengue.', 15.00, 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=80', true),
('44444444-4444-4444-4444-444444444444', 'Bolo de Cenoura', 'Bolo caseiro de cenoura com cobertura de chocolate.', 12.00, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80', true);
