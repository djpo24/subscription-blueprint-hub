
-- Drop the security definer view and replace it with a regular function
DROP VIEW IF EXISTS public.deleted_packages_view;

-- Create a function to get deleted packages instead
CREATE OR REPLACE FUNCTION public.get_deleted_packages()
RETURNS TABLE (
  id UUID,
  tracking_number TEXT,
  description TEXT,
  status TEXT,
  origin TEXT,
  destination TEXT,
  weight NUMERIC,
  freight NUMERIC,
  amount_to_collect NUMERIC,
  currency TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID,
  customer_name TEXT,
  customer_phone TEXT,
  trip_date DATE,
  deleted_by_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can view deleted packages
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Solo administradores pueden ver paquetes eliminados';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    p.tracking_number,
    p.description,
    p.status,
    p.origin,
    p.destination,
    p.weight,
    p.freight,
    p.amount_to_collect,
    p.currency,
    p.created_at,
    p.deleted_at,
    p.deleted_by,
    c.name as customer_name,
    c.phone as customer_phone,
    t.trip_date,
    deleter.first_name || ' ' || deleter.last_name as deleted_by_name
  FROM packages p
  LEFT JOIN customers c ON p.customer_id = c.id
  LEFT JOIN trips t ON p.trip_id = t.id
  LEFT JOIN user_profiles deleter ON p.deleted_by = deleter.user_id
  WHERE p.deleted_at IS NOT NULL
  ORDER BY p.deleted_at DESC;
END;
$$;
