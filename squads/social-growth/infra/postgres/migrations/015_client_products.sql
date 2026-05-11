CREATE TABLE client_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  category text NULL,
  offer_type text NULL,
  price_label text NULL,
  promise text NOT NULL,
  problem_solved text NOT NULL,
  audience text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  priority integer NOT NULL DEFAULT 0,
  landing_url text NULL,
  proof_points_json jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(client_id, slug)
);

CREATE INDEX client_products_client_id_idx
  ON client_products (client_id);

CREATE INDEX client_products_client_id_active_idx
  ON client_products (client_id, is_active DESC, priority DESC, updated_at DESC);

CREATE TRIGGER client_products_set_updated_at
BEFORE UPDATE ON client_products
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
