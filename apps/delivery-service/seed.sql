-- Delivery zones (idempotent: skipped if a zone with the same name already exists)
INSERT INTO delivery_zones (name, description, fee_cents, is_active)
SELECT 'Central District', 'CBD and immediate surroundings', 2900, true
WHERE NOT EXISTS (SELECT 1 FROM delivery_zones WHERE name = 'Central District');

INSERT INTO delivery_zones (name, description, fee_cents, is_active)
SELECT 'North Hills', 'Northern residential area', 4900, true
WHERE NOT EXISTS (SELECT 1 FROM delivery_zones WHERE name = 'North Hills');

INSERT INTO delivery_zones (name, description, fee_cents, is_active)
SELECT 'South Ferry', 'Southern waterfront neighborhoods', 5900, true
WHERE NOT EXISTS (SELECT 1 FROM delivery_zones WHERE name = 'South Ferry');