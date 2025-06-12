
-- Crear tabla para tarifas de flete por ruta
CREATE TABLE public.route_freight_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  price_per_kilo NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'COP',
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_until DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  UNIQUE(origin, destination, effective_from)
);

-- Insertar tarifas iniciales para las rutas principales
INSERT INTO public.route_freight_rates (origin, destination, price_per_kilo, currency, notes) VALUES
  ('Barranquilla', 'Curazao', 15000, 'COP', 'Tarifa estándar Barranquilla a Curazao'),
  ('Curazao', 'Barranquilla', 25, 'AWG', 'Tarifa estándar Curazao a Barranquilla');

-- Función para obtener tarifa vigente por ruta
CREATE OR REPLACE FUNCTION public.get_current_freight_rate(
  origin_param TEXT,
  destination_param TEXT,
  reference_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  rate_id UUID,
  price_per_kilo NUMERIC,
  currency TEXT,
  notes TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.price_per_kilo,
    r.currency,
    r.notes
  FROM public.route_freight_rates r
  WHERE r.origin = origin_param 
    AND r.destination = destination_param
    AND r.is_active = true
    AND r.effective_from <= reference_date
    AND (r.effective_until IS NULL OR r.effective_until >= reference_date)
  ORDER BY r.effective_from DESC
  LIMIT 1;
END;
$$;

-- Función mejorada para generar mensajes de marketing con precios
CREATE OR REPLACE FUNCTION public.generate_marketing_message_with_rates(
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
  rate_record RECORD;
  message_content TEXT;
BEGIN
  -- Construir detalles de viajes con precios
  FOR trip_record IN 
    SELECT * FROM public.get_trips_for_marketing_period(start_date, end_date)
  LOOP
    -- Obtener tarifa para esta ruta
    SELECT * INTO rate_record 
    FROM public.get_current_freight_rate(trip_record.origin, trip_record.destination, trip_record.trip_date);
    
    trip_details := trip_details || 
      '📅 ' || to_char(trip_record.trip_date, 'DD/MM/YYYY') || 
      ' - Envío ' || trip_record.origin || ' → ' || trip_record.destination;
    
    IF trip_record.flight_number IS NOT NULL THEN
      trip_details := trip_details || ' (Vuelo: ' || trip_record.flight_number || ')';
    END IF;
    
    -- Agregar precio si está disponible
    IF rate_record.price_per_kilo IS NOT NULL THEN
      IF rate_record.currency = 'COP' THEN
        trip_details := trip_details || E'\n💰 Flete: $' || rate_record.price_per_kilo::TEXT || ' pesos/kg';
      ELSIF rate_record.currency = 'AWG' THEN
        trip_details := trip_details || E'\n💰 Flete: ƒ' || rate_record.price_per_kilo::TEXT || ' florines/kg';
      ELSE
        trip_details := trip_details || E'\n💰 Flete: ' || rate_record.price_per_kilo::TEXT || ' ' || rate_record.currency || '/kg';
      END IF;
    END IF;
    
    trip_details := trip_details || E'\n\n';
  END LOOP;
  
  -- Si no hay viajes, usar mensaje por defecto
  IF trip_details = '' THEN
    trip_details := 'No hay envíos programados para este período. ¡Contáctanos para programar tu envío!';
  END IF;
  
  -- Reemplazar placeholders en el template
  message_content := replace(template_param, '{customer_name}', customer_name_param);
  message_content := replace(message_content, '{trip_details}', trip_details);
  
  RETURN message_content;
END;
$$;

-- Índices para optimizar consultas
CREATE INDEX idx_route_freight_rates_route ON public.route_freight_rates(origin, destination);
CREATE INDEX idx_route_freight_rates_dates ON public.route_freight_rates(effective_from, effective_until);
CREATE INDEX idx_route_freight_rates_active ON public.route_freight_rates(is_active) WHERE is_active = true;
