
-- Tabla para configuraciones de marketing
CREATE TABLE public.marketing_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_frequency_days INTEGER NOT NULL DEFAULT 15,
  trip_window_days INTEGER NOT NULL DEFAULT 30,
  auto_send_enabled BOOLEAN NOT NULL DEFAULT true,
  message_template TEXT NOT NULL DEFAULT 'Hola {customer_name}! Te informamos sobre los próximos viajes programados: {trip_details}. ¡Contáctanos para reservar tu espacio!',
  last_campaign_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para campañas de marketing enviadas
CREATE TABLE public.marketing_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_messages_sent INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  trip_start_date DATE NOT NULL,
  trip_end_date DATE NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para el log de mensajes de marketing enviados
CREATE TABLE public.marketing_message_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  message_content TEXT NOT NULL,
  whatsapp_message_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para números de teléfono de marketing (separada del chat)
CREATE TABLE public.marketing_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_message_sent_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar configuración inicial
INSERT INTO public.marketing_settings (
  message_frequency_days,
  trip_window_days,
  auto_send_enabled,
  message_template
) VALUES (
  15,
  30,
  true,
  'Hola {customer_name}! 🚀 Te informamos sobre los próximos viajes programados para los siguientes 30 días:

{trip_details}

💼 ¡Contáctanos para reservar tu espacio!
📱 Responde a este mensaje para más información.'
);

-- Función para obtener viajes en un rango de fechas
CREATE OR REPLACE FUNCTION public.get_trips_for_marketing_period(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  trip_id UUID,
  trip_date DATE,
  origin TEXT,
  destination TEXT,
  flight_number TEXT,
  status TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.trip_date,
    t.origin,
    t.destination,
    t.flight_number,
    t.status
  FROM public.trips t
  WHERE t.trip_date BETWEEN start_date AND end_date
    AND t.status IN ('scheduled', 'pending')
  ORDER BY t.trip_date ASC;
END;
$$;

-- Función para generar el contenido del mensaje con viajes
CREATE OR REPLACE FUNCTION public.generate_marketing_message(
  customer_name_param TEXT,
  template_param TEXT,
  start_date DATE,
  end_date DATE
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  trip_details TEXT := '';
  trip_record RECORD;
  message_content TEXT;
BEGIN
  -- Construir detalles de viajes
  FOR trip_record IN 
    SELECT * FROM public.get_trips_for_marketing_period(start_date, end_date)
  LOOP
    trip_details := trip_details || 
      '📅 ' || to_char(trip_record.trip_date, 'DD/MM/YYYY') || 
      ' - ' || trip_record.origin || ' → ' || trip_record.destination;
    
    IF trip_record.flight_number IS NOT NULL THEN
      trip_details := trip_details || ' (Vuelo: ' || trip_record.flight_number || ')';
    END IF;
    
    trip_details := trip_details || E'\n';
  END LOOP;
  
  -- Si no hay viajes, usar mensaje por defecto
  IF trip_details = '' THEN
    trip_details := 'No hay viajes programados para este período.';
  END IF;
  
  -- Reemplazar placeholders en el template
  message_content := replace(template_param, '{customer_name}', customer_name_param);
  message_content := replace(message_content, '{trip_details}', trip_details);
  
  RETURN message_content;
END;
$$;

-- Índices para optimizar consultas
CREATE INDEX idx_trips_date_status ON public.trips(trip_date, status);
CREATE INDEX idx_marketing_contacts_phone ON public.marketing_contacts(phone_number);
CREATE INDEX idx_marketing_campaigns_sent_at ON public.marketing_campaigns(sent_at);
CREATE INDEX idx_marketing_message_log_campaign ON public.marketing_message_log(campaign_id);
