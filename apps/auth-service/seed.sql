-- ============================================================================
-- Pizza Shop - Development Seed Data (auth-service / pizza_shop_auth)
-- Idempotent: existing rows (matched by unique key) are left untouched.
--
-- Seeded credentials:
--   Admin user        : admin@pizzashop.com / Password123! (email verified)
--   Demo user         : demo@pizzashop.com / Password123!  (email verified)
--   Order service    : client_id=svc_order-service_dev    / client_secret=order-service-dev-secret
--   Payment service  : client_id=svc_payment-service_dev  / client_secret=payment-service-dev-secret
--   Product service  : client_id=svc_product-service_dev  / client_secret=product-service-dev-secret
--   Email service    : client_id=svc_email-service_dev    / client_secret=email-service-dev-secret
--
-- Service tokens: POST http://localhost:3002/auth/service/token
--   { "clientId": "<client_id>", "clientSecret": "<client_secret>" }
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- Users
-- Password (Password123!) stored as an @node-rs/argon2 argon2id hash.
-- ---------------------------------------------------------------------------
INSERT INTO users (
    email,
    name,
    password_hash,
    email_verified,
    role,
    status
)
VALUES (
    'admin@pizzashop.com',
    'Store Admin',
    '$argon2id$v=19$m=19456,t=2,p=1$J8WqMc+hVahXIcDw+nC4tQ$6vHH08qrFqsjcHeJ93u+zj5MmluL+yyGhf6//KDZwas',
    true,          -- email_verified
    'admin',       -- role
    'active'       -- status
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (
    email,
    name,
    password_hash,
    email_verified,
    status
)
VALUES (
    'demo@pizzashop.com',
    'Demo User',
    '$argon2id$v=19$m=19456,t=2,p=1$J8WqMc+hVahXIcDw+nC4tQ$6vHH08qrFqsjcHeJ93u+zj5MmluL+yyGhf6//KDZwas',
    true,          -- email_verified
    'active'       -- status
)
ON CONFLICT (email) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Service accounts (microservice-to-microservice auth)
-- ---------------------------------------------------------------------------
INSERT INTO service_accounts (
    service_id,
    client_id,
    client_secret_hash,
    allowed_scopes,
    is_active
)
VALUES
    (
        'order-service',
        'svc_order-service_dev',
        '$argon2id$v=19$m=19456,t=2,p=1$zupQik0vumbc6wIN2sCpoA$MDzHU8Y/XPf/nrwTDEp+L3lkRj+qih2Tr/T+zMuRBsw',
        ARRAY['order:read', 'order:write', 'order:status'],
        true
    ),
    (
        'payment-service',
        'svc_payment-service_dev',
        '$argon2id$v=19$m=19456,t=2,p=1$CO1B6ZxvdhVtUKFxXc0pKg$oyBalVpBE9WbQCVDKTpK6X3aTbeBBZLRbgxyGEsZmYg',
        ARRAY['payment:read', 'payment:write'],
        true
    ),
    (
        'product-service',
        'svc_product-service_dev',
        '$argon2id$v=19$m=19456,t=2,p=1$wcCuOib3TRSWIz4LXjCWYw$U7QjklAsTqjWw1AE5gTXf+DbCPpWYQJhuh1F5AD4jIU',
        ARRAY['product:read', 'product:write'],
        true
    ),
    (
        'email-service',
        'svc_email-service_dev',
        '$argon2id$v=19$m=19456,t=2,p=1$aJewpCvfPC8UD4frOYMpSg$yqe4Vn8CFSogg04w8WqaE+6S/qyGOipndXiuTwJg4oo',
        ARRAY['email:send'],
        true
    )
ON CONFLICT (service_id) DO NOTHING;

COMMIT;