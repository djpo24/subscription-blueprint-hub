
-- Eliminar todos los números de cédula de todos los clientes
-- Esto establecerá el campo id_number como NULL para todos los registros

UPDATE customers 
SET id_number = NULL;

-- Mostrar cuántos registros fueron actualizados
SELECT COUNT(*) as total_clientes_actualizados 
FROM customers 
WHERE id_number IS NULL;
