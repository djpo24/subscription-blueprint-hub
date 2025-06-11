
-- Limpiar todos los mensajes del chat
DELETE FROM public.incoming_messages;

-- Limpiar todos los mensajes enviados
DELETE FROM public.sent_messages;

-- Limpiar logs de notificaciones de chat (mantener otros tipos si es necesario)
DELETE FROM public.notification_log 
WHERE notification_type IN ('manual', 'manual_reply', 'consulta_encomienda', 'customer_service_followup');

-- Limpiar estados de entrega de mensajes
DELETE FROM public.message_delivery_status;
