
-- Buscar el número 0000000010 en todas las tablas que contengan números de teléfono

-- 1. Buscar en la tabla customers
SELECT 'customers' as tabla, id, name, phone, whatsapp_number, email
FROM public.customers 
WHERE phone LIKE '%0000000010%' 
   OR whatsapp_number LIKE '%0000000010%';

-- 2. Buscar en la tabla incoming_messages
SELECT 'incoming_messages' as tabla, id, customer_id, from_phone, message_content, timestamp
FROM public.incoming_messages 
WHERE from_phone LIKE '%0000000010%';

-- 3. Buscar en la tabla sent_messages
SELECT 'sent_messages' as tabla, id, customer_id, phone, message, sent_at
FROM public.sent_messages 
WHERE phone LIKE '%0000000010%';

-- 4. Buscar en la tabla message_delivery_status
SELECT 'message_delivery_status' as tabla, id, notification_id, recipient_phone, status, timestamp
FROM public.message_delivery_status 
WHERE recipient_phone LIKE '%0000000010%';

-- 5. Buscar en la tabla travelers (por si acaso)
SELECT 'travelers' as tabla, id, user_id, first_name, last_name, phone
FROM public.travelers 
WHERE phone LIKE '%0000000010%';

-- 6. Buscar en la tabla user_profiles (por si acaso)
SELECT 'user_profiles' as tabla, id, user_id, email, first_name, last_name, phone
FROM public.user_profiles 
WHERE phone LIKE '%0000000010%';

-- 7. Búsqueda más amplia con variaciones del número
SELECT 'customers_variaciones' as tabla, id, name, phone, whatsapp_number
FROM public.customers 
WHERE phone LIKE '%0000000010%' 
   OR whatsapp_number LIKE '%0000000010%'
   OR phone LIKE '%10'
   OR whatsapp_number LIKE '%10';
