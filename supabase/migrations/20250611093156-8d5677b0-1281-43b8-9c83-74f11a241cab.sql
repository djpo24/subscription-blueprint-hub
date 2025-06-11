
-- Habilitar RLS en la tabla app_secrets si no está habilitado
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir que los administradores lean los secretos
CREATE POLICY "Admins can view app secrets" 
  ON public.app_secrets 
  FOR SELECT 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Crear política para permitir que los administradores inserten secretos
CREATE POLICY "Admins can insert app secrets" 
  ON public.app_secrets 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Crear política para permitir que los administradores actualicen secretos
CREATE POLICY "Admins can update app secrets" 
  ON public.app_secrets 
  FOR UPDATE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Crear política para permitir que los administradores eliminen secretos
CREATE POLICY "Admins can delete app secrets" 
  ON public.app_secrets 
  FOR DELETE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');
