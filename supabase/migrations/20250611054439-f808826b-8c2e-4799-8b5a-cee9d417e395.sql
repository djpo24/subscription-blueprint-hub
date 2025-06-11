
-- Solución radical: Crear función temporal para crear el primer admin
-- Esta función será eliminada después de crear el primer admin

-- 1. Crear función temporal que no requiere autenticación
CREATE OR REPLACE FUNCTION public.create_first_admin_user(
  admin_email TEXT,
  admin_password TEXT,
  admin_first_name TEXT,
  admin_last_name TEXT,
  admin_phone TEXT DEFAULT NULL
)
RETURNS TABLE(success BOOLEAN, message TEXT, user_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
  existing_admin_count INTEGER;
BEGIN
  -- Verificar si ya existe un administrador
  SELECT COUNT(*) INTO existing_admin_count
  FROM public.user_profiles 
  WHERE role = 'admin' AND is_active = true;
  
  -- Solo permitir si no hay administradores activos
  IF existing_admin_count > 0 THEN
    RETURN QUERY SELECT false, 'Ya existe un administrador en el sistema'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Verificar si el email ya existe
  IF EXISTS (SELECT 1 FROM public.user_profiles WHERE email = admin_email) THEN
    RETURN QUERY SELECT false, 'El email ya está registrado'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Generar UUID para el nuevo usuario
  new_user_id := gen_random_uuid();
  
  -- Insertar directamente en user_profiles (sin crear en auth.users por ahora)
  INSERT INTO public.user_profiles (
    user_id,
    email,
    first_name,
    last_name,
    phone,
    role,
    is_active
  ) VALUES (
    new_user_id,
    admin_email,
    admin_first_name,
    admin_last_name,
    admin_phone,
    'admin',
    true
  );
  
  RETURN QUERY SELECT true, 'Usuario administrador creado exitosamente'::TEXT, new_user_id;
END;
$$;

-- 2. Crear trigger temporal para sincronizar con auth.users cuando el usuario se registre
CREATE OR REPLACE FUNCTION public.sync_temp_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Si se crea un usuario en auth.users y existe un perfil temporal con el mismo email
  UPDATE public.user_profiles 
  SET user_id = NEW.id
  WHERE email = NEW.email 
    AND user_id != NEW.id
    AND role = 'admin';
    
  RETURN NEW;
END;
$$;

-- Crear el trigger
DROP TRIGGER IF EXISTS sync_temp_admin_trigger ON auth.users;
CREATE TRIGGER sync_temp_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_temp_admin_user();

-- 3. Ejecutar la función para crear el administrador
SELECT * FROM public.create_first_admin_user(
  'djpo24@gmail.com',
  'temp_password',
  'Didier',
  'Pedroza',
  '+573014940399'
);

-- 4. Verificar que se creó correctamente
SELECT 
  'Administrador temporal creado' as status,
  user_id,
  email,
  role,
  is_active
FROM public.user_profiles 
WHERE email = 'djpo24@gmail.com';
