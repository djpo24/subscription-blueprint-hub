-- Add rate limiting tracking to point_redemptions
ALTER TABLE public.point_redemptions 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create index for faster rate limit queries
CREATE INDEX IF NOT EXISTS idx_point_redemptions_customer_created 
ON public.point_redemptions(customer_id, created_at);

COMMENT ON COLUMN public.point_redemptions.created_by IS 'Usuario que creó la redención (para auditoría)';