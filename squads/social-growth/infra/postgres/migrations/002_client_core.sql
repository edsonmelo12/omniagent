CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id uuid NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  website_url text,
  segment text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agency_id, slug)
);

CREATE TABLE client_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  url text NOT NULL,
  label text,
  source_type text NOT NULL DEFAULT 'website',
  confidence integer NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clients_agency_status_idx ON clients (agency_id, status);
CREATE INDEX client_sites_client_idx ON client_sites (client_id);

CREATE TRIGGER clients_set_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER client_sites_set_updated_at
BEFORE UPDATE ON client_sites
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

