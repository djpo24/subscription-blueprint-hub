-- Tabla para guardar el rastreo de guías de transportadoras
CREATE TABLE IF NOT EXISTS public.carrier_tracking_guides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL,
  tracking_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  last_status TEXT,
  last_check_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  last_tracking_data JSONB,
  notes TEXT,
  UNIQUE(carrier, tracking_number)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_carrier_tracking_customer ON public.carrier_tracking_guides(customer_id);
CREATE INDEX idx_carrier_tracking_status ON public.carrier_tracking_guides(status);
CREATE INDEX idx_carrier_tracking_last_check ON public.carrier_tracking_guides(last_check_at);
CREATE INDEX idx_carrier_tracking_carrier ON public.carrier_tracking_guides(carrier);

-- Tabla para guardar el historial de consultas
CREATE TABLE IF NOT EXISTS public.carrier_tracking_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guide_id UUID NOT NULL REFERENCES public.carrier_tracking_guides(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  tracking_data JSONB NOT NULL,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

CREATE INDEX idx_tracking_history_guide ON public.carrier_tracking_history(guide_id);
CREATE INDEX idx_tracking_history_checked ON public.carrier_tracking_history(checked_at);

-- RLS Policies
ALTER TABLE public.carrier_tracking_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carrier_tracking_history ENABLE ROW LEVEL SECURITY;

-- Usuarios autenticados pueden ver todas las guías
CREATE POLICY "Users can view carrier tracking guides"
  ON public.carrier_tracking_guides
  FOR SELECT
  USING (true);

-- Usuarios autenticados pueden crear guías
CREATE POLICY "Authenticated users can create guides"
  ON public.carrier_tracking_guides
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios autenticados pueden actualizar guías
CREATE POLICY "Authenticated users can update guides"
  ON public.carrier_tracking_guides
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Admins pueden eliminar guías
CREATE POLICY "Admins can delete guides"
  ON public.carrier_tracking_guides
  FOR DELETE
  USING (get_current_user_role() = 'admin');

-- System puede gestionar guías (para el cron job)
CREATE POLICY "System can manage tracking guides"
  ON public.carrier_tracking_guides
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para el historial
CREATE POLICY "Users can view tracking history"
  ON public.carrier_tracking_history
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert tracking history"
  ON public.carrier_tracking_history
  FOR INSERT
  WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE public.carrier_tracking_guides IS 'Guías de transportadoras en seguimiento';
COMMENT ON TABLE public.carrier_tracking_history IS 'Historial de consultas de guías';
COMMENT ON COLUMN public.carrier_tracking_guides.status IS 'pending: en seguimiento, delivered: entregado';
