
-- Revisar qué paquetes están asociados al viaje corregido del 6 de agosto de 2025
-- y corregir su origen y destino si es necesario
UPDATE packages 
SET 
  origin = 'Barranquilla',
  destination = 'Curazao',
  updated_at = now()
WHERE trip_id IN (
  SELECT id 
  FROM trips 
  WHERE trip_date = '2025-08-06'
    AND origin = 'Barranquilla'
    AND destination = 'Curazao'
) 
AND (origin = 'Curazao' OR destination = 'Barranquilla');

-- Actualizar eventos de seguimiento que puedan tener ubicaciones incorrectas
UPDATE tracking_events 
SET 
  location = CASE 
    WHEN location = 'Curazao' AND event_type = 'created' THEN 'Barranquilla'
    WHEN location = 'Barranquilla' AND event_type = 'delivered' THEN 'Curazao'
    ELSE location
  END
WHERE package_id IN (
  SELECT id 
  FROM packages 
  WHERE trip_id IN (
    SELECT id 
    FROM trips 
    WHERE trip_date = '2025-08-06'
      AND origin = 'Barranquilla'
      AND destination = 'Curazao'
  )
);

-- Verificar si hay notificaciones de viaje que referencien rutas incorrectas
-- para el viaje del 6 de agosto de 2025
UPDATE trip_notifications 
SET 
  message_template = REPLACE(
    REPLACE(message_template, 'Curazao → Barranquilla', 'Barranquilla → Curazao'),
    'de Curazao a Barranquilla', 'de Barranquilla a Curazao'
  ),
  updated_at = now()
WHERE (outbound_trip_id IN (
  SELECT id 
  FROM trips 
  WHERE trip_date = '2025-08-06'
    AND origin = 'Barranquilla'
    AND destination = 'Curazao'
) OR return_trip_id IN (
  SELECT id 
  FROM trips 
  WHERE trip_date = '2025-08-06'
    AND origin = 'Barranquilla'
    AND destination = 'Curazao'
))
AND (message_template LIKE '%Curazao → Barranquilla%' OR message_template LIKE '%de Curazao a Barranquilla%');

-- Actualizar logs de notificaciones de viaje si contienen información de ruta incorrecta
UPDATE trip_notification_log 
SET 
  personalized_message = REPLACE(
    REPLACE(personalized_message, 'Curazao → Barranquilla', 'Barranquilla → Curazao'),
    'de Curazao a Barranquilla', 'de Barranquilla a Curazao'
  )
WHERE trip_notification_id IN (
  SELECT id 
  FROM trip_notifications 
  WHERE outbound_trip_id IN (
    SELECT id 
    FROM trips 
    WHERE trip_date = '2025-08-06'
      AND origin = 'Barranquilla'
      AND destination = 'Curazao'
  ) OR return_trip_id IN (
    SELECT id 
    FROM trips 
    WHERE trip_date = '2025-08-06'
      AND origin = 'Barranquilla'
      AND destination = 'Curazao'
  )
)
AND (personalized_message LIKE '%Curazao → Barranquilla%' OR personalized_message LIKE '%de Curazao a Barranquilla%');

-- Actualizar registros de mensajes enviados que puedan contener información de ruta incorrecta
UPDATE sent_messages 
SET 
  message = REPLACE(
    REPLACE(message, 'Curazao → Barranquilla', 'Barranquilla → Curazao'),
    'de Curazao a Barranquilla', 'de Barranquilla a Curazao'
  ),
  updated_at = now()
WHERE customer_id IN (
  SELECT DISTINCT customer_id 
  FROM packages 
  WHERE trip_id IN (
    SELECT id 
    FROM trips 
    WHERE trip_date = '2025-08-06'
      AND origin = 'Barranquilla'
      AND destination = 'Curazao'
  )
)
AND (message LIKE '%Curazao → Barranquilla%' OR message LIKE '%de Curazao a Barranquilla%')
AND created_at >= '2025-08-06'::date - interval '7 days';

-- Actualizar logs de notificaciones que puedan contener información de ruta incorrecta
UPDATE notification_log 
SET 
  message = REPLACE(
    REPLACE(message, 'Curazao → Barranquilla', 'Barranquilla → Curazao'),
    'de Curazao a Barranquilla', 'de Barranquilla a Curazao'
  ),
  updated_at = now()
WHERE package_id IN (
  SELECT id 
  FROM packages 
  WHERE trip_id IN (
    SELECT id 
    FROM trips 
    WHERE trip_date = '2025-08-06'
      AND origin = 'Barranquilla'
      AND destination = 'Curazao'
  )
)
AND (message LIKE '%Curazao → Barranquilla%' OR message LIKE '%de Curazao a Barranquilla%');
