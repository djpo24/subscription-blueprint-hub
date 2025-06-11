
-- Revertir todos los paquetes de "transito" a "despachado"
UPDATE packages 
SET 
  status = 'despachado',
  updated_at = now()
WHERE status = 'transito';

-- Revertir todos los despachos de "en_transito" a "pending" 
UPDATE dispatch_relations 
SET 
  status = 'pending',
  updated_at = now()
WHERE status = 'en_transito';

-- Crear eventos de tracking para registrar esta reversión de emergencia
INSERT INTO tracking_events (package_id, event_type, description, location)
SELECT 
  p.id as package_id,
  'status_change' as event_type,
  'REVERSIÓN DE EMERGENCIA: Estado cambiado de "transito" a "despachado" por vuelo en producción' as description,
  COALESCE(p.destination, 'Sistema') as location
FROM packages p
WHERE p.status = 'despachado' 
AND p.updated_at > now() - INTERVAL '1 minute'; -- Solo los que acabamos de revertir

-- Mostrar resumen de los cambios realizados
SELECT 
  'Paquetes revertidos' as tipo,
  COUNT(*) as cantidad
FROM packages 
WHERE status = 'despachado' 
AND updated_at > now() - INTERVAL '1 minute'
UNION ALL
SELECT 
  'Despachos revertidos' as tipo,
  COUNT(*) as cantidad
FROM dispatch_relations 
WHERE status = 'pending' 
AND updated_at > now() - INTERVAL '1 minute';
