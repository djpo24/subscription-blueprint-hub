
-- Add missing is_active column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN is_active boolean DEFAULT true;

-- Add missing phone column to user_profiles table  
ALTER TABLE public.user_profiles 
ADD COLUMN phone text;

-- Create travelers table
CREATE TABLE public.travelers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on travelers table
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for travelers table
CREATE POLICY "Users can view all travelers" 
  ON public.travelers 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage travelers" 
  ON public.travelers 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create trips table (referenced by some components)
CREATE TABLE public.trips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  traveler_id uuid REFERENCES public.travelers(id),
  departure_date date,
  arrival_date date,
  origin text,
  destination text,
  status text DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on trips table
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips table
CREATE POLICY "Users can view all trips" 
  ON public.trips 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins and travelers can manage trips" 
  ON public.trips 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role IN ('admin', 'traveler')
    )
  );
