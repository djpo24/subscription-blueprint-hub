
-- Purga completa: Actualizar todos los números de teléfono para que coincidan con los perfiles de clientes actuales

-- 1. Actualizar números en incoming_messages
UPDATE public.incoming_messages 
SET from_phone = COALESCE(c.whatsapp_number, c.phone)
FROM public.customers c
WHERE incoming_messages.customer_id = c.id
AND COALESCE(c.whatsapp_number, c.phone) IS NOT NULL
AND incoming_messages.from_phone != COALESCE(c.whatsapp_number, c.phone);

-- 2. Actualizar números en sent_messages
UPDATE public.sent_messages 
SET phone = COALESCE(c.whatsapp_number, c.phone)
FROM public.customers c
WHERE sent_messages.customer_id = c.id
AND COALESCE(c.whatsapp_number, c.phone) IS NOT NULL
AND sent_messages.phone != COALESCE(c.whatsapp_number, c.phone);

-- 3. Actualizar números en message_delivery_status (usando customer_id de notification_log)
UPDATE public.message_delivery_status 
SET recipient_phone = COALESCE(c.whatsapp_number, c.phone)
FROM public.notification_log nl
JOIN public.customers c ON nl.customer_id = c.id
WHERE message_delivery_status.notification_id = nl.id
AND COALESCE(c.whatsapp_number, c.phone) IS NOT NULL
AND message_delivery_status.recipient_phone != COALESCE(c.whatsapp_number, c.phone);

-- 4. Limpiar registros huérfanos sin customer_id válido en incoming_messages
DELETE FROM public.incoming_messages 
WHERE customer_id IS NOT NULL 
AND customer_id NOT IN (SELECT id FROM public.customers);

-- 5. Limpiar registros huérfanos sin customer_id válido en sent_messages
DELETE FROM public.sent_messages 
WHERE customer_id IS NOT NULL 
AND customer_id NOT IN (SELECT id FROM public.customers);

-- 6. Intentar asociar mensajes sin customer_id basándose en el número de teléfono actual
UPDATE public.incoming_messages 
SET customer_id = c.id
FROM public.customers c
WHERE incoming_messages.customer_id IS NULL
AND (incoming_messages.from_phone = c.whatsapp_number OR incoming_messages.from_phone = c.phone)
AND c.whatsapp_number IS NOT NULL OR c.phone IS NOT NULL;

UPDATE public.sent_messages 
SET customer_id = c.id
FROM public.customers c
WHERE sent_messages.customer_id IS NULL
AND (sent_messages.phone = c.whatsapp_number OR sent_messages.phone = c.phone)
AND c.whatsapp_number IS NOT NULL OR c.phone IS NOT NULL;

-- 7. Verificar y reportar el estado después de la purga
-- (Esta consulta nos ayudará a ver el resultado)
SELECT 
    'Clientes con teléfono válido' as tabla,
    COUNT(*) as registros
FROM public.customers 
WHERE whatsapp_number IS NOT NULL OR phone IS NOT NULL

UNION ALL

SELECT 
    'Mensajes entrantes sincronizados' as tabla,
    COUNT(*) as registros
FROM public.incoming_messages im
JOIN public.customers c ON im.customer_id = c.id
WHERE im.from_phone = COALESCE(c.whatsapp_number, c.phone)

UNION ALL

SELECT 
    'Mensajes enviados sincronizados' as tabla,
    COUNT(*) as registros
FROM public.sent_messages sm
JOIN public.customers c ON sm.customer_id = c.id
WHERE sm.phone = COALESCE(c.whatsapp_number, c.phone);
