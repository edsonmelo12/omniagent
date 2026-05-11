CREATE TABLE evidence_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  related_type text NOT NULL,
  related_id uuid,
  file_url text NOT NULL,
  file_name text,
  file_type text,
  source_url text,
  confidence integer NOT NULL DEFAULT 100 CHECK (confidence >= 0 AND confidence <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX evidence_files_client_idx ON evidence_files (client_id);
CREATE INDEX evidence_files_related_idx ON evidence_files (related_type, related_id);

CREATE TRIGGER evidence_files_set_updated_at
BEFORE UPDATE ON evidence_files
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

