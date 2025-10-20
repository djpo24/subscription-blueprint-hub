
-- Eliminar clientes de prueba y sus datos relacionados
-- Cada DELETE usa su propia subconsulta

-- 1. Eliminar registros en notification_log
DELETE FROM public.notification_log
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 2. Eliminar registros en sent_messages
DELETE FROM public.sent_messages
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 3. Eliminar registros en incoming_messages
DELETE FROM public.incoming_messages
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 4. Eliminar registros en ai_chat_interactions
DELETE FROM public.ai_chat_interactions
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 5. Eliminar registros en point_redemptions
DELETE FROM public.point_redemptions
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 6. Eliminar registros en bulk_fidelization_log
DELETE FROM public.bulk_fidelization_log
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 7. Eliminar registros en trip_notification_log
DELETE FROM public.trip_notification_log
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 8. Actualizar packages para quitar la referencia al cliente
UPDATE public.packages
SET customer_id = NULL
WHERE customer_id IN (
  SELECT id FROM public.customers
  WHERE 
    name ILIKE '%test%' 
    OR (
      (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
      AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
    )
);

-- 9. Finalmente, eliminar los clientes
DELETE FROM public.customers
WHERE 
  name ILIKE '%test%' 
  OR (
    (phone IS NULL OR phone = '' OR phone = '0' OR phone = '0000000000') 
    AND (whatsapp_number IS NULL OR whatsapp_number = '' OR whatsapp_number = '0' OR whatsapp_number = '0000000000')
  );
