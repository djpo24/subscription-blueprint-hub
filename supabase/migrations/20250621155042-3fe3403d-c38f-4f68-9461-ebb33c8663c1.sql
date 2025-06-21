
-- Crear tabla para notificaciones de viajes de ida y vuelta
CREATE TABLE public.trip_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outbound_trip_id UUID NOT NULL,
  return_trip_id UUID NOT NULL,
  deadline_date DATE NOT NULL,
  deadline_time TIME NOT NULL DEFAULT '15:00:00',
  message_template TEXT NOT NULL,
  total_customers_sent INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES public.user_profiles(user_id),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de log para el envío individual de notificaciones de viajes
CREATE TABLE public.trip_notification_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_notification_id UUID NOT NULL REFERENCES public.trip_notifications(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  personalized_message TEXT NOT NULL,
  whatsapp_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.trip_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_notification_log ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para trip_notifications
CREATE POLICY "Admins can view trip notifications" 
  ON public.trip_notifications 
  FOR SELECT 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can create trip notifications" 
  ON public.trip_notifications 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update trip notifications" 
  ON public.trip_notifications 
  FOR UPDATE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete trip notifications" 
  ON public.trip_notifications 
  FOR DELETE 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

-- Crear políticas RLS para trip_notification_log
CREATE POLICY "Admins can view trip notification logs" 
  ON public.trip_notification_log 
  FOR SELECT 
  TO authenticated
  USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can create trip notification logs" 
  ON public.trip_notification_log 
  FOR INSERT 
  TO authenticated
  WITH CHECK (public.get_current_user_role() = 'admin');

-- Crear función para generar mensaje personalizado de viaje
CREATE OR REPLACE FUNCTION public.generate_trip_notification_message(
  customer_name_param TEXT,
  template_param TEXT,
  outbound_date DATE,
  return_date DATE,
  deadline_date DATE
) RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  message_content TEXT;
  formatted_outbound TEXT;
  formatted_return TEXT;
  formatted_deadline TEXT;
BEGIN
  -- Formatear fechas en español
  SELECT CASE 
    WHEN EXTRACT(DOW FROM outbound_date) = 0 THEN 'domingo'
    WHEN EXTRACT(DOW FROM outbound_date) = 1 THEN 'lunes'
    WHEN EXTRACT(DOW FROM outbound_date) = 2 THEN 'martes'
    WHEN EXTRACT(DOW FROM outbound_date) = 3 THEN 'miércoles'
    WHEN EXTRACT(DOW FROM outbound_date) = 4 THEN 'jueves'
    WHEN EXTRACT(DOW FROM outbound_date) = 5 THEN 'viernes'
    WHEN EXTRACT(DOW FROM outbound_date) = 6 THEN 'sábado'
  END || ' ' || EXTRACT(DAY FROM outbound_date) || ' de ' ||
  CASE 
    WHEN EXTRACT(MONTH FROM outbound_date) = 1 THEN 'enero'
    WHEN EXTRACT(MONTH FROM outbound_date) = 2 THEN 'febrero'
    WHEN EXTRACT(MONTH FROM outbound_date) = 3 THEN 'marzo'
    WHEN EXTRACT(MONTH FROM outbound_date) = 4 THEN 'abril'
    WHEN EXTRACT(MONTH FROM outbound_date) = 5 THEN 'mayo'
    WHEN EXTRACT(MONTH FROM outbound_date) = 6 THEN 'junio'
    WHEN EXTRACT(MONTH FROM outbound_date) = 7 THEN 'julio'
    WHEN EXTRACT(MONTH FROM outbound_date) = 8 THEN 'agosto'
    WHEN EXTRACT(MONTH FROM outbound_date) = 9 THEN 'septiembre'
    WHEN EXTRACT(MONTH FROM outbound_date) = 10 THEN 'octubre'
    WHEN EXTRACT(MONTH FROM outbound_date) = 11 THEN 'noviembre'
    WHEN EXTRACT(MONTH FROM outbound_date) = 12 THEN 'diciembre'
  END INTO formatted_outbound;

  SELECT CASE 
    WHEN EXTRACT(DOW FROM return_date) = 0 THEN 'domingo'
    WHEN EXTRACT(DOW FROM return_date) = 1 THEN 'lunes'
    WHEN EXTRACT(DOW FROM return_date) = 2 THEN 'martes'
    WHEN EXTRACT(DOW FROM return_date) = 3 THEN 'miércoles'
    WHEN EXTRACT(DOW FROM return_date) = 4 THEN 'jueves'
    WHEN EXTRACT(DOW FROM return_date) = 5 THEN 'viernes'
    WHEN EXTRACT(DOW FROM return_date) = 6 THEN 'sábado'
  END || ' ' || EXTRACT(DAY FROM return_date) || ' de ' ||
  CASE 
    WHEN EXTRACT(MONTH FROM return_date) = 1 THEN 'enero'
    WHEN EXTRACT(MONTH FROM return_date) = 2 THEN 'febrero'
    WHEN EXTRACT(MONTH FROM return_date) = 3 THEN 'marzo'
    WHEN EXTRACT(MONTH FROM return_date) = 4 THEN 'abril'
    WHEN EXTRACT(MONTH FROM return_date) = 5 THEN 'mayo'
    WHEN EXTRACT(MONTH FROM return_date) = 6 THEN 'junio'
    WHEN EXTRACT(MONTH FROM return_date) = 7 THEN 'julio'
    WHEN EXTRACT(MONTH FROM return_date) = 8 THEN 'agosto'
    WHEN EXTRACT(MONTH FROM return_date) = 9 THEN 'septiembre'
    WHEN EXTRACT(MONTH FROM return_date) = 10 THEN 'octubre'
    WHEN EXTRACT(MONTH FROM return_date) = 11 THEN 'noviembre'
    WHEN EXTRACT(MONTH FROM return_date) = 12 THEN 'diciembre'
  END INTO formatted_return;

  SELECT CASE 
    WHEN EXTRACT(DOW FROM deadline_date) = 0 THEN 'domingo'
    WHEN EXTRACT(DOW FROM deadline_date) = 1 THEN 'lunes'
    WHEN EXTRACT(DOW FROM deadline_date) = 2 THEN 'martes'
    WHEN EXTRACT(DOW FROM deadline_date) = 3 THEN 'miércoles'
    WHEN EXTRACT(DOW FROM deadline_date) = 4 THEN 'jueves'
    WHEN EXTRACT(DOW FROM deadline_date) = 5 THEN 'viernes'
    WHEN EXTRACT(DOW FROM deadline_date) = 6 THEN 'sábado'
  END || ' ' || EXTRACT(DAY FROM deadline_date) || ' de ' ||
  CASE 
    WHEN EXTRACT(MONTH FROM deadline_date) = 1 THEN 'enero'
    WHEN EXTRACT(MONTH FROM deadline_date) = 2 THEN 'febrero'
    WHEN EXTRACT(MONTH FROM deadline_date) = 3 THEN 'marzo'
    WHEN EXTRACT(MONTH FROM deadline_date) = 4 THEN 'abril'
    WHEN EXTRACT(MONTH FROM deadline_date) = 5 THEN 'mayo'
    WHEN EXTRACT(MONTH FROM deadline_date) = 6 THEN 'junio'
    WHEN EXTRACT(MONTH FROM deadline_date) = 7 THEN 'julio'
    WHEN EXTRACT(MONTH FROM deadline_date) = 8 THEN 'agosto'
    WHEN EXTRACT(MONTH FROM deadline_date) = 9 THEN 'septiembre'
    WHEN EXTRACT(MONTH FROM deadline_date) = 10 THEN 'octubre'
    WHEN EXTRACT(MONTH FROM deadline_date) = 11 THEN 'noviembre'
    WHEN EXTRACT(MONTH FROM deadline_date) = 12 THEN 'diciembre'
  END INTO formatted_deadline;

  -- Reemplazar placeholders en el template
  message_content := replace(template_param, '{{nombre_cliente}}', customer_name_param);
  message_content := replace(message_content, '{{fecha_salida_baq}}', formatted_outbound);
  message_content := replace(message_content, '{{fecha_retorno_cur}}', formatted_return);
  message_content := replace(message_content, '{{fecha_limite_entrega}}', formatted_deadline);
  
  RETURN message_content;
END;
$$;
