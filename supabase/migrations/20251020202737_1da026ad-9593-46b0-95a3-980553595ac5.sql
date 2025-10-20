-- Create table for bulk fidelization message settings
CREATE TABLE IF NOT EXISTS public.bulk_fidelization_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Template for customers with >= 1000 points (can redeem)
  redeemable_template TEXT NOT NULL DEFAULT '🎉 *¡Felicidades {{nombre_cliente}}!*

¡Tienes *{{puntos_disponibles}} puntos* acumulados! 🌟

✨ *¡Ya puedes canjear tus puntos!*

🎁 Cada 1,000 puntos = 1 kg de descuento
💰 Con tus puntos puedes obtener hasta *{{kilos_disponibles}} kg* de descuento

📱 Contáctanos para redimir tus puntos y ahorrar en tu próximo envío:
🇨🇴Darwin (Colombia): +573127271746

✈️ Envíos Ojito - Conectando Barranquilla y Curazao.',
  redeemable_use_template BOOLEAN DEFAULT false,
  redeemable_template_name TEXT,
  redeemable_template_language TEXT DEFAULT 'es_CO',
  
  -- Template for customers with < 1000 points (motivational)
  motivational_template TEXT NOT NULL DEFAULT '🌟 *¡Hola {{nombre_cliente}}!*

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
  motivational_use_template BOOLEAN DEFAULT false,
  motivational_template_name TEXT,
  motivational_template_language TEXT DEFAULT 'es_CO',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bulk_fidelization_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage bulk fidelization settings"
  ON public.bulk_fidelization_settings
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage bulk fidelization settings"
  ON public.bulk_fidelization_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create table for bulk fidelization message log
CREATE TABLE IF NOT EXISTS public.bulk_fidelization_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('redeemable', 'motivational')),
  message_content TEXT NOT NULL,
  points_available INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  whatsapp_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bulk_fidelization_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage bulk fidelization log"
  ON public.bulk_fidelization_log
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage bulk fidelization log"
  ON public.bulk_fidelization_log
  FOR ALL
  USING (true)
  WITH CHECK (true);