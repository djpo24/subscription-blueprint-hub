
-- Primero, verificar y limpiar cualquier configuración de admin para +573014940399
-- Desactivar cualquier perfil de administrador con este número
UPDATE public.user_profiles 
SET is_active = false, role = 'employee'
WHERE phone = '+573014940399' OR phone = '573014940399';

-- Limpiar cualquier registro duplicado o conflictivo
DELETE FROM public.user_profiles 
WHERE phone IN ('+573014940399', '573014940399') 
AND role = 'admin';

-- Asegurar que el número no esté en ninguna configuración especial
-- Cambiar el número de admin escalation al nuevo número +573127271746
UPDATE public.app_secrets 
SET value = '+573127271746'
WHERE name = 'ADMIN_ESCALATION_PHONE' 
AND value IN ('+573014940399', '573014940399');

-- Si no existe el registro, crearlo con el nuevo número
INSERT INTO public.app_secrets (name, value) 
VALUES ('ADMIN_ESCALATION_PHONE', '+573127271746')
ON CONFLICT (name) 
DO UPDATE SET value = '+573127271746';

-- Verificar que las políticas RLS permitan el funcionamiento normal del chatbot
-- Asegurar que incoming_messages permita insertar mensajes de cualquier número
DROP POLICY IF EXISTS "Admin phone restriction" ON public.incoming_messages;
DROP POLICY IF EXISTS "Block admin phone messages" ON public.incoming_messages;

-- Asegurar que sent_messages permita respuestas automáticas
DROP POLICY IF EXISTS "Admin phone sent restriction" ON public.sent_messages;
DROP POLICY IF EXISTS "Block admin sent messages" ON public.sent_messages;

-- Verificar que ai_chat_interactions permita interacciones normales
DROP POLICY IF EXISTS "Admin phone ai restriction" ON public.ai_chat_interactions;
DROP POLICY IF EXISTS "Block admin ai interactions" ON public.ai_chat_interactions;

-- Limpiar cualquier escalación pendiente para este número
UPDATE public.admin_escalations 
SET status = 'closed'
WHERE customer_phone IN ('+573014940399', '573014940399') 
AND status = 'pending';
