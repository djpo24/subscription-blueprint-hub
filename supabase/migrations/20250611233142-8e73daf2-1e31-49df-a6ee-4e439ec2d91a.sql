
-- Limpiar todos los mensajes entrantes de WhatsApp
DELETE FROM public.incoming_messages;

-- Limpiar todos los mensajes enviados de WhatsApp
DELETE FROM public.sent_messages;

-- Limpiar todos los logs de notificaciones
DELETE FROM public.notification_log;

-- Limpiar estados de entrega de mensajes
DELETE FROM public.message_delivery_status;

-- Opcional: Limpiar URLs de imágenes de perfil de WhatsApp de los clientes
UPDATE public.customers 
SET profile_image_url = NULL 
WHERE profile_image_url IS NOT NULL;

-- Mostrar el conteo de registros eliminados para confirmación
SELECT 
  'incoming_messages' as tabla,
  0 as registros_restantes
UNION ALL
SELECT 
  'sent_messages' as tabla,
  0 as registros_restantes
UNION ALL
SELECT 
  'notification_log' as tabla,
  0 as registros_restantes
UNION ALL
SELECT 
  'message_delivery_status' as tabla,
  0 as registros_restantes;
