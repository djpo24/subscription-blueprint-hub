
-- Crear el usuario administrador directamente en la base de datos
-- Primero, verificamos si el usuario ya existe antes de insertarlo
DO $$
DECLARE
    user_uuid UUID;
    user_exists BOOLEAN := FALSE;
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'djpo24@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        user_exists := TRUE;
    ELSE
        -- Crear nuevo usuario si no existe
        user_uuid := gen_random_uuid();
        
        INSERT INTO auth.users (
            id,
            instance_id,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            role,
            aud,
            confirmation_token,
            email_change_token_new,
            recovery_token,
            email_change_token_current
        ) VALUES (
            user_uuid,
            '00000000-0000-0000-0000-000000000000',
            'djpo24@gmail.com',
            crypt('Dela881224', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"first_name": "Didier", "last_name": "Pedroza"}',
            false,
            'authenticated',
            'authenticated',
            '',
            '',
            '',
            ''
        );
    END IF;
    
    -- Crear o actualizar el perfil de usuario en user_profiles
    IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = user_uuid) THEN
        -- Insertar nuevo perfil
        INSERT INTO public.user_profiles (
            user_id,
            email,
            first_name,
            last_name,
            phone,
            role,
            is_active
        ) VALUES (
            user_uuid,
            'djpo24@gmail.com',
            'Didier',
            'Pedroza',
            '+573014940399',
            'admin',
            true
        );
    ELSE
        -- Actualizar perfil existente
        UPDATE public.user_profiles SET
            email = 'djpo24@gmail.com',
            first_name = 'Didier',
            last_name = 'Pedroza',
            phone = '+573014940399',
            role = 'admin',
            is_active = true,
            updated_at = now()
        WHERE user_id = user_uuid;
    END IF;
    
    -- Mostrar resultado
    IF user_exists THEN
        RAISE NOTICE 'Usuario ya existía, perfil actualizado para: %', 'djpo24@gmail.com';
    ELSE
        RAISE NOTICE 'Usuario creado exitosamente: %', 'djpo24@gmail.com';
    END IF;
END $$;
