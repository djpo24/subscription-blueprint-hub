
-- Add missing columns to trips table
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS trip_date date,
ADD COLUMN IF NOT EXISTS flight_number text;

-- Add missing columns to packages table  
ALTER TABLE public.packages
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS origin text,
ADD COLUMN IF NOT EXISTS destination text,
ADD COLUMN IF NOT EXISTS weight numeric,
ADD COLUMN IF NOT EXISTS freight numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_to_collect numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'COP',
ADD COLUMN IF NOT EXISTS flight_number text,
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivered_by uuid;

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS public.tracking_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  description text NOT NULL,
  location text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on tracking_events table
ALTER TABLE public.tracking_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tracking_events table (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tracking_events' 
    AND policyname = 'Users can view all tracking events'
  ) THEN
    CREATE POLICY "Users can view all tracking events" 
      ON public.tracking_events 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'tracking_events' 
    AND policyname = 'Admins can manage tracking events'
  ) THEN
    CREATE POLICY "Admins can manage tracking events" 
      ON public.tracking_events 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

-- Create dispatch_relations table for dispatch functionality
CREATE TABLE IF NOT EXISTS public.dispatch_relations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_date date NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create dispatch_packages table for dispatch functionality
CREATE TABLE IF NOT EXISTS public.dispatch_packages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dispatch_id uuid REFERENCES public.dispatch_relations(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on dispatch tables
ALTER TABLE public.dispatch_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_packages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for dispatch tables
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dispatch_relations' 
    AND policyname = 'Users can view all dispatch relations'
  ) THEN
    CREATE POLICY "Users can view all dispatch relations" 
      ON public.dispatch_relations 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dispatch_relations' 
    AND policyname = 'Admins can manage dispatch relations'
  ) THEN
    CREATE POLICY "Admins can manage dispatch relations" 
      ON public.dispatch_relations 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dispatch_packages' 
    AND policyname = 'Users can view all dispatch packages'
  ) THEN
    CREATE POLICY "Users can view all dispatch packages" 
      ON public.dispatch_packages 
      FOR SELECT 
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'dispatch_packages' 
    AND policyname = 'Admins can manage dispatch packages'
  ) THEN
    CREATE POLICY "Admins can manage dispatch packages" 
      ON public.dispatch_packages 
      FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.user_profiles 
          WHERE user_id = auth.uid() AND role = 'admin'
        )
      );
  END IF;
END $$;
