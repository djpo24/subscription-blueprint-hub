
-- Restaurar el rol de administrador para el usuario djpo24@gmail.com
UPDATE public.user_profiles 
SET 
  role = 'admin',
  is_active = true,
  updated_at = now()
WHERE email = 'djpo24@gmail.com';

-- Verificar que el cambio se aplicó correctamente
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active,
  created_at,
  updated_at
FROM public.user_profiles 
WHERE email = 'djpo24@gmail.com';
