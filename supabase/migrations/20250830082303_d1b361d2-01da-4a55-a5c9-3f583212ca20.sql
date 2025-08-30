
-- Permitir que el sistema inserte en trip_notification_log para pruebas
DROP POLICY IF EXISTS "System can manage trip notification logs" ON public.trip_notification_log;
CREATE POLICY "System can manage trip notification logs" 
  ON public.trip_notification_log 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Permitir que el sistema actualice trip_notification_log
DROP POLICY IF EXISTS "System can update trip notification logs" ON public.trip_notification_log;
CREATE POLICY "System can update trip notification logs" 
  ON public.trip_notification_log 
  FOR UPDATE 
  USING (true);

-- Asegurar que el sistema puede manejar notification_log (ya existe pero verificar)
DROP POLICY IF EXISTS "System can manage notification log" ON public.notification_log;
CREATE POLICY "System can manage notification log" 
  ON public.notification_log 
  FOR ALL 
  USING (true)
  WITH CHECK (true);
