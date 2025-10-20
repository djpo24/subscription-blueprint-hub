-- Create table for point redemptions
CREATE TABLE public.point_redemptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  points_redeemed INTEGER NOT NULL,
  kilos_earned NUMERIC NOT NULL,
  verification_code TEXT NOT NULL,
  code_sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  code_verified_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, verified, expired, cancelled
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create index for faster lookups
CREATE INDEX idx_point_redemptions_customer ON public.point_redemptions(customer_id);
CREATE INDEX idx_point_redemptions_status ON public.point_redemptions(status);
CREATE INDEX idx_point_redemptions_code ON public.point_redemptions(verification_code);

-- Enable RLS
ALTER TABLE public.point_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view point redemptions"
  ON public.point_redemptions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create redemptions"
  ON public.point_redemptions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update redemptions"
  ON public.point_redemptions
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage redemptions"
  ON public.point_redemptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create function to generate 4-digit verification code
CREATE OR REPLACE FUNCTION generate_verification_code()
RETURNS TEXT AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE public.point_redemptions IS 'Stores customer point redemption requests with verification codes';
COMMENT ON COLUMN public.point_redemptions.points_redeemed IS 'Number of points being redeemed (1000 points = 1 kilo)';
COMMENT ON COLUMN public.point_redemptions.kilos_earned IS 'Kilos earned from redemption';
COMMENT ON COLUMN public.point_redemptions.verification_code IS '4-digit code sent via WhatsApp for verification';
COMMENT ON COLUMN public.point_redemptions.expires_at IS 'Code expires 10 minutes after generation';
