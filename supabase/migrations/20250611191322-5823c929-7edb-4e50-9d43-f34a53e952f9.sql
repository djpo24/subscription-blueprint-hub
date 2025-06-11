
-- Agregar la columna status a la tabla dispatch_relations
ALTER TABLE public.dispatch_relations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Agregar algunas columnas adicionales que son necesarias para el sistema de despachos
ALTER TABLE public.dispatch_relations 
ADD COLUMN IF NOT EXISTS created_by uuid,
ADD COLUMN IF NOT EXISTS total_packages integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_weight numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_freight numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount_to_collect numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pending_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivered_count integer DEFAULT 0;

-- Actualizar las políticas de RLS para incluir permisos para travelers en UPDATE
DROP POLICY IF EXISTS "Admins can update dispatch relations" ON public.dispatch_relations;

CREATE POLICY "Admins and travelers can update dispatch relations" 
  ON public.dispatch_relations 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'traveler') 
      AND is_active = true
    )
  );
