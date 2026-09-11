-- ============================================================================
-- Pizza Shop - Development Seed Data (order-service / pizza_shop_orders)
-- Idempotent: seed rows (fixed UUID a0000000-…) are re-created on re-seed.
-- Take-away only: statuses are pending/confirmed/preparing/ready/completed/cancelled.
-- ============================================================================

BEGIN;

DELETE FROM orders WHERE id::text LIKE 'a0000000-%';

INSERT INTO orders (
    id,
    customer_name,
    customer_email,
    items,
    address,
    payment_method,
    total_cents,
    status,
    created_at
)
VALUES
    (
        'a0000000-0000-4000-8000-000000000001',
        'Abhinab Choudhury',
        'abhinabchoudhury291@gmail.com',
        '[{"id":"c0000000-0000-4000-8000-000000000030","name":"Regular Pizza","quantity":2,"priceCents":239500,"options":{"size":"Large","toppings":["Pepperoni","Mushrooms"]}}]'::jsonb,
        NULL,
        'cash',
        479000,
        'preparing',
        now() - interval '8 minutes'
    ),
    (
        'a0000000-0000-4000-8000-000000000002',
        'Demo User',
        'demo@pizzashop.com',
        '[{"id":"c0000000-0000-4000-8000-000000000038","name":"Chicken Parmigiana Sub","quantity":1,"priceCents":152500,"options":{"size":"Large","addOns":["Extra Cheese"]}}]'::jsonb,
        NULL,
        'card',
        152500,
        'ready',
        now() - interval '22 minutes'
    ),
    (
        'a0000000-0000-4000-8000-000000000003',
        'Rahul Verma',
        'rahul@example.com',
        '[{"id":"c0000000-0000-4000-8000-000000000031","name":"Sicilian Pizza","quantity":1,"priceCents":312500,"options":{"size":"Small","toppings":["Eggplant"]}},{"id":"c0000000-0000-4000-8000-000000000051","name":"Greek Salad","quantity":1,"priceCents":124500}]'::jsonb,
        NULL,
        'upi',
        437000,
        'pending',
        now() - interval '1 hour'
    ),
    (
        'a0000000-0000-4000-8000-000000000004',
        'Maria Souza',
        'maria@example.com',
        '[{"id":"c0000000-0000-4000-8000-000000000032","name":"Cheese Sub","quantity":1,"priceCents":109500,"options":{"size":"Small"}},{"id":"c0000000-0000-4000-8000-000000000047","name":"Baked Ziti w/Mozzarella","quantity":1,"priceCents":127500}]'::jsonb,
        NULL,
        'card',
        237000,
        'completed',
        now() - interval '1 day'
    ),
    (
        'a0000000-0000-4000-8000-000000000005',
        'John Carter',
        'john@example.com',
        '[{"id":"c0000000-0000-4000-8000-000000000054","name":"Garden Salad Platter","quantity":1,"priceCents":425000,"options":{"size":"Small"}}]'::jsonb,
        NULL,
        'cash',
        425000,
        'completed',
        now() - interval '2 days'
    ),
    (
        'a0000000-0000-4000-8000-000000000006',
        'Sofia Khan',
        'sofia@example.com',
        '[{"id":"c0000000-0000-4000-8000-000000000035","name":"Meatball Sub","quantity":1,"priceCents":135000,"options":{"size":"Large"}}]'::jsonb,
        NULL,
        'upi',
        135000,
        'cancelled',
        now() - interval '3 days'
    )
ON CONFLICT (id) DO NOTHING;

COMMIT;