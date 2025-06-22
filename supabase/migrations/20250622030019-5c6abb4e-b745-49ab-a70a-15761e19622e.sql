
-- Add template fields to trip_notifications table
ALTER TABLE public.trip_notifications 
ADD COLUMN IF NOT EXISTS template_name text,
ADD COLUMN IF NOT EXISTS template_language text;

-- Update existing records to have default template values
UPDATE public.trip_notifications 
SET 
  template_name = 'proximos_viajes',
  template_language = 'es_CO'
WHERE template_name IS NULL OR template_language IS NULL;

-- Add template fields to trip_notification_log table
ALTER TABLE public.trip_notification_log 
ADD COLUMN IF NOT EXISTS template_name text,
ADD COLUMN IF NOT EXISTS template_language text;

-- Update existing records to have default template values
UPDATE public.trip_notification_log 
SET 
  template_name = 'proximos_viajes',
  template_language = 'es_CO'
WHERE template_name IS NULL OR template_language IS NULL;
