-- Create redemption message settings table
CREATE TABLE IF NOT EXISTS public.redemption_message_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_template TEXT NOT NULL DEFAULT '🎉 *Redención de Puntos*

Hola {{nombre_cliente}}! 👋

Has solicitado redimir *{{puntos}} puntos* por *{{kilos}} kg*.

Tu código de verificación es:

*{{codigo}}*

⏰ Este código expira en 10 minutos.

Por favor, ingresa este código en el sistema para completar tu redención.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redemption_message_settings ENABLE ROW LEVEL SECURITY;

-- Policies for redemption message settings
CREATE POLICY "Admins can manage redemption message settings"
  ON public.redemption_message_settings
  FOR ALL
  USING (get_current_user_role() = 'admin')
  WITH CHECK (get_current_user_role() = 'admin');

CREATE POLICY "System can manage redemption message settings"
  ON public.redemption_message_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default settings if table is empty
INSERT INTO public.redemption_message_settings (message_template)
SELECT '🎉 *Redención de Puntos*

Hola {{nombre_cliente}}! 👋

Has solicitado redimir *{{puntos}} puntos* por *{{kilos}} kg*.

Tu código de verificación es:

*{{codigo}}*

⏰ Este código expira en 10 minutos.

Por favor, ingresa este código en el sistema para completar tu redención.'
WHERE NOT EXISTS (SELECT 1 FROM public.redemption_message_settings);