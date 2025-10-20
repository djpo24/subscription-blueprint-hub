-- Update redemption message template to use the celebration template
UPDATE public.redemption_message_settings
SET message_template = '🎊 ¡FELICITACIONES {{nombre_cliente}}! 🎊

🎁 Estás canjeando:
• {{puntos}} puntos
• Por {{kilos}} kg GRATIS

🔐 Tu código secreto:
*{{codigo}}*

⏰ ¡Rápido! Expira en 10 minutos

Ingresa el código ahora y disfruta tu beneficio! 🚀',
updated_at = now()
WHERE id IN (SELECT id FROM public.redemption_message_settings LIMIT 1);

-- If no record exists, insert the default template
INSERT INTO public.redemption_message_settings (message_template)
SELECT '🎊 ¡FELICITACIONES {{nombre_cliente}}! 🎊

🎁 Estás canjeando:
• {{puntos}} puntos
• Por {{kilos}} kg GRATIS

🔐 Tu código secreto:
*{{codigo}}*

⏰ ¡Rápido! Expira en 10 minutos

Ingresa el código ahora y disfruta tu beneficio! 🚀'
WHERE NOT EXISTS (SELECT 1 FROM public.redemption_message_settings);