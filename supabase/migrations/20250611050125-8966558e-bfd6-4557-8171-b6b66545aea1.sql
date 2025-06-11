
-- Corregir el usuario admin existente con solo las columnas que se pueden actualizar
UPDATE auth.users 
SET 
    email_change = '',
    email_change_confirm_status = 0,
    banned_until = NULL,
    phone = NULL,
    phone_confirmed_at = NULL,
    phone_change = '',
    phone_change_token = '',
    phone_change_sent_at = NULL,
    email_confirmed_at = now(),
    last_sign_in_at = NULL,
    raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
    raw_user_meta_data = '{"first_name": "Didier", "last_name": "Pedroza"}',
    is_sso_user = false,
    deleted_at = NULL,
    is_anonymous = false
WHERE email = 'djpo24@gmail.com';

-- Verificar que el usuario existe y está configurado correctamente
SELECT 
    id, 
    email, 
    email_confirmed_at, 
    confirmed_at,
    encrypted_password IS NOT NULL as has_password,
    role,
    aud,
    email_change,
    email_change_confirm_status
FROM auth.users 
WHERE email = 'djpo24@gmail.com';
