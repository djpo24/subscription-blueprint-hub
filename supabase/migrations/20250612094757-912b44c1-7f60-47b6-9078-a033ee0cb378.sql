
-- Verificar el estado actual de las políticas RLS en las tablas críticas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('incoming_messages', 'notification_log', 'sent_messages', 'ai_chat_interactions', 'message_delivery_status')
ORDER BY tablename, policyname;

-- Habilitar RLS en tablas que lo necesitan (si no está habilitado)
ALTER TABLE public.incoming_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_response_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_improvement_patterns ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para incoming_messages (crítico para el chatbot)
DROP POLICY IF EXISTS "System can read all incoming messages" ON public.incoming_messages;
CREATE POLICY "System can read all incoming messages" 
  ON public.incoming_messages 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can insert incoming messages" ON public.incoming_messages;
CREATE POLICY "System can insert incoming messages" 
  ON public.incoming_messages 
  FOR INSERT 
  WITH CHECK (true);

-- Políticas para notification_log (necesario para auto-respuestas)
DROP POLICY IF EXISTS "System can manage notification log" ON public.notification_log;
CREATE POLICY "System can manage notification log" 
  ON public.notification_log 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para sent_messages (para registrar mensajes enviados)
DROP POLICY IF EXISTS "System can manage sent messages" ON public.sent_messages;
CREATE POLICY "System can manage sent messages" 
  ON public.sent_messages 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para ai_chat_interactions (para el sistema de aprendizaje)
DROP POLICY IF EXISTS "System can manage ai interactions" ON public.ai_chat_interactions;
CREATE POLICY "System can manage ai interactions" 
  ON public.ai_chat_interactions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Políticas para message_delivery_status (para seguimiento de entrega)
DROP POLICY IF EXISTS "System can manage delivery status" ON public.message_delivery_status;
CREATE POLICY "System can manage delivery status" 
  ON public.message_delivery_status 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Asegurar que customers sea accesible para el sistema de IA
DROP POLICY IF EXISTS "System can read customers for AI" ON public.customers;
CREATE POLICY "System can read customers for AI" 
  ON public.customers 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can update customer profiles" ON public.customers;
CREATE POLICY "System can update customer profiles" 
  ON public.customers 
  FOR UPDATE 
  USING (true)
  WITH CHECK (true);

-- Asegurar que packages sea accesible para consultas de IA
DROP POLICY IF EXISTS "System can read packages for AI" ON public.packages;
CREATE POLICY "System can read packages for AI" 
  ON public.packages 
  FOR SELECT 
  USING (true);

-- Asegurar que customer_payments sea accesible para consultas de IA
DROP POLICY IF EXISTS "System can read payments for AI" ON public.customer_payments;
CREATE POLICY "System can read payments for AI" 
  ON public.customer_payments 
  FOR SELECT 
  USING (true);

-- Solo habilitar REPLICA IDENTITY si no está configurado (sin agregar a publication)
ALTER TABLE public.incoming_messages REPLICA IDENTITY FULL;

-- Verificación final: mostrar todas las políticas relevantes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause'
        ELSE 'No USING clause'
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause'
        ELSE 'No WITH CHECK clause'
    END as with_check_clause
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
