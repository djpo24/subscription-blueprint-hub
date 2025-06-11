
-- Migración de emergencia para revertir estados de paquetes y despachos
-- Fecha: 2025-06-11

-- PASO 1: Revertir TODOS los paquetes que están en "transito" a "despachado"
UPDATE packages 
SET 
  status = 'despachado',
  updated_at = now()
WHERE status = 'transito';

-- PASO 2: Revertir TODOS los despachos que están en "en_transito" a "pending"
UPDATE dispatch_relations 
SET 
  status = 'pending',
  updated_at = now()
WHERE status = 'en_transito';

-- PASO 3: Crear eventos de tracking para registrar esta reversión
INSERT INTO tracking_events (package_id, event_type, description, location)
SELECT 
  p.id as package_id,
  'emergency_revert' as event_type,
  'REVERSIÓN DE EMERGENCIA: Paquete revertido de "transito" a "despachado"' as description,
  COALESCE(p.destination, 'Sistema') as location
FROM packages p
WHERE p.status = 'despachado' 
AND p.updated_at > now() - INTERVAL '5 minutes';

-- PASO 4: Verificar los cambios realizados
SELECT 
  'Antes de la reversión - Paquetes en tránsito' as estado,
  0 as cantidad_actual,
  (SELECT COUNT(*) FROM packages WHERE status = 'despachado' AND updated_at > now() - INTERVAL '5 minutes') as cantidad_revertida
UNION ALL
SELECT 
  'Antes de la reversión - Despachos en tránsito' as estado,
  0 as cantidad_actual,
  (SELECT COUNT(*) FROM dispatch_relations WHERE status = 'pending' AND updated_at > now() - INTERVAL '5 minutes') as cantidad_revertida
UNION ALL
SELECT 
  'Estado actual - Paquetes en tránsito' as estado,
  (SELECT COUNT(*) FROM packages WHERE status = 'transito') as cantidad_actual,
  0 as cantidad_revertida
UNION ALL
SELECT 
  'Estado actual - Despachos en tránsito' as estado,
  (SELECT COUNT(*) FROM dispatch_relations WHERE status = 'en_transito') as cantidad_actual,
  0 as cantidad_revertida;
