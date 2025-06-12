
-- Revisar y actualizar políticas RLS para el funcionamiento completo del chatbot automático

-- 1. Asegurar que las edge functions puedan acceder a todas las tablas críticas del chatbot
-- Las edge functions de Supabase usan el service_role que necesita acceso completo

-- Políticas para incoming_messages (crítico para recibir mensajes)
DROP POLICY IF EXISTS "System can read all incoming messages" ON public.incoming_messages;
DROP POLICY IF EXISTS "System can insert incoming messages" ON public.incoming_messages;
DROP POLICY IF EXISTS "System can manage incoming messages" ON public.incoming_messages;

CREATE POLICY "System can manage incoming messages" 
  ON public.incoming_messages 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para notification_log (crítico para auto-respuestas)
DROP POLICY IF EXISTS "System can manage notification log" ON public.notification_log;
CREATE POLICY "System can manage notification log" 
  ON public.notification_log 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para sent_messages (para registrar respuestas automáticas)
DROP POLICY IF EXISTS "System can manage sent messages" ON public.sent_messages;
CREATE POLICY "System can manage sent messages" 
  ON public.sent_messages 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para ai_chat_interactions (sistema de aprendizaje de IA)
DROP POLICY IF EXISTS "System can manage ai interactions" ON public.ai_chat_interactions;
CREATE POLICY "System can manage ai interactions" 
  ON public.ai_chat_interactions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para message_delivery_status (seguimiento de entrega)
DROP POLICY IF EXISTS "System can manage delivery status" ON public.message_delivery_status;
CREATE POLICY "System can manage delivery status" 
  ON public.message_delivery_status 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Asegurar acceso completo a customers para el sistema de IA
DROP POLICY IF EXISTS "System can read customers for AI" ON public.customers;
DROP POLICY IF EXISTS "System can update customer profiles" ON public.customers;
CREATE POLICY "System can manage customers for AI" 
  ON public.customers 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Asegurar acceso completo a packages para consultas de IA
DROP POLICY IF EXISTS "System can read packages for AI" ON public.packages;
CREATE POLICY "System can manage packages for AI" 
  ON public.packages 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Asegurar acceso a customer_payments para consultas de IA
DROP POLICY IF EXISTS "System can read payments for AI" ON public.customer_payments;
CREATE POLICY "System can manage payments for AI" 
  ON public.customer_payments 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Verificar que las tablas críticas tengan RLS habilitado
ALTER TABLE public.incoming_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_delivery_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Asegurar que incoming_messages tenga realtime habilitado para detección automática
ALTER TABLE public.incoming_messages REPLICA IDENTITY FULL;

-- Verificación final: mostrar todas las políticas del chatbot
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation
FROM pg_policies 
WHERE tablename IN (
    'incoming_messages', 
    'notification_log', 
    'sent_messages', 
    'ai_chat_interactions', 
    'message_delivery_status',
    'customers',
    'packages',
    'customer_payments'
)
ORDER BY tablename, policyname;
