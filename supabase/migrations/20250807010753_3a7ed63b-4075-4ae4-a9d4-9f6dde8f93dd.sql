
-- Corregir la ruta del viaje del 6 de agosto de 2025
UPDATE trips 
SET 
  origin = 'Barranquilla',
  destination = 'Curazao',
  updated_at = now()
WHERE trip_date = '2025-08-06' 
  AND origin = 'Curazao' 
  AND destination = 'Barranquilla';
