
-- Habilitar RLS en la tabla dispatch_relations si no está habilitado
ALTER TABLE public.dispatch_relations ENABLE ROW LEVEL SECURITY;

-- Crear política para permitir que usuarios autenticados puedan ver despachos
CREATE POLICY "Users can view dispatch relations" 
  ON public.dispatch_relations 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Crear política para permitir que admins y travelers puedan crear despachos
CREATE POLICY "Admins and travelers can create dispatch relations" 
  ON public.dispatch_relations 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'traveler') 
      AND is_active = true
    )
  );

-- Crear política para permitir que admins puedan actualizar despachos
CREATE POLICY "Admins can update dispatch relations" 
  ON public.dispatch_relations 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Crear política para permitir que admins puedan eliminar despachos
CREATE POLICY "Admins can delete dispatch relations" 
  ON public.dispatch_relations 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- También necesitamos habilitar RLS y crear políticas para dispatch_packages
ALTER TABLE public.dispatch_packages ENABLE ROW LEVEL SECURITY;

-- Política para ver relaciones dispatch-package
CREATE POLICY "Users can view dispatch packages" 
  ON public.dispatch_packages 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Política para crear relaciones dispatch-package (admins y travelers)
CREATE POLICY "Admins and travelers can create dispatch packages" 
  ON public.dispatch_packages 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'traveler') 
      AND is_active = true
    )
  );

-- Política para actualizar relaciones dispatch-package (solo admins)
CREATE POLICY "Admins can update dispatch packages" 
  ON public.dispatch_packages 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Política para eliminar relaciones dispatch-package (solo admins)
CREATE POLICY "Admins can delete dispatch packages" 
  ON public.dispatch_packages 
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND is_active = true
    )
  );
