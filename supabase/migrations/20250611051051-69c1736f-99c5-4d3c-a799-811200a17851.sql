
-- Verificar el estado actual del usuario administrador después de la corrección
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    confirmed_at,
    encrypted_password IS NOT NULL as has_password,
    role,
    aud,
    created_at,
    updated_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users 
WHERE email = 'djpo24@gmail.com';

-- Verificar si existe el perfil del usuario
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    phone,
    role,
    is_active,
    created_at
FROM user_profiles 
WHERE email = 'djpo24@gmail.com';
