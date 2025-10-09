-- Function to fix bulto package counts based on actual package_labels
CREATE OR REPLACE FUNCTION fix_bulto_package_count(bulto_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actual_count INTEGER;
BEGIN
  -- Count actual packages in package_labels for this bulto
  SELECT COUNT(*) INTO actual_count
  FROM package_labels
  WHERE bulto_id = bulto_id_param;
  
  -- Update the bulto with the correct count
  UPDATE bultos
  SET total_packages = actual_count
  WHERE id = bulto_id_param;
  
  RETURN actual_count;
END;
$$;

-- Fix the specific bulto 2 that has incorrect count
SELECT fix_bulto_package_count('a8c7b150-c1d4-4daa-a128-e30c33fac34f'::UUID);