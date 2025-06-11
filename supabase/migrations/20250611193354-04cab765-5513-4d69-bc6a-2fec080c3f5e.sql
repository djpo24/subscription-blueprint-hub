
-- Crear función segura para verificar roles sin recursión RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario actual directamente
    SELECT role INTO user_role
    FROM public.user_profiles 
    WHERE user_id = auth.uid()
    AND is_active = true
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'anonymous');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$;

-- Eliminar políticas existentes de dispatch_relations para recrearlas
DROP POLICY IF EXISTS "Users can view dispatch relations" ON public.dispatch_relations;
DROP POLICY IF EXISTS "Admins and travelers can create dispatch relations" ON public.dispatch_relations;
DROP POLICY IF EXISTS "Admins can update dispatch relations" ON public.dispatch_relations;
DROP POLICY IF EXISTS "Admins and travelers can update dispatch relations" ON public.dispatch_relations;
DROP POLICY IF EXISTS "Admins can delete dispatch relations" ON public.dispatch_relations;

-- Crear nuevas políticas usando la función segura
CREATE POLICY "Users can view dispatch relations" 
  ON public.dispatch_relations 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins and travelers can create dispatch relations" 
  ON public.dispatch_relations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'traveler')
  );

CREATE POLICY "Admins and travelers can update dispatch relations" 
  ON public.dispatch_relations 
  FOR UPDATE 
  TO authenticated
  USING (
    public.get_current_user_role() IN ('admin', 'traveler')
  );

CREATE POLICY "Admins can delete dispatch relations" 
  ON public.dispatch_relations 
  FOR DELETE 
  TO authenticated
  USING (
    public.get_current_user_role() = 'admin'
  );

-- Eliminar políticas existentes de tracking_events para recrearlas
DROP POLICY IF EXISTS "Users can view tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins and travelers can create tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can update tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can delete tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Users can view all tracking events" ON public.tracking_events;
DROP POLICY IF EXISTS "Admins can manage tracking events" ON public.tracking_events;

-- Crear nuevas políticas para tracking_events usando la función segura
CREATE POLICY "Users can view tracking events" 
  ON public.tracking_events 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins and travelers can create tracking events" 
  ON public.tracking_events 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    public.get_current_user_role() IN ('admin', 'traveler')
  );

CREATE POLICY "Admins can update tracking events" 
  ON public.tracking_events 
  FOR UPDATE 
  TO authenticated
  USING (
    public.get_current_user_role() = 'admin'
  );

CREATE POLICY "Admins can delete tracking events" 
  ON public.tracking_events 
  FOR DELETE 
  TO authenticated
  USING (
    public.get_current_user_role() = 'admin'
  );
