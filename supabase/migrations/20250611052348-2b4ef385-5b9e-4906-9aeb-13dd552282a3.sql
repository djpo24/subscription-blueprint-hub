
-- First, add a unique constraint on the email column
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Now we can proceed with the user profile setup
-- Asegurar que el perfil del usuario existe y tiene rol admin
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
    WHERE email = 'djpo24@gmail.com'
);

-- If the profile already exists, update it
UPDATE public.user_profiles 
SET 
    role = 'admin',
    is_active = true,
    updated_at = now()
WHERE email = 'djpo24@gmail.com';

-- Recrear la función security definer mejorada
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Obtener el rol del usuario actual sin activar RLS
    SELECT role INTO user_role
    FROM public.user_profiles 
    WHERE user_id = auth.uid()
    LIMIT 1;
    
    RETURN COALESCE(user_role, 'anonymous');
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'anonymous';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Eliminar todas las políticas existentes problemáticas
DROP POLICY IF EXISTS "Users can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Crear políticas RLS simplificadas y funcionales para user_profiles
CREATE POLICY "Enable read access for authenticated users" 
    ON public.user_profiles 
    FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Admins can insert profiles" 
    ON public.user_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can update any profile" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete profiles" 
    ON public.user_profiles 
    FOR DELETE 
    TO authenticated
    USING (public.get_current_user_role() = 'admin');

-- Verificación final del usuario administrador
SELECT 
    'Usuario administrador configurado correctamente' as mensaje,
    p.user_id,
    p.email,
    p.role,
    p.is_active
FROM public.user_profiles p
WHERE p.email = 'djpo24@gmail.com';
