
-- Add deleted_at column to packages table for soft delete
ALTER TABLE public.packages 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add deleted_by column to track who deleted the package
ALTER TABLE public.packages 
ADD COLUMN deleted_by UUID REFERENCES auth.users(id) DEFAULT NULL;

-- Create index for better performance on deleted packages queries
CREATE INDEX idx_packages_deleted_at ON public.packages(deleted_at) WHERE deleted_at IS NOT NULL;

-- Update RLS policies to exclude deleted packages by default
DROP POLICY IF EXISTS "Authenticated users can access packages" ON public.packages;
DROP POLICY IF EXISTS "System can manage packages for AI" ON public.packages;

CREATE POLICY "Authenticated users can access active packages" 
ON public.packages 
FOR SELECT
TO authenticated
USING (deleted_at IS NULL);

CREATE POLICY "Authenticated users can manage active packages" 
ON public.packages 
FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL AND deleted_at IS NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can see all packages including deleted
CREATE POLICY "Admins can view all packages including deleted" 
ON public.packages 
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- Admins can restore deleted packages
CREATE POLICY "Admins can restore deleted packages" 
ON public.packages 
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  )
);

-- System can manage packages for AI
CREATE POLICY "System can manage packages for AI" 
ON public.packages 
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to soft delete package
CREATE OR REPLACE FUNCTION public.soft_delete_package(package_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.packages
  SET 
    deleted_at = NOW(),
    deleted_by = auth.uid(),
    updated_at = NOW()
  WHERE id = package_id
  AND deleted_at IS NULL;
  
  RETURN FOUND;
END;
$$;

-- Create function to restore deleted package
CREATE OR REPLACE FUNCTION public.restore_deleted_package(package_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only admins can restore
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin' 
    AND is_active = true
  ) THEN
    RAISE EXCEPTION 'Solo administradores pueden restaurar paquetes';
  END IF;

  UPDATE public.packages
  SET 
    deleted_at = NULL,
    deleted_by = NULL,
    updated_at = NOW()
  WHERE id = package_id
  AND deleted_at IS NOT NULL;
  
  -- Log the restoration
  INSERT INTO user_actions (
    user_id,
    action_type,
    description,
    table_name,
    record_id,
    can_revert
  ) VALUES (
    auth.uid(),
    'restore',
    'Paquete restaurado',
    'packages',
    package_id,
    false
  );
  
  RETURN FOUND;
END;
$$;

-- Create view for deleted packages with customer info
CREATE OR REPLACE VIEW public.deleted_packages_view AS
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
FROM public.packages p
LEFT JOIN public.customers c ON p.customer_id = c.id
LEFT JOIN public.trips t ON p.trip_id = t.id
LEFT JOIN public.user_profiles deleter ON p.deleted_by = deleter.user_id
WHERE p.deleted_at IS NOT NULL
ORDER BY p.deleted_at DESC;
