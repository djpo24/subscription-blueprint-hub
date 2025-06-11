
-- Primero eliminar las políticas problemáticas de user_profiles
DROP POLICY IF EXISTS "Users can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.user_profiles;

-- Crear función security definer para obtener el rol del usuario actual
-- Esto evita la recursión infinita en las políticas RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  -- Usar una consulta directa sin RLS para evitar recursión
  RETURN (
    SELECT role 
    FROM public.user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Crear políticas RLS corregidas para user_profiles
CREATE POLICY "Users can view all user profiles" 
  ON public.user_profiles 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile" 
  ON public.user_profiles 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can insert user profiles" 
  ON public.user_profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update all user profiles" 
  ON public.user_profiles 
  FOR UPDATE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete user profiles" 
  ON public.user_profiles 
  FOR DELETE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar las políticas de las otras tablas para usar la función security definer
-- Esto mejora el rendimiento y evita problemas de recursión

-- Actualizar políticas de dispatch_relations
DROP POLICY IF EXISTS "Admins can manage dispatch relations" ON public.dispatch_relations;
CREATE POLICY "Admins can manage dispatch relations" 
  ON public.dispatch_relations 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de dispatch_packages
DROP POLICY IF EXISTS "Admins can manage dispatch packages" ON public.dispatch_packages;
CREATE POLICY "Admins can manage dispatch packages" 
  ON public.dispatch_packages 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de tracking_events
DROP POLICY IF EXISTS "Admins can manage tracking events" ON public.tracking_events;
CREATE POLICY "Admins can manage tracking events" 
  ON public.tracking_events 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de notification_log
DROP POLICY IF EXISTS "Admins can manage notification log" ON public.notification_log;
CREATE POLICY "Admins can manage notification log" 
  ON public.notification_log 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de incoming_messages
DROP POLICY IF EXISTS "Admins can manage incoming messages" ON public.incoming_messages;
CREATE POLICY "Admins can manage incoming messages" 
  ON public.incoming_messages 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de message_delivery_status
DROP POLICY IF EXISTS "Admins can manage message delivery status" ON public.message_delivery_status;
CREATE POLICY "Admins can manage message delivery status" 
  ON public.message_delivery_status 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de notification_settings
DROP POLICY IF EXISTS "Admins can manage notification settings" ON public.notification_settings;
CREATE POLICY "Admins can manage notification settings" 
  ON public.notification_settings 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Actualizar políticas de user_actions
DROP POLICY IF EXISTS "Admins can manage user actions" ON public.user_actions;
CREATE POLICY "Admins can manage user actions" 
  ON public.user_actions 
  FOR ALL 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Verificar que el usuario administrador existe y tiene los datos correctos
SELECT 
    u.id, 
    u.email, 
    u.email_confirmed_at IS NOT NULL as email_confirmed,
    u.encrypted_password IS NOT NULL as has_password,
    p.role,
    p.is_active,
    p.first_name,
    p.last_name
FROM auth.users u
LEFT JOIN public.user_profiles p ON p.user_id = u.id
WHERE u.email = 'djpo24@gmail.com';
