
-- Crear tabla admin_escalations si no existe (para el sistema de escalaciones)
CREATE TABLE IF NOT EXISTS public.admin_escalations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    original_question TEXT NOT NULL,
    admin_response TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    answered_at TIMESTAMP WITH TIME ZONE
);

-- Habilitar RLS en admin_escalations
ALTER TABLE public.admin_escalations ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_escalations - solo administradores pueden gestionar escalaciones
CREATE POLICY "Admins can manage escalations" 
  ON public.admin_escalations 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Asegurar que la tabla app_secrets tenga las políticas correctas
-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Admins can view app secrets" ON public.app_secrets;
DROP POLICY IF EXISTS "Admins can insert app secrets" ON public.app_secrets;
DROP POLICY IF EXISTS "Admins can update app secrets" ON public.app_secrets;
DROP POLICY IF EXISTS "Admins can delete app secrets" ON public.app_secrets;
DROP POLICY IF EXISTS "Service role can manage app secrets" ON public.app_secrets;

-- Crear políticas RLS mejoradas para app_secrets
CREATE POLICY "Admins can view app secrets" 
  ON public.app_secrets 
  FOR SELECT 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can insert app secrets" 
  ON public.app_secrets 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update app secrets" 
  ON public.app_secrets 
  FOR UPDATE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin')
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete app secrets" 
  ON public.app_secrets 
  FOR DELETE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Permitir también acceso al service_role para las edge functions
CREATE POLICY "Service role can manage app secrets" 
  ON public.app_secrets 
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Insertar el secreto por defecto del teléfono del administrador si no existe
INSERT INTO public.app_secrets (name, value) 
VALUES ('ADMIN_ESCALATION_PHONE', '+573014940399')
ON CONFLICT (name) DO NOTHING;

-- Verificar que la función get_current_user_role funciona correctamente
-- (Esta función ya existe según las migraciones anteriores)
