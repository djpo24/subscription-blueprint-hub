
-- Actualizar whatsapp_number con los valores de phone en la tabla customers
UPDATE public.customers 
SET whatsapp_number = phone
WHERE phone IS NOT NULL AND phone != '';

-- Verificar los cambios realizados
SELECT 
  'customers_updated' as tabla,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN whatsapp_number IS NOT NULL THEN 1 END) as con_whatsapp,
  COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as con_phone
FROM public.customers;
