
-- Forzar TODOS los despachos a estado "pending"
UPDATE dispatch_relations 
SET 
  status = 'pending',
  updated_at = now();

-- Verificar el resultado
SELECT 
  status,
  COUNT(*) as cantidad
FROM dispatch_relations 
GROUP BY status
ORDER BY status;

-- Mostrar todos los despachos actualizados
SELECT 
  id,
  dispatch_date,
  status,
  total_packages,
  updated_at
FROM dispatch_relations 
ORDER BY dispatch_date DESC;
