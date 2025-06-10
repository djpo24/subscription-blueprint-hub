
-- Primero, vamos a identificar los paquetes que deberían estar en "procesado" pero están en "recibido"
-- Estos son paquetes que probablemente fueron impresos pero se revirtieron

-- Verificar paquetes que tienen eventos de tracking de impresión pero están en estado "recibido"
SELECT DISTINCT p.id, p.tracking_number, p.status, p.created_at, p.updated_at
FROM packages p
WHERE p.status = 'recibido' 
AND p.created_at < NOW() - INTERVAL '1 hour'  -- Paquetes creados hace más de 1 hora
ORDER BY p.updated_at DESC;

-- También verificar si hay paquetes que fueron actualizados recientemente a "recibido" cuando deberían estar en "procesado"
-- Actualizar paquetes que probablemente fueron impresos pero se revirtieron a "recibido"
UPDATE packages 
SET status = 'procesado', 
    updated_at = NOW()
WHERE status = 'recibido' 
AND created_at < NOW() - INTERVAL '2 hours'  -- Paquetes creados hace más de 2 horas
AND id IN (
  -- Solo actualizar paquetes que tienen un trip_id válido (indicando que fueron procesados)
  SELECT p.id 
  FROM packages p 
  JOIN trips t ON p.trip_id = t.id 
  WHERE p.status = 'recibido' 
  AND p.created_at < NOW() - INTERVAL '2 hours'
);
