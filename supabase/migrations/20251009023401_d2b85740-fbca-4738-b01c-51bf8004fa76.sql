-- Actualizar políticas RLS para scan_sessions para permitir uso sin autenticación

DROP POLICY IF EXISTS "Users can insert their own scans" ON scan_sessions;
DROP POLICY IF EXISTS "Users can view all scans" ON scan_sessions;
DROP POLICY IF EXISTS "Users can update scans" ON scan_sessions;

-- Permitir inserts sin autenticación (para mobile scanner)
CREATE POLICY "Anyone can insert scans"
ON scan_sessions FOR INSERT
WITH CHECK (true);

-- Permitir SELECT solo a usuarios autenticados
CREATE POLICY "Authenticated users can view scans"
ON scan_sessions FOR SELECT
TO authenticated
USING (true);

-- Permitir UPDATE solo a usuarios autenticados
CREATE POLICY "Authenticated users can update scans"
ON scan_sessions FOR UPDATE
TO authenticated
USING (true);