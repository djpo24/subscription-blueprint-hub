-- Crear tabla para sesiones de escaneo
CREATE TABLE scan_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  barcode text NOT NULL,
  scanned_at timestamp with time zone DEFAULT now(),
  processed boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_scan_sessions_session_id ON scan_sessions(session_id);
CREATE INDEX idx_scan_sessions_processed ON scan_sessions(processed);

-- Habilitar Row Level Security
ALTER TABLE scan_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own scans"
ON scan_sessions FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view all scans"
ON scan_sessions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can update scans"
ON scan_sessions FOR UPDATE
TO authenticated
USING (true);

-- Habilitar Realtime para la tabla
ALTER PUBLICATION supabase_realtime ADD TABLE scan_sessions;