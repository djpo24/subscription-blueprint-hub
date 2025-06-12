
-- Create the admin escalations table for AI bot escalation system
CREATE TABLE IF NOT EXISTS public.admin_escalations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone text NOT NULL,
  customer_name text NOT NULL,
  original_question text NOT NULL,
  admin_response text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'closed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  answered_at timestamp with time zone
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_escalations_customer_phone ON public.admin_escalations(customer_phone);
CREATE INDEX IF NOT EXISTS idx_admin_escalations_status ON public.admin_escalations(status);
CREATE INDEX IF NOT EXISTS idx_admin_escalations_created_at ON public.admin_escalations(created_at);

-- Enable RLS
ALTER TABLE public.admin_escalations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin escalations
CREATE POLICY "System can manage admin escalations" 
  ON public.admin_escalations 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- Update existing admin user profile for Didier Pedroza (djpo24@gmail.com)
-- This email already exists in the system based on the migrations
UPDATE public.user_profiles 
SET 
  phone = '+573014940399',
  role = 'admin',
  is_active = true,
  first_name = 'Didier',
  last_name = 'Pedroza'
WHERE email = 'djpo24@gmail.com';

-- If the above update doesn't find the user, let's try finding by other criteria
-- and update to ensure we have the admin configured properly
UPDATE public.user_profiles 
SET 
  phone = '+573014940399',
  role = 'admin',
  is_active = true,
  first_name = 'Didier',
  last_name = 'Pedroza'
WHERE (first_name = 'Didier' AND last_name = 'Pedroza') 
   OR phone = '+573014940399'
   OR email ILIKE '%didier%'
   OR email ILIKE '%pedroza%';

-- Ensure only one admin is active
UPDATE public.user_profiles 
SET is_active = false 
WHERE role = 'admin' 
  AND phone != '+573014940399'
  AND email != 'djpo24@gmail.com';
