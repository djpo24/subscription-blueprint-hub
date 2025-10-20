-- Add WhatsApp template configuration fields to redemption_message_settings
ALTER TABLE public.redemption_message_settings 
ADD COLUMN IF NOT EXISTS use_template BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS template_name TEXT,
ADD COLUMN IF NOT EXISTS template_language TEXT DEFAULT 'es_CO';

-- Update the existing record to use template format
UPDATE public.redemption_message_settings
SET 
  use_template = true,
  template_name = 'redemption_code',
  template_language = 'es_CO'
WHERE id IN (SELECT id FROM public.redemption_message_settings LIMIT 1);

-- Add comment explaining the fields
COMMENT ON COLUMN public.redemption_message_settings.use_template IS 'Si true, usa plantilla de WhatsApp Business API. Si false, envía mensaje de texto plano.';
COMMENT ON COLUMN public.redemption_message_settings.template_name IS 'Nombre de la plantilla configurada en WhatsApp Business Manager';
COMMENT ON COLUMN public.redemption_message_settings.template_language IS 'Código de idioma de la plantilla (ej: es_CO, es_MX, en_US)';