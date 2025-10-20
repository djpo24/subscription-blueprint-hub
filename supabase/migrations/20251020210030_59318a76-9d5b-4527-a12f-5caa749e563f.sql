-- Insertar configuración inicial para mensajes masivos de fidelización si no existe
INSERT INTO public.bulk_fidelization_settings (
  redeemable_template,
  motivational_template,
  redeemable_use_template,
  motivational_use_template,
  redeemable_template_name,
  redeemable_template_language,
  motivational_template_name,
  motivational_template_language
)
SELECT 
  '🎉 *¡Felicidades {{nombre_cliente}}!*

¡Tienes *{{puntos_disponibles}} puntos* acumulados! 🌟

✨ *¡Ya puedes canjear tus puntos!*

🎁 Cada 1,000 puntos = 1 kg de descuento
💰 Con tus puntos puedes obtener hasta *{{kilos_disponibles}} kg* de descuento

📱 Contáctanos para redimir tus puntos y ahorrar en tu próximo envío:
🇨🇴Darwin (Colombia): +573127271746

✈️ Envíos Ojito - Conectando Barranquilla y Curazao.',
  '🌟 *¡Hola {{nombre_cliente}}!*

Tienes *{{puntos_disponibles}} puntos* acumulados 🎯

📊 Te faltan solo *{{puntos_faltantes}} puntos* para tu primer canje de 1 kg gratis!

💡 *¿Cómo conseguir más puntos?*
✅ 50 puntos por cada envío entregado
✅ +10 puntos por cada kg adicional (después del 1er kg)

🎁 Meta: 1,000 puntos = 1 kg gratis

¡Tu próximo envío te acerca a tu descuento! 📦

Contáctanos para tu próximo envío 📱:
🇨🇴Darwin (Colombia): +573127271746

✈️ Envíos Ojito - Conectando Barranquilla y Curazao.',
  false,
  false,
  NULL,
  'es_CO',
  NULL,
  'es_CO'
WHERE NOT EXISTS (SELECT 1 FROM public.bulk_fidelization_settings);