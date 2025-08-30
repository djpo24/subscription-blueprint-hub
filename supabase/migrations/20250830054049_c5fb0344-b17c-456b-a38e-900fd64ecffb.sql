
-- Agregar la columna campaign_name a la tabla marketing_message_log
ALTER TABLE public.marketing_message_log 
ADD COLUMN campaign_name text;
