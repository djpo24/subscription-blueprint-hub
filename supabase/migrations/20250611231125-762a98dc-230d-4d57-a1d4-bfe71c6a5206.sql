
-- Agregar columna updated_at a la tabla notification_log
ALTER TABLE public.notification_log 
ADD COLUMN updated_at timestamp with time zone DEFAULT now();
