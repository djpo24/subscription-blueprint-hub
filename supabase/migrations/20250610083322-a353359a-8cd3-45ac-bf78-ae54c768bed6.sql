
-- Actualizar encomiendas que están en estado "en transito" a "recibido"
UPDATE public.packages 
SET status = 'recibido', updated_at = now()
WHERE status IN ('en transito', 'transito', 'in_transit');

-- Insertar eventos de tracking para registrar el cambio
INSERT INTO public.tracking_events (package_id, event_type, description, location)
SELECT 
  id as package_id,
  'status_change' as event_type,
  'Estado cambiado de "en transito" a "recibido" - Actualización masiva' as description,
  destination as location
FROM public.packages 
WHERE status = 'recibido' 
AND updated_at > now() - INTERVAL '1 minute';
