
-- Habilitar RLS en tracking_events si no está habilitado
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para tracking_events
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
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'traveler') 
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update tracking events" 
  ON public.tracking_events 
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

CREATE POLICY "Admins can delete tracking events" 
  ON public.tracking_events 
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
