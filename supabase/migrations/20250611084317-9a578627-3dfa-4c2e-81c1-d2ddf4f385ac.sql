
-- Actualizar la constraint de estados válidos para incluir "despachado"
ALTER TABLE packages DROP CONSTRAINT IF EXISTS packages_status_check;

-- Crear la nueva constraint con el estado "despachado" incluido
ALTER TABLE packages ADD CONSTRAINT packages_status_check 
CHECK (status IN (
  'recibido', 
  'bodega', 
  'procesado', 
  'despachado',
  'transito', 
  'en_destino', 
  'delivered',
  'pending',
  'arrived',
  'in_transit',
  'delayed',
  'warehouse'
));
