-- Agregar política de lectura para usuarios autenticados en bulk_fidelization_settings
CREATE POLICY "Users can view bulk fidelization settings"
  ON public.bulk_fidelization_settings
  FOR SELECT
  USING (true);

-- Agregar política de lectura para usuarios autenticados en bulk_fidelization_log
CREATE POLICY "Users can view bulk fidelization log"
  ON public.bulk_fidelization_log
  FOR SELECT
  USING (true);