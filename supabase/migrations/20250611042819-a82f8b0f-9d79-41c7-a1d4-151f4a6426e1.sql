
-- Add missing column to incoming_messages table
ALTER TABLE public.incoming_messages 
ADD COLUMN IF NOT EXISTS media_url text;

-- Create customer_payments table for collected orders functionality
CREATE TABLE IF NOT EXISTS public.customer_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_id uuid REFERENCES public.packages(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'efectivo',
  currency text NOT NULL DEFAULT 'COP',
  payment_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text,
  created_by text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on customer_payments table
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for customer_payments table
CREATE POLICY "Users can view all customer payments" 
  ON public.customer_payments 
  FOR SELECT 
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage customer payments" 
  ON public.customer_payments 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
