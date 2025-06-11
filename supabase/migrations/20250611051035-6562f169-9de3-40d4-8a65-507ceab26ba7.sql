
-- Verificar el estado actual del usuario administrador
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    confirmed_at,
    encrypted_password IS NOT NULL as has_password,
    role,
    aud,
    created_at,
    updated_at
FROM auth.users 
WHERE email = 'djpo24@gmail.com';

-- Verificar si existe el perfil del usuario
SELECT 
    user_id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM user_profiles 
WHERE email = 'djpo24@gmail.com';
