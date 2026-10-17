-- Supabase Seed Data for Cheezy Dip Cafe
-- Seed categories, menu items, sample dining tables, delivery zones, settings, and initial owner

-- 1. CAFE SETTINGS
INSERT INTO public.cafe_settings (key, value) VALUES
('is_open', 'true'::jsonb),
('is_accepting_orders', 'true'::jsonb),
('is_delivery_enabled', 'true'::jsonb),
('is_dine_in_enabled', 'true'::jsonb),
('delivery_fee_minor', '3000'::jsonb), -- ₹30 delivery fee
('free_delivery_threshold_minor', '29900'::jsonb), -- Free delivery above ₹299
('min_delivery_order_minor', '14900'::jsonb), -- Minimum ₹149 for delivery
('operating_hours', '{"open": "11:00", "close": "23:00"}'::jsonb),
('cafe_info', '{"name": "Cheezy dip cafe", "phone": "+919876543210", "address": "Shop 4, Main Market Road, City Center"}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. INITIAL OWNER SEED
INSERT INTO public.staff_members (phone_e164, role, active, created_by)
VALUES ('+919876543210', 'owner', true, 'system_bootstrap')
ON CONFLICT (phone_e164) DO NOTHING;

-- 3. DINING TABLES (Permanent QRs)
INSERT INTO public.dining_tables (id, label, qr_token, is_active) VALUES
('d0000000-0000-0000-0000-000000000001', 'Table 1', 'cd_tbl_tok_01x9a', true),
('d0000000-0000-0000-0000-000000000002', 'Table 2', 'cd_tbl_tok_02y8b', true),
('d0000000-0000-0000-0000-000000000003', 'Table 3', 'cd_tbl_tok_03z7c', true),
('d0000000-0000-0000-0000-000000000004', 'Table 4', 'cd_tbl_tok_04w6d', true),
('d0000000-0000-0000-0000-000000000005', 'Table 5', 'cd_tbl_tok_05v5e', true),
('d0000000-0000-0000-0000-000000000006', 'Table 6', 'cd_tbl_tok_06u4f', true)
ON CONFLICT (qr_token) DO NOTHING;

-- 4. DELIVERY PINCODES
INSERT INTO public.delivery_areas (pincode, area_name, fee_minor, is_active) VALUES
('110001', 'Connaught Place / Central', 3000, true),
('110002', 'Daryaganj / Old Delhi', 3500, true),
('110003', 'Kaka Nagar / Golf Links', 4000, true),
('110005', 'Karol Bagh', 3000, true),
('110055', 'Pahar Ganj', 3000, true)
ON CONFLICT DO NOTHING;

-- 5. CATEGORIES
INSERT INTO public.categories (id, name, slug, sort_order, is_active) VALUES
('burgers', 'Burgers', 'burgers', 1, true),
('french-fries', 'Fries & Sides', 'french-fries', 2, true),
('pizzas', 'Pizzas', 'pizzas', 3, true),
('sandwiches', 'Sandwiches', 'sandwiches', 4, true),
('momos', 'Momos', 'momos', 5, true),
('tea-coffee', 'Tea & Coffee', 'tea-coffee', 6, true),
('shakes', 'Cold Shakes', 'shakes', 7, true),
('soups', 'Soups', 'soups', 8, true),
('mocktails', 'Mocktails', 'mocktails', 9, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order;

-- 6. MENU ITEMS
INSERT INTO public.menu_items (id, category_id, slug, name, description, price_minor, image_path, diet, is_available, is_active, sort_order) VALUES
('burger-crispy-dip', 'burgers', 'crispy-dip-special-burger', 'Crispy Dip Special Burger', 'Double crispy veg patties layered with melting cheddar, caramelized onions, and a side of hot molten cheese dip.', 12900, '/brand/cafe_combo_hero.jpg', 'veg', true, true, 1),
('burger-paneer-tikka', 'burgers', 'paneer-tikka-burger', 'Paneer Tikka Burger', 'Char-grilled tandoori paneer steak, creamy mint mayo, pickled red onions, and melting cheese in a brioche bun.', 9900, '/brand/dishes/burger_paneer_tikka.jpg', 'veg', true, true, 2),
('burger-crispy', 'burgers', 'crispy-veg-burger', 'Crispy Veg Burger', 'Golden crumbed vegetable patty, crisp iceberg lettuce, sliced tomatoes, and house cheese sauce.', 4000, '/brand/dishes/burger_crispy.jpg', 'veg', true, true, 3),
('fries-cheese-loaded', 'french-fries', 'cheese-loaded-fries', 'Cheese Loaded Fries', 'Crispy golden French fries submerged in warm, flowing molten cheddar cheese sauce and dried herbs.', 10900, '/brand/dishes/fries_cheese_loaded.jpg', 'veg', true, true, 4),
('fries-peri-peri', 'french-fries', 'peri-peri-fries', 'Peri Peri Fries', 'Classic crinkle-cut fries generously tossed in spicy, tangy African bird''s eye peri-peri seasoning.', 8900, '/brand/dishes/fries_peri_peri.jpg', 'veg', true, true, 5),
('pizza-margherita', 'pizzas', 'classic-margherita-pizza', 'Classic Margherita Pizza', 'Stone-baked crispy crust, rich Italian tomato concasse, fresh mozzarella cheese pull, and fragrant sweet basil.', 9900, '/brand/dishes/pizza_margherita.jpg', 'veg', true, true, 6),
('pizza-cheese-dip-special', 'pizzas', 'cheese-dip-special-pizza', 'Cheese Dip Special Pizza', 'Overloaded cheese burst pizza served with a warm, bubbling bowl of signature cheesy dip right in the center.', 16900, '/brand/dishes/pizza_margherita.jpg', 'veg', true, true, 7),
('sandwich-cheese-corn', 'sandwiches', 'cheese-corn-sandwich', 'Cheese Corn Sandwich', 'Griddle-toasted golden bread packed with juicy sweet corn kernels and a dramatic molten cheese pull.', 8000, '/brand/dishes/sandwich_cheese_corn.jpg', 'veg', true, true, 8),
('sandwich-paneer', 'sandwiches', 'paneer-cheese-sandwich', 'Paneer Cheese Sandwich', 'Spiced paneer bhurji filling, zesty mint chutney, and creamy melting cheese pressed on panini grill.', 8000, '/brand/dishes/sandwich_paneer.jpg', 'veg', true, true, 9),
('momos-steamed-veg', 'momos', 'steamed-veg-momos', 'Steamed Veg Momos (6 pcs)', 'Hand-pleated delicate dumplings filled with finely chopped garden vegetables, served in bamboo steamer with red chili garlic dip.', 6000, '/brand/dishes/momos_steamed.jpg', 'veg', true, true, 10),
('momos-kurkure', 'momos', 'kurkure-momos', 'Kurkure Momos (6 pcs)', 'Ultra-crispy golden crumb-coated fried momos, sprinkled with chaat masala, served with tandoori mayo.', 9900, '/brand/dishes/momos_kurkure.jpg', 'veg', true, true, 11),
('beverage-cappuccino', 'tea-coffee', 'artisan-cappuccino', 'Artisan Cappuccino', 'Freshly pulled double espresso shot with velvety micro-foam and latte art, crafted with 100% Arabica beans.', 5000, '/brand/dishes/beverage_hot_coffee.jpg', 'veg', true, true, 12),
('beverage-masala-chai', 'tea-coffee', 'kulhad-masala-chai', 'Kulhad Masala Chai', 'Authentic slow-brewed tea with crushed fresh ginger, green cardamom, and aromatic spices in an earthen clay cup.', 3500, '/brand/dishes/beverage_masala_chai.jpg', 'veg', true, true, 13)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_minor = EXCLUDED.price_minor,
  image_path = EXCLUDED.image_path;
