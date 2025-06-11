
-- Forzar TODAS las encomiendas a estado "despachado"
UPDATE packages 
SET 
  status = 'despachado',
  updated_at = now();

-- Crear eventos de tracking para registrar este cambio masivo
INSERT INTO tracking_events (package_id, event_type, description, location)
SELECT 
  p.id as package_id,
  'status_change' as event_type,
  'CAMBIO MASIVO: Estado forzado a "despachado" - Recuperación del sistema' as description,
  COALESCE(p.destination, 'Sistema') as location
FROM packages p;

-- Verificar el resultado
SELECT 
  status,
  COUNT(*) as cantidad
FROM packages 
GROUP BY status
ORDER BY status;

-- Mostrar resumen de los cambios realizados
SELECT 
  COUNT(*) as total_encomiendas_actualizadas,
  'Todas las encomiendas forzadas a estado "despachado"' as descripcion
FROM packages 
WHERE updated_at > now() - INTERVAL '1 minute';
