
-- Actualizar paquetes que están en despachos pero aún tienen estado "procesado" 
-- Cambiarlos al nuevo estado "despachado"
UPDATE packages 
SET 
  status = 'despachado',
  updated_at = now()
WHERE id IN (
  -- Seleccionar paquetes que están en despachos (tabla dispatch_packages)
  SELECT DISTINCT p.id 
  FROM packages p
  INNER JOIN dispatch_packages dp ON p.id = dp.package_id
  INNER JOIN dispatch_relations dr ON dp.dispatch_id = dr.id
  WHERE p.status = 'procesado'  -- Solo los que están en "procesado"
);

-- Crear eventos de tracking para registrar este cambio
INSERT INTO tracking_events (package_id, event_type, description, location)
SELECT 
  p.id as package_id,
  'status_change' as event_type,
  'Estado actualizado de "procesado" a "despachado" - Migración automática tras agregar nuevo estado' as description,
  COALESCE(p.destination, 'Sistema') as location
FROM packages p
INNER JOIN dispatch_packages dp ON p.id = dp.package_id
WHERE p.status = 'despachado' 
AND p.updated_at > now() - INTERVAL '1 minute'; -- Solo los que acabamos de actualizar

-- Mostrar resumen de los cambios realizados
SELECT 
  COUNT(*) as paquetes_actualizados,
  'Estado cambiado de procesado a despachado' as descripcion
FROM packages p
INNER JOIN dispatch_packages dp ON p.id = dp.package_id
WHERE p.status = 'despachado' 
AND p.updated_at > now() - INTERVAL '1 minute';
