
-- Create destination_addresses table
CREATE TABLE IF NOT EXISTS public.destination_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city text NOT NULL,
  address text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on destination_addresses table
ALTER TABLE public.destination_addresses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for destination_addresses table
CREATE POLICY "Users can view all destination addresses" 
  ON public.destination_addresses 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage destination addresses" 
  ON public.destination_addresses 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
