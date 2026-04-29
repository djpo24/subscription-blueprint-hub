-- ══════════════════════════════════════════════════════════════════════════════
--  Drop legacy chat tables (Fase 5)
--
--  Elimina las tablas viejas (incoming_messages, sent_messages) ahora que
--  el chat unificado (whatsapp_conversations + whatsapp_messages) está en
--  uso y ya no las necesitamos.
--
--  ⚠ APLICAR SOLO DESPUÉS DE VERIFICAR:
--   - El chat nuevo está funcionando end-to-end (mensajes inbound y outbound)
--   - No hay otras edge functions o código de la app leyendo estas tablas
--   - Tienes un backup reciente de la DB
--
--  La migración 20260429211931 ya copió todos los datos legacy a las nuevas
--  tablas, así que esto NO causa pérdida de mensajes — solo libera el espacio.
-- ══════════════════════════════════════════════════════════════════════════════

-- También elimina message_delivery_status que se basaba en notification_log.id
-- (ya no la usamos — los status updates ahora viven en whatsapp_messages.status).
DROP TABLE IF EXISTS public.message_delivery_status CASCADE;

DROP TABLE IF EXISTS public.incoming_messages CASCADE;
DROP TABLE IF EXISTS public.sent_messages CASCADE;
