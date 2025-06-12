
-- Add Row Level Security policies for customer_payments table
ALTER TABLE public.customer_payments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert payments
CREATE POLICY "Authenticated users can insert payments" 
  ON public.customer_payments 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to view payments
CREATE POLICY "Authenticated users can view payments" 
  ON public.customer_payments 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Create policy to allow authenticated users to update payments
CREATE POLICY "Authenticated users can update payments" 
  ON public.customer_payments 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Update the created_by column to be UUID type instead of text
ALTER TABLE public.customer_payments ALTER COLUMN created_by TYPE uuid USING created_by::uuid;
