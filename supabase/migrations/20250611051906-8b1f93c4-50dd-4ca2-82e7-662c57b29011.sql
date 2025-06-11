
-- Verificar el estado actual del usuario djpo24@gmail.com
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

-- Asegurar que el rol esté correctamente establecido
UPDATE public.user_profiles 
SET 
  role = 'admin',
  is_active = true,
  updated_at = now()
WHERE email = 'djpo24@gmail.com';

-- Verificar que no haya problemas con las políticas RLS
-- Temporarily disable RLS to check if that's the issue
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar nuevamente el usuario
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  role,
  is_active
FROM public.user_profiles 
WHERE email = 'djpo24@gmail.com';
