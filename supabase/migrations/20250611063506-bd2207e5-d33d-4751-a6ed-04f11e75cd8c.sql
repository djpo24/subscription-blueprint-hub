
-- Eliminar todos los usuarios con rol 'employee'
-- Primero eliminamos los perfiles de usuario
DELETE FROM public.user_profiles 
WHERE role = 'employee';

-- También eliminar de la tabla travelers si existen registros relacionados
DELETE FROM public.travelers 
WHERE user_id IN (
  SELECT user_id FROM public.user_profiles 
  WHERE role = 'employee'
);

-- Verificar cuántos usuarios quedan después de la eliminación
SELECT 
  role,
  COUNT(*) as total_users
FROM public.user_profiles 
GROUP BY role
ORDER BY role;
