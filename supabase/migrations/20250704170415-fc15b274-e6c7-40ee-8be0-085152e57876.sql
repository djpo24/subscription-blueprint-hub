
-- Corregir números de teléfono sin el símbolo + en todas las tablas relevantes

-- 1. Actualizar tabla customers - campo phone
UPDATE public.customers 
SET phone = CASE
  WHEN phone ~ '^599[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^57[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^52[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^1[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^501[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  ELSE phone
END
WHERE phone IS NOT NULL 
AND phone != '' 
AND phone !~ '^\+';

-- 2. Actualizar tabla customers - campo whatsapp_number
UPDATE public.customers 
SET whatsapp_number = CASE
  WHEN whatsapp_number ~ '^599[0-9]+' AND whatsapp_number !~ '^\+' THEN '+' || whatsapp_number
  WHEN whatsapp_number ~ '^57[0-9]+' AND whatsapp_number !~ '^\+' THEN '+' || whatsapp_number
  WHEN whatsapp_number ~ '^52[0-9]+' AND whatsapp_number !~ '^\+' THEN '+' || whatsapp_number
  WHEN whatsapp_number ~ '^1[0-9]+' AND whatsapp_number !~ '^\+' THEN '+' || whatsapp_number
  WHEN whatsapp_number ~ '^501[0-9]+' AND whatsapp_number !~ '^\+' THEN '+' || whatsapp_number
  ELSE whatsapp_number
END
WHERE whatsapp_number IS NOT NULL 
AND whatsapp_number != '' 
AND whatsapp_number !~ '^\+';

-- 3. Actualizar tabla incoming_messages - campo from_phone
UPDATE public.incoming_messages 
SET from_phone = CASE
  WHEN from_phone ~ '^599[0-9]+' AND from_phone !~ '^\+' THEN '+' || from_phone
  WHEN from_phone ~ '^57[0-9]+' AND from_phone !~ '^\+' THEN '+' || from_phone
  WHEN from_phone ~ '^52[0-9]+' AND from_phone !~ '^\+' THEN '+' || from_phone
  WHEN from_phone ~ '^1[0-9]+' AND from_phone !~ '^\+' THEN '+' || from_phone
  WHEN from_phone ~ '^501[0-9]+' AND from_phone !~ '^\+' THEN '+' || from_phone
  ELSE from_phone
END
WHERE from_phone IS NOT NULL 
AND from_phone != '' 
AND from_phone !~ '^\+';

-- 4. Actualizar tabla sent_messages - campo phone
UPDATE public.sent_messages 
SET phone = CASE
  WHEN phone ~ '^599[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^57[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^52[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^1[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^501[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  ELSE phone
END
WHERE phone IS NOT NULL 
AND phone != '' 
AND phone !~ '^\+';

-- 5. Actualizar tabla message_delivery_status - campo recipient_phone
UPDATE public.message_delivery_status 
SET recipient_phone = CASE
  WHEN recipient_phone ~ '^599[0-9]+' AND recipient_phone !~ '^\+' THEN '+' || recipient_phone
  WHEN recipient_phone ~ '^57[0-9]+' AND recipient_phone !~ '^\+' THEN '+' || recipient_phone
  WHEN recipient_phone ~ '^52[0-9]+' AND recipient_phone !~ '^\+' THEN '+' || recipient_phone
  WHEN recipient_phone ~ '^1[0-9]+' AND recipient_phone !~ '^\+' THEN '+' || recipient_phone
  WHEN recipient_phone ~ '^501[0-9]+' AND recipient_phone !~ '^\+' THEN '+' || recipient_phone
  ELSE recipient_phone
END
WHERE recipient_phone IS NOT NULL 
AND recipient_phone != '' 
AND recipient_phone !~ '^\+';

-- 6. Actualizar tabla trip_notification_log - campo customer_phone
UPDATE public.trip_notification_log 
SET customer_phone = CASE
  WHEN customer_phone ~ '^599[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^57[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^52[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^1[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^501[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  ELSE customer_phone
END
WHERE customer_phone IS NOT NULL 
AND customer_phone != '' 
AND customer_phone !~ '^\+';

-- 7. Actualizar tabla marketing_contacts - campo phone_number
UPDATE public.marketing_contacts 
SET phone_number = CASE
  WHEN phone_number ~ '^599[0-9]+' AND phone_number !~ '^\+' THEN '+' || phone_number
  WHEN phone_number ~ '^57[0-9]+' AND phone_number !~ '^\+' THEN '+' || phone_number
  WHEN phone_number ~ '^52[0-9]+' AND phone_number !~ '^\+' THEN '+' || phone_number
  WHEN phone_number ~ '^1[0-9]+' AND phone_number !~ '^\+' THEN '+' || phone_number
  WHEN phone_number ~ '^501[0-9]+' AND phone_number !~ '^\+' THEN '+' || phone_number
  ELSE phone_number
END
WHERE phone_number IS NOT NULL 
AND phone_number != '' 
AND phone_number !~ '^\+';

-- 8. Actualizar tabla marketing_message_log - campo customer_phone
UPDATE public.marketing_message_log 
SET customer_phone = CASE
  WHEN customer_phone ~ '^599[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^57[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^52[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^1[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^501[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  ELSE customer_phone
END
WHERE customer_phone IS NOT NULL 
AND customer_phone != '' 
AND customer_phone !~ '^\+';

-- 9. Actualizar tabla admin_escalations - campo customer_phone
UPDATE public.admin_escalations 
SET customer_phone = CASE
  WHEN customer_phone ~ '^599[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^57[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^52[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^1[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  WHEN customer_phone ~ '^501[0-9]+' AND customer_phone !~ '^\+' THEN '+' || customer_phone
  ELSE customer_phone
END
WHERE customer_phone IS NOT NULL 
AND customer_phone != '' 
AND customer_phone !~ '^\+';

-- 10. Actualizar tabla travelers - campo phone
UPDATE public.travelers 
SET phone = CASE
  WHEN phone ~ '^599[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^57[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^52[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^1[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^501[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  ELSE phone
END
WHERE phone IS NOT NULL 
AND phone != '' 
AND phone !~ '^\+';

-- 11. Actualizar tabla user_profiles - campo phone
UPDATE public.user_profiles 
SET phone = CASE
  WHEN phone ~ '^599[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^57[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^52[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^1[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  WHEN phone ~ '^501[0-9]+' AND phone !~ '^\+' THEN '+' || phone
  ELSE phone
END
WHERE phone IS NOT NULL 
AND phone != '' 
AND phone !~ '^\+';

-- Verificar los cambios realizados
SELECT 
  'customers_phone' as tabla,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN phone LIKE '+%' THEN 1 END) as con_plus,
  COUNT(CASE WHEN phone NOT LIKE '+%' AND phone IS NOT NULL AND phone != '' THEN 1 END) as sin_plus
FROM public.customers
WHERE phone IS NOT NULL AND phone != ''

UNION ALL

SELECT 
  'customers_whatsapp' as tabla,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN whatsapp_number LIKE '+%' THEN 1 END) as con_plus,
  COUNT(CASE WHEN whatsapp_number NOT LIKE '+%' AND whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN 1 END) as sin_plus
FROM public.customers
WHERE whatsapp_number IS NOT NULL AND whatsapp_number != ''

UNION ALL

SELECT 
  'incoming_messages' as tabla,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN from_phone LIKE '+%' THEN 1 END) as con_plus,
  COUNT(CASE WHEN from_phone NOT LIKE '+%' AND from_phone IS NOT NULL AND from_phone != '' THEN 1 END) as sin_plus
FROM public.incoming_messages
WHERE from_phone IS NOT NULL AND from_phone != '';
