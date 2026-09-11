-- ============================================================================
-- Pizza Shop - Development Seed Data (product-service / pizza_shop_products)
--
-- Full take-away menu priced in Indian Rupees (₹), stored as paise
-- (price_cents = rupees x 100). Pizzas run ≈₹100-700 depending on size and
-- toppings; each topping costs between ₹10 and ₹70.
--
-- Idempotent: the previous seed rows (b0000000-… and c0000000-…) are removed
-- and the catalog is re-inserted. Admin-created products are kept.
-- ============================================================================

BEGIN;

DELETE FROM products WHERE id::text LIKE 'b0000000-%' OR id::text LIKE 'c0000000-%';

-- ---------------------------------------------------------------------------
-- Toppings catalog (priced as standalone add-ons, ₹10–70 each)
-- ---------------------------------------------------------------------------
INSERT INTO products (id, name, description, category, price_cents, image_url)
SELECT
    ('c0000000-0000-4000-8000-0000000000' || lpad(t.seq::text, 2, '0'))::uuid,
    t.name,
    '',
    'toppings',
    t.price_cents,
    NULL
FROM (
    VALUES
        (1, 'Pepperoni', 6500), (2, 'Sausage', 6000), (3, 'Mushrooms', 2500),
        (4, 'Onions', 1500), (5, 'Ham', 4500), (6, 'Canadian Bacon', 5500),
        (7, 'Pineapple', 2000), (8, 'Eggplant', 2500), (9, 'Tomato & Basil', 2000),
        (10, 'Green Peppers', 1500), (11, 'Hamburger', 5500), (12, 'Spinach', 2000),
        (13, 'Artichoke', 3500), (14, 'Buffalo Chicken', 6500),
        (15, 'Barbecue Chicken', 6500), (16, 'Anchovies', 6000),
        (17, 'Black Olives', 1500), (18, 'Jalapenos', 1500),
        (19, 'Fresh Garlic', 1000), (20, 'Zucchini', 1500)
) AS t(seq, name, price_cents)
ORDER BY t.seq;

-- ---------------------------------------------------------------------------
-- Pizza topping list (used by Regular + Sicilian Pizzas)
-- ---------------------------------------------------------------------------
INSERT INTO products (
    id,
    name,
    description,
    category,
    price_cents,
    sizes,
    toppings,
    add_ons,
    image_url
)
VALUES
    (
        'c0000000-0000-4000-8000-000000000030',
        'Regular Pizza',
        'Cheese base: classic tomato sauce and mozzarella. Toppings add ₹10–70 each; the Special adds ₹99.',
        'pizza',
        14900,
        '[{"label":"Small","priceCents":14900},{"label":"Large","priceCents":19900}]'::jsonb,
        '[{"name":"Pepperoni","priceCents":6500},{"name":"Sausage","priceCents":6000},{"name":"Mushrooms","priceCents":2500},{"name":"Onions","priceCents":1500},{"name":"Ham","priceCents":4500},{"name":"Canadian Bacon","priceCents":5500},{"name":"Pineapple","priceCents":2000},{"name":"Eggplant","priceCents":2500},{"name":"Tomato & Basil","priceCents":2000},{"name":"Green Peppers","priceCents":1500},{"name":"Hamburger","priceCents":5500},{"name":"Spinach","priceCents":2000},{"name":"Artichoke","priceCents":3500},{"name":"Buffalo Chicken","priceCents":6500},{"name":"Barbecue Chicken","priceCents":6500},{"name":"Anchovies","priceCents":6000},{"name":"Black Olives","priceCents":1500},{"name":"Jalapenos","priceCents":1500},{"name":"Fresh Garlic","priceCents":1000},{"name":"Zucchini","priceCents":1500},{"name":"Special (Chef''s Choice)","priceCents":9900}]'::jsonb,
        '[]'::jsonb,
        NULL
    ),
    (
        'c0000000-0000-4000-8000-000000000031',
        'Sicilian Pizza',
        'Thick-cut Sicilian base: ₹249 small / ₹349 large. Toppings add ₹10–70 each; the Special adds ₹149.',
        'sicilian',
        24900,
        '[{"label":"Small","priceCents":24900},{"label":"Large","priceCents":34900}]'::jsonb,
        '[{"name":"Pepperoni","priceCents":6500},{"name":"Sausage","priceCents":6000},{"name":"Mushrooms","priceCents":2500},{"name":"Onions","priceCents":1500},{"name":"Ham","priceCents":4500},{"name":"Canadian Bacon","priceCents":5500},{"name":"Pineapple","priceCents":2000},{"name":"Eggplant","priceCents":2500},{"name":"Tomato & Basil","priceCents":2000},{"name":"Green Peppers","priceCents":1500},{"name":"Hamburger","priceCents":5500},{"name":"Spinach","priceCents":2000},{"name":"Artichoke","priceCents":3500},{"name":"Buffalo Chicken","priceCents":6500},{"name":"Barbecue Chicken","priceCents":6500},{"name":"Anchovies","priceCents":6000},{"name":"Black Olives","priceCents":1500},{"name":"Jalapenos","priceCents":1500},{"name":"Fresh Garlic","priceCents":1000},{"name":"Zucchini","priceCents":1500},{"name":"Special (Chef''s Choice)","priceCents":14900}]'::jsonb,
        '[]'::jsonb,
        NULL
    );

-- ---------------------------------------------------------------------------
-- Subs (sizes + add-ons)
-- ---------------------------------------------------------------------------
INSERT INTO products (
    id,
    name,
    description,
    category,
    price_cents,
    sizes,
    toppings,
    add_ons,
    image_url
)
VALUES
    ('c0000000-0000-4000-8000-000000000032', 'Cheese Sub', '', 'subs', 11900, '[{"label":"Small","priceCents":11900},{"label":"Large","priceCents":15900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000033', 'Italian Sub', '', 'subs', 15900, '[{"label":"Small","priceCents":15900},{"label":"Large","priceCents":21900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000034', 'Ham + Cheese Sub', '', 'subs', 12900, '[{"label":"Small","priceCents":12900},{"label":"Large","priceCents":17900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000035', 'Meatball Sub', '', 'subs', 15900, '[{"label":"Small","priceCents":15900},{"label":"Large","priceCents":21900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000036', 'Tuna Sub', '', 'subs', 13900, '[{"label":"Small","priceCents":13900},{"label":"Large","priceCents":18900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000037', 'Turkey Sub', '', 'subs', 13900, '[{"label":"Small","priceCents":13900},{"label":"Large","priceCents":18900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000038', 'Chicken Parmigiana Sub', '', 'subs', 15900, '[{"label":"Small","priceCents":15900},{"label":"Large","priceCents":21900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000039', 'Eggplant Parmigiana Sub', '', 'subs', 11900, '[{"label":"Small","priceCents":11900},{"label":"Large","priceCents":16900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000040', 'Steak Sub', '', 'subs', 13900, '[{"label":"Small","priceCents":13900},{"label":"Large","priceCents":18900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000041', 'Steak + Cheese Sub', '', 'subs', 14900, '[{"label":"Small","priceCents":14900},{"label":"Large","priceCents":19900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000042', 'Sausage, Peppers & Onions Sub', '', 'subs', 15900, '[]'::jsonb, '[]'::jsonb, '[{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000043', 'Hamburger Sub', '', 'subs', 10900, '[{"label":"Small","priceCents":10900},{"label":"Large","priceCents":15900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000044', 'Cheeseburger Sub', '', 'subs', 11900, '[{"label":"Small","priceCents":11900},{"label":"Large","priceCents":16900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000045', 'Fried Chicken Sub', '', 'subs', 15900, '[{"label":"Small","priceCents":15900},{"label":"Large","priceCents":21900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000046', 'Veggie Sub', '', 'subs', 11900, '[{"label":"Small","priceCents":11900},{"label":"Large","priceCents":16900}]'::jsonb, '[]'::jsonb, '[{"name":"+ Mushrooms","priceCents":2000},{"name":"+ Green Peppers","priceCents":2000},{"name":"+ Onions","priceCents":2000},{"name":"Extra Cheese","priceCents":2000}]'::jsonb, NULL);

-- ---------------------------------------------------------------------------
-- Pasta
-- ---------------------------------------------------------------------------
INSERT INTO products (id, name, description, category, price_cents, image_url)
VALUES
    ('c0000000-0000-4000-8000-000000000047', 'Baked Ziti w/Mozzarella', '', 'pasta', 14900, NULL),
    ('c0000000-0000-4000-8000-000000000048', 'Baked Ziti w/Meatballs', '', 'pasta', 16900, NULL),
    ('c0000000-0000-4000-8000-000000000049', 'Baked Ziti w/Chicken', '', 'pasta', 18900, NULL);

-- ---------------------------------------------------------------------------
-- Salads
-- ---------------------------------------------------------------------------
INSERT INTO products (id, name, description, category, price_cents, image_url)
VALUES
    ('c0000000-0000-4000-8000-000000000050', 'Garden Salad', '', 'salads', 10900, NULL),
    ('c0000000-0000-4000-8000-000000000051', 'Greek Salad', '', 'salads', 12900, NULL),
    ('c0000000-0000-4000-8000-000000000052', 'Antipasto or Tuna Salad', '', 'salads', 14900, NULL),
    ('c0000000-0000-4000-8000-000000000053', 'Salad w/Chicken (breaded)', '', 'salads', 15900, NULL);

-- ---------------------------------------------------------------------------
-- Dinner Platters (small / large)
-- ---------------------------------------------------------------------------
INSERT INTO products (id, name, description, category, price_cents, sizes, image_url)
VALUES
    ('c0000000-0000-4000-8000-000000000054', 'Garden Salad Platter', '', 'platters', 29900, '[{"label":"Small","priceCents":29900},{"label":"Large","priceCents":44900}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000055', 'Greek Salad Platter', '', 'platters', 39900, '[{"label":"Small","priceCents":39900},{"label":"Large","priceCents":54900}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000056', 'Antipasto Platter', '', 'platters', 39900, '[{"label":"Small","priceCents":39900},{"label":"Large","priceCents":54900}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000057', 'Baked Ziti Platter', '', 'platters', 29900, '[{"label":"Small","priceCents":29900},{"label":"Large","priceCents":44900}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000058', 'Meatball Parm Platter', '', 'platters', 39900, '[{"label":"Small","priceCents":39900},{"label":"Large","priceCents":54900}]'::jsonb, NULL),
    ('c0000000-0000-4000-8000-000000000059', 'Chicken Parm Platter', '', 'platters', 44900, '[{"label":"Small","priceCents":44900},{"label":"Large","priceCents":59900}]'::jsonb, NULL);

COMMIT;