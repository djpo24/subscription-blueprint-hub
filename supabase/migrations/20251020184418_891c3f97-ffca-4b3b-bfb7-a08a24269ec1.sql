-- Update default message template to use only codigo variable
UPDATE public.redemption_message_settings
SET 
  message_template = '🎉 Tu código de verificación es:

*{{codigo}}*

⏰ Este código expira en 10 minutos.',
  updated_at = NOW()
WHERE id IN (SELECT id FROM public.redemption_message_settings LIMIT 1);