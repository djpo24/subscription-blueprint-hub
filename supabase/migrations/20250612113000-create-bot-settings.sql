
-- Crear tabla para configuración global del bot
CREATE TABLE IF NOT EXISTS public.bot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar configuración inicial
INSERT INTO public.bot_settings (setting_name, setting_value) 
VALUES 
  ('auto_response_enabled', true),
  ('manual_response_enabled', true)
ON CONFLICT (setting_name) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.bot_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos los usuarios autenticados
CREATE POLICY "Allow read bot settings" ON public.bot_settings
  FOR SELECT 
  USING (true);

-- Política para permitir actualización solo a administradores
CREATE POLICY "Allow update bot settings to admins" ON public.bot_settings
  FOR UPDATE 
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Función para obtener configuración del bot
CREATE OR REPLACE FUNCTION public.get_bot_setting(setting_name text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
    setting_value boolean;
BEGIN
    SELECT bs.setting_value INTO setting_value
    FROM public.bot_settings bs
    WHERE bs.setting_name = get_bot_setting.setting_name;
    
    RETURN COALESCE(setting_value, true); -- Default a true si no existe
END;
$$;

-- Función para actualizar configuración del bot
CREATE OR REPLACE FUNCTION public.update_bot_setting(setting_name text, new_value boolean)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo administradores pueden actualizar
    IF NOT public.is_admin() THEN
        RETURN false;
    END IF;
    
    UPDATE public.bot_settings 
    SET setting_value = new_value, updated_at = NOW()
    WHERE bot_settings.setting_name = update_bot_setting.setting_name;
    
    IF NOT FOUND THEN
        INSERT INTO public.bot_settings (setting_name, setting_value)
        VALUES (update_bot_setting.setting_name, new_value);
    END IF;
    
    RETURN true;
END;
$$;
