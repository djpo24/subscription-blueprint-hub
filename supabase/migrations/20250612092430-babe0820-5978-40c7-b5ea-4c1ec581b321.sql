
-- Verificar y crear políticas RLS faltantes para el sistema de auto-respuesta
-- Usar DROP POLICY IF EXISTS para evitar errores de duplicación

-- 1. Políticas para ai_chat_interactions (almacenar interacciones de IA)
DROP POLICY IF EXISTS "System can insert chat interactions" ON public.ai_chat_interactions;
CREATE POLICY "System can insert chat interactions" 
  ON public.ai_chat_interactions 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view chat interactions" ON public.ai_chat_interactions;
CREATE POLICY "Anyone can view chat interactions" 
  ON public.ai_chat_interactions 
  FOR SELECT 
  USING (true);

-- 2. Políticas para incoming_messages (necesarias para el webhook y detección)
DROP POLICY IF EXISTS "System can insert incoming messages" ON public.incoming_messages;
CREATE POLICY "System can insert incoming messages" 
  ON public.incoming_messages 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view incoming messages" ON public.incoming_messages;
CREATE POLICY "Users can view incoming messages" 
  ON public.incoming_messages 
  FOR SELECT 
  USING (true);

-- 3. Políticas para notification_log (auto-respuestas)
DROP POLICY IF EXISTS "System can insert notifications" ON public.notification_log;
CREATE POLICY "System can insert notifications" 
  ON public.notification_log 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view notifications" ON public.notification_log;
CREATE POLICY "Users can view notifications" 
  ON public.notification_log 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can update notifications" ON public.notification_log;
CREATE POLICY "System can update notifications" 
  ON public.notification_log 
  FOR UPDATE 
  USING (true);

-- 4. Políticas para customers (necesarias para buscar/crear clientes automáticamente)
DROP POLICY IF EXISTS "System can insert customers" ON public.customers;
CREATE POLICY "System can insert customers" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view customers" ON public.customers;
CREATE POLICY "Users can view customers" 
  ON public.customers 
  FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System can update customers" ON public.customers;
CREATE POLICY "System can update customers" 
  ON public.customers 
  FOR UPDATE 
  USING (true);

-- 5. Habilitar realtime para incoming_messages (crítico para la detección automática)
ALTER TABLE public.incoming_messages REPLICA IDENTITY FULL;

-- Verificar si la tabla ya está en la publicación antes de agregarla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'incoming_messages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incoming_messages;
    END IF;
END $$;

-- 6. Verificar que las tablas tengan RLS habilitado
ALTER TABLE public.ai_chat_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incoming_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
