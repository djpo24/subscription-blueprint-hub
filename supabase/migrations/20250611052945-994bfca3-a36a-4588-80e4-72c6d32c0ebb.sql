
-- Primero, verificar el estado actual del usuario admin
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

-- Verificar las políticas RLS actuales
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Recrear las políticas RLS de manera más robusta para user_profiles
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.user_profiles;

-- Política de lectura más permisiva para usuarios autenticados
CREATE POLICY "authenticated_users_can_read_profiles" 
    ON public.user_profiles 
    FOR SELECT 
    TO authenticated
    USING (true);

-- Política para que usuarios puedan actualizar su propio perfil
CREATE POLICY "users_can_update_own_profile" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Política para que admins y empleados puedan insertar perfiles
CREATE POLICY "admin_employee_can_insert_profiles" 
    ON public.user_profiles 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role IN ('admin', 'employee')
            AND is_active = true
        )
    );

-- Política para que admins puedan actualizar cualquier perfil
CREATE POLICY "admin_can_update_any_profile" 
    ON public.user_profiles 
    FOR UPDATE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Política para que admins puedan eliminar perfiles
CREATE POLICY "admin_can_delete_profiles" 
    ON public.user_profiles 
    FOR DELETE 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
            AND is_active = true
        )
    );

-- Asegurar que RLS está habilitado
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Crear la tabla sent_messages que está causando errores en los logs
CREATE TABLE IF NOT EXISTS public.sent_messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id uuid REFERENCES public.customers(id),
    message_content text NOT NULL,
    phone_number text NOT NULL,
    sent_at timestamp with time zone DEFAULT now(),
    delivery_status text DEFAULT 'sent',
    whatsapp_message_id text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en sent_messages
ALTER TABLE public.sent_messages ENABLE ROW LEVEL SECURITY;

-- Política para sent_messages
CREATE POLICY "authenticated_users_can_manage_sent_messages" 
    ON public.sent_messages 
    FOR ALL 
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Corregir el problema de relaciones múltiples en notification_log
-- Eliminar una de las foreign keys duplicadas
ALTER TABLE public.notification_log DROP CONSTRAINT IF EXISTS fk_notification_log_customer;

-- Verificación final
SELECT 
    'Configuración completada' as status,
    up.email,
    up.role,
    up.is_active
FROM public.user_profiles up
WHERE up.email = 'djpo24@gmail.com';
