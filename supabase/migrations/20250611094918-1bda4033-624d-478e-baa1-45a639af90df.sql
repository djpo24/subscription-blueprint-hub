
-- Eliminar la foreign key duplicada que está causando el conflicto
ALTER TABLE public.notification_log 
DROP CONSTRAINT IF EXISTS notification_log_customer_id_fkey;

-- Eliminar la foreign key duplicada con nombre alternativo si existe
ALTER TABLE public.notification_log 
DROP CONSTRAINT IF EXISTS fk_notification_log_customer;

-- Crear una sola foreign key con nombre específico
ALTER TABLE public.notification_log 
ADD CONSTRAINT fk_notification_log_customer 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);

-- Agregar columnas faltantes a notification_log para el sistema de plantillas
ALTER TABLE public.notification_log 
ADD COLUMN IF NOT EXISTS notification_type text DEFAULT 'manual';

ALTER TABLE public.notification_log 
ADD COLUMN IF NOT EXISTS error_message text;
