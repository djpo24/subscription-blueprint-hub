
-- Eliminar todos los correos electrónicos de todos los clientes
-- Esto establecerá el campo email como cadena vacía para todos los registros

UPDATE customers 
SET email = '';

-- Mostrar cuántos registros fueron actualizados
SELECT COUNT(*) as total_clientes_actualizados 
FROM customers 
WHERE email = '';
