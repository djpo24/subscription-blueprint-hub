
-- Eliminar correos temporales de la tabla customers
-- Esto incluye correos que terminan en @temp.com, @temporal.com, @exemplo.com, @test.com
-- y otros dominios temporales comunes que se pudieron haber usado

UPDATE customers 
SET email = ''
WHERE email LIKE '%@temp.com' 
   OR email LIKE '%@temporal.com'
   OR email LIKE '%@exemplo.com' 
   OR email LIKE '%@test.com'
   OR email LIKE '%@tempmail.org'
   OR email LIKE '%@10minutemail.com'
   OR email LIKE '%@guerrillamail.com'
   OR email LIKE '%@mailinator.com'
   OR email LIKE '%@temp-mail.org'
   OR email LIKE '%@throwaway.email'
   OR email LIKE '%@maildrop.cc'
   OR email LIKE '%@yopmail.com'
   OR email ~ '^[0-9]+@temp\.com$'  -- Emails que son solo números seguidos de @temp.com
   OR email ~ '^[0-9]+@temporal\.com$';  -- Emails que son solo números seguidos de @temporal.com

-- Mostrar cuántos registros fueron actualizados
-- (Esta consulta se ejecutará después de la actualización para mostrar el resultado)
SELECT COUNT(*) as registros_actualizados 
FROM customers 
WHERE email = '';
