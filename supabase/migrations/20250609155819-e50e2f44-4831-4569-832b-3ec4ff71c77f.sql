
-- Limpiar datos transaccionales pero conservar configuración crítica del sistema
-- Versión corregida para manejar las restricciones de claves foráneas

-- 1. Eliminar datos de mensajes y notificaciones
DELETE FROM public.message_delivery_status;
DELETE FROM public.incoming_messages;
DELETE FROM public.sent_messages;
DELETE FROM public.notification_log;

-- 2. Eliminar datos de pagos y deudas
DELETE FROM public.delivery_payments;
DELETE FROM public.package_deliveries;
DELETE FROM public.package_payments;
DELETE FROM public.package_debts;
DELETE FROM public.customer_payments;

-- 3. Eliminar datos de envíos y despachos
DELETE FROM public.dispatch_batches;
DELETE FROM public.dispatch_packages;
DELETE FROM public.dispatch_relations;
DELETE FROM public.tracking_events;

-- 4. Eliminar seguimiento público ANTES de eliminar paquetes (para evitar FK constraint)
DELETE FROM public.public_package_tracking;

-- 5. Eliminar paquetes y lotes (después de eliminar las referencias)
DELETE FROM public.packages;
DELETE FROM public.shipment_batches;

-- 6. Eliminar datos de vuelos
DELETE FROM public.flight_data;
DELETE FROM public.flight_api_cache;
DELETE FROM public.flight_api_usage;

-- 7. Eliminar viajes
DELETE FROM public.trips;

-- 8. Eliminar clientes (excepto datos críticos del sistema)
DELETE FROM public.customers;

-- 9. Eliminar consultas de invitados
DELETE FROM public.guest_tracking_queries;

-- 10. Eliminar acciones de usuario (logs de auditoría)
DELETE FROM public.user_actions;

-- 11. Mantener solo usuarios administrador y viajero
-- Eliminar travelers que no estén vinculados a usuarios admin o traveler
DELETE FROM public.travelers 
WHERE user_id NOT IN (
    SELECT user_id FROM public.user_profiles 
    WHERE role IN ('admin', 'traveler') AND is_active = true
);

-- Eliminar perfiles de usuario que no sean admin o traveler
DELETE FROM public.user_profiles 
WHERE role NOT IN ('admin', 'traveler') OR is_active = false;

-- CONSERVAR (NO eliminar):
-- - app_secrets (configuración de WhatsApp y otros secretos críticos)
-- - destination_addresses (direcciones de destino del sistema)
-- - payment_methods (métodos de pago del sistema)
-- - notification_settings (configuración de notificaciones)
-- - user_profiles con role 'admin' o 'traveler' activos
-- - travelers vinculados a usuarios admin o traveler
