
-- First, add unique constraint on user_id if it doesn't exist
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id);

-- Verificar el estado actual del usuario administrador
SELECT 
    up.user_id,
    up.email,
    up.role,
    up.is_active,
    au.email as auth_email,
    au.email_confirmed_at IS NOT NULL as email_confirmed
FROM public.user_profiles up
LEFT JOIN auth.users au ON up.user_id = au.id
WHERE up.email = 'djpo24@gmail.com';

-- Asegurar que el usuario administrador existe y está activo
INSERT INTO public.user_profiles (user_id, email, first_name, last_name, role, is_active)
SELECT 
    u.id,
    u.email,
    'Didier',
    'Pedroza',
    'admin',
    true
FROM auth.users u
WHERE u.email = 'djpo24@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = u.id
)
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    updated_at = now();

-- Si el perfil existe pero el user_id es diferente, actualizarlo
UPDATE public.user_profiles 
SET 
    role = 'admin',
    is_active = true,
    updated_at = now()
WHERE email = 'djpo24@gmail.com';

-- Eliminar todas las políticas problemáticas existentes
DROP POLICY IF EXISTS "authenticated_users_can_read_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "users_can_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_employee_can_insert_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_can_update_any_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "admin_can_delete_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_read_for_authenticated" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_insert_for_admins" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_update_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_update_for_admins" ON public.user_profiles;
DROP POLICY IF EXISTS "enable_delete_for_admins" ON public.user_profiles;

-- Crear función mejorada para obtener el rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario actual directamente
    SELECT role INTO user_role
    FROM public.user_profiles 
    WHERE user_id = auth.uid()
    AND is_active = true
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'anonymous');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_current_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas RLS simplificadas y funcionales para user_profiles
CREATE POLICY "enable_read_for_authenticated" 
    ON public.user_profiles 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "enable_insert_for_admins" 
    ON public.user_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "enable_update_own_profile" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "enable_update_for_admins" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (public.is_admin());

CREATE POLICY "enable_delete_for_admins" 
    ON public.user_profiles 
    FOR DELETE 
    TO authenticated
    USING (public.is_admin());

-- Asegurar que RLS está habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificación final del usuario administrador
SELECT 
    'Configuración de admin completada' as status,
    up.user_id,
    up.email,
    up.role,
    up.is_active
FROM public.user_profiles up
WHERE up.email = 'djpo24@gmail.com';
