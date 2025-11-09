-- ==========================================
-- Food Delivery Database Seed Data
-- ==========================================

-- 1. Insert Categories (分类データ)
INSERT INTO categories (name, description, status, created_at, updated_at) VALUES
('Salad', 'Fresh and healthy salads', true, NOW(), NOW()),
('Rolls', 'Delicious rolls and wraps', true, NOW(), NOW()),
('Deserts', 'Sweet treats and desserts', true, NOW(), NOW()),
('Sandwich', 'Tasty sandwiches', true, NOW(), NOW()),
('Cake', 'Delightful cakes', true, NOW(), NOW()),
('Pure Veg', 'Pure vegetarian dishes', true, NOW(), NOW()),
('Pasta', 'Italian pasta dishes', true, NOW(), NOW()),
('Noodles', 'Asian noodle dishes', true, NOW(), NOW());

-- 2. Insert Foods (商品データ)
-- Salad Category (category_id = 1)
INSERT INTO foods (name, description, price, category_id, image_path, status, stock, min_stock, created_at, updated_at) VALUES
('Greek salad', 'Food provides essential nutrients for overall health and well-being', 12.00, 1, '/public/foods/food_1.png', true, 100, 10, NOW(), NOW()),
('Veg salad', 'Food provides essential nutrients for overall health and well-being', 18.00, 1, '/public/foods/food_2.png', true, 100, 10, NOW(), NOW()),
('Clover Salad', 'Food provides essential nutrients for overall health and well-being', 16.00, 1, '/public/foods/food_3.png', true, 100, 10, NOW(), NOW()),
('Chicken Salad', 'Food provides essential nutrients for overall health and well-being', 24.00, 1, '/public/foods/food_4.png', true, 100, 10, NOW(), NOW()),

-- Rolls Category (category_id = 2)
('Lasagna Rolls', 'Food provides essential nutrients for overall health and well-being', 14.00, 2, '/public/foods/food_5.png', true, 100, 10, NOW(), NOW()),
('Peri Peri Rolls', 'Food provides essential nutrients for overall health and well-being', 12.00, 2, '/public/foods/food_6.png', true, 100, 10, NOW(), NOW()),
('Chicken Rolls', 'Food provides essential nutrients for overall health and well-being', 20.00, 2, '/public/foods/food_7.png', true, 100, 10, NOW(), NOW()),
('Veg Rolls', 'Food provides essential nutrients for overall health and well-being', 15.00, 2, '/public/foods/food_8.png', true, 100, 10, NOW(), NOW()),

-- Deserts Category (category_id = 3)
('Ripple Ice Cream', 'Food provides essential nutrients for overall health and well-being', 14.00, 3, '/public/foods/food_9.png', true, 100, 10, NOW(), NOW()),
('Fruit Ice Cream', 'Food provides essential nutrients for overall health and well-being', 22.00, 3, '/public/foods/food_10.png', true, 100, 10, NOW(), NOW()),
('Jar Ice Cream', 'Food provides essential nutrients for overall health and well-being', 10.00, 3, '/public/foods/food_11.png', true, 100, 10, NOW(), NOW()),
('Vanilla Ice Cream', 'Food provides essential nutrients for overall health and well-being', 12.00, 3, '/public/foods/food_12.png', true, 100, 10, NOW(), NOW()),

-- Sandwich Category (category_id = 4)
('Chicken Sandwich', 'Food provides essential nutrients for overall health and well-being', 12.00, 4, '/public/foods/food_13.png', true, 100, 10, NOW(), NOW()),
('Vegan Sandwich', 'Food provides essential nutrients for overall health and well-being', 18.00, 4, '/public/foods/food_14.png', true, 100, 10, NOW(), NOW()),
('Grilled Sandwich', 'Food provides essential nutrients for overall health and well-being', 16.00, 4, '/public/foods/food_15.png', true, 100, 10, NOW(), NOW()),
('Bread Sandwich', 'Food provides essential nutrients for overall health and well-being', 24.00, 4, '/public/foods/food_16.png', true, 100, 10, NOW(), NOW()),

-- Cake Category (category_id = 5)
('Cup Cake', 'Food provides essential nutrients for overall health and well-being', 14.00, 5, '/public/foods/food_17.png', true, 100, 10, NOW(), NOW()),
('Vegan Cake', 'Food provides essential nutrients for overall health and well-being', 12.00, 5, '/public/foods/food_18.png', true, 100, 10, NOW(), NOW()),
('Butterscotch Cake', 'Food provides essential nutrients for overall health and well-being', 20.00, 5, '/public/foods/food_19.png', true, 100, 10, NOW(), NOW()),
('Sliced Cake', 'Food provides essential nutrients for overall health and well-being', 15.00, 5, '/public/foods/food_20.png', true, 100, 10, NOW(), NOW()),

-- Pure Veg Category (category_id = 6)
('Garlic Mushroom', 'Food provides essential nutrients for overall health and well-being', 14.00, 6, '/public/foods/food_21.png', true, 100, 10, NOW(), NOW()),
('Fried Cauliflower', 'Food provides essential nutrients for overall health and well-being', 22.00, 6, '/public/foods/food_22.png', true, 100, 10, NOW(), NOW()),
('Mix Veg Pulao', 'Food provides essential nutrients for overall health and well-being', 10.00, 6, '/public/foods/food_23.png', true, 100, 10, NOW(), NOW()),
('Rice Zucchini', 'Food provides essential nutrients for overall health and well-being', 12.00, 6, '/public/foods/food_24.png', true, 100, 10, NOW(), NOW()),

-- Pasta Category (category_id = 7)
('Cheese Pasta', 'Food provides essential nutrients for overall health and well-being', 12.00, 7, '/public/foods/food_25.png', true, 100, 10, NOW(), NOW()),
('Tomato Pasta', 'Food provides essential nutrients for overall health and well-being', 18.00, 7, '/public/foods/food_26.png', true, 100, 10, NOW(), NOW()),
('Creamy Pasta', 'Food provides essential nutrients for overall health and well-being', 16.00, 7, '/public/foods/food_27.png', true, 100, 10, NOW(), NOW()),
('Chicken Pasta', 'Food provides essential nutrients for overall health and well-being', 24.00, 7, '/public/foods/food_28.png', true, 100, 10, NOW(), NOW()),

-- Noodles Category (category_id = 8)
('Buttter Noodles', 'Food provides essential nutrients for overall health and well-being', 14.00, 8, '/public/foods/food_29.png', true, 100, 10, NOW(), NOW()),
('Veg Noodles', 'Food provides essential nutrients for overall health and well-being', 12.00, 8, '/public/foods/food_30.png', true, 100, 10, NOW(), NOW()),
('Somen Noodles', 'Food provides essential nutrients for overall health and well-being', 20.00, 8, '/public/foods/food_31.png', true, 100, 10, NOW(), NOW()),
('Cooked Noodles', 'Food provides essential nutrients for overall health and well-being', 15.00, 8, '/public/foods/food_32.png', true, 100, 10, NOW(), NOW());

-- 3. Verify Data (データ確認)
SELECT 'Categories inserted:' as info, COUNT(*) as count FROM categories;
SELECT 'Foods inserted:' as info, COUNT(*) as count FROM foods;

-- 4. Display Sample Data (サンプルデータ表示)
SELECT c.name as category, COUNT(f.id) as food_count
FROM categories c
LEFT JOIN foods f ON c.id = f.category_id
GROUP BY c.id, c.name
ORDER BY c.id;
