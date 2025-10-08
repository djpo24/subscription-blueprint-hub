-- Crear tabla de bultos
CREATE TABLE public.bultos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bulto_number INTEGER NOT NULL,
  trip_id UUID REFERENCES public.trips(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'open',
  total_packages INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  CONSTRAINT unique_bulto_number_per_trip UNIQUE(trip_id, bulto_number)
);

-- Crear tabla para múltiples etiquetas por paquete
CREATE TABLE public.package_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  label_number INTEGER NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_label_number_per_package UNIQUE(package_id, label_number)
);

-- Agregar columna bulto_id a packages
ALTER TABLE public.packages 
ADD COLUMN bulto_id UUID REFERENCES public.bultos(id);

-- Agregar columna para número de etiquetas
ALTER TABLE public.packages
ADD COLUMN label_count INTEGER NOT NULL DEFAULT 1;

-- Habilitar RLS en bultos
ALTER TABLE public.bultos ENABLE ROW LEVEL SECURITY;

-- Políticas para bultos
CREATE POLICY "Admins and travelers can manage bultos"
ON public.bultos
FOR ALL
USING (
  get_current_user_role() = ANY(ARRAY['admin'::text, 'traveler'::text])
)
WITH CHECK (
  get_current_user_role() = ANY(ARRAY['admin'::text, 'traveler'::text])
);

CREATE POLICY "Users can view bultos"
ON public.bultos
FOR SELECT
USING (true);

-- Habilitar RLS en package_labels
ALTER TABLE public.package_labels ENABLE ROW LEVEL SECURITY;

-- Políticas para package_labels
CREATE POLICY "Admins and travelers can manage package labels"
ON public.package_labels
FOR ALL
USING (
  get_current_user_role() = ANY(ARRAY['admin'::text, 'traveler'::text])
)
WITH CHECK (
  get_current_user_role() = ANY(ARRAY['admin'::text, 'traveler'::text])
);

CREATE POLICY "Users can view package labels"
ON public.package_labels
FOR SELECT
USING (true);

-- Índices para mejorar performance
CREATE INDEX idx_packages_bulto_id ON public.packages(bulto_id);
CREATE INDEX idx_bultos_trip_id ON public.bultos(trip_id);
CREATE INDEX idx_package_labels_package_id ON public.package_labels(package_id);