-- Test environment only. No raw birth form or payment-card data is stored.
CREATE TABLE IF NOT EXISTS aurora_test_checkout (
  id uuid PRIMARY KEY,
  session_hash char(64) NOT NULL,
  idempotency_key uuid NOT NULL,
  request_hash char(64) NOT NULL,
  product_id text NOT NULL CHECK (product_id IN ('natal','relocation')),
  amount_minor integer NOT NULL CHECK (amount_minor > 0),
  merchant_id text NOT NULL DEFAULT '1511648' CHECK (merchant_id = '1511648'),
  test_mode boolean NOT NULL DEFAULT true CHECK (test_mode),
  payment_id uuid UNIQUE,
  confirmation_url text,
  status text NOT NULL DEFAULT 'creating' CHECK (status IN ('creating','pending','ready','canceled','refunded')),
  report jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now() + interval '7 days',
  paid_verified_at timestamptz,
  UNIQUE (session_hash, idempotency_key),
  CHECK (status <> 'ready' OR (payment_id IS NOT NULL AND paid_verified_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS aurora_checkout_session_created ON aurora_test_checkout (session_hash, created_at DESC);
CREATE INDEX IF NOT EXISTS aurora_checkout_created ON aurora_test_checkout (created_at DESC);
