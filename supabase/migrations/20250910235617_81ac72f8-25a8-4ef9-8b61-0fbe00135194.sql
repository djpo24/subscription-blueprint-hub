-- Crear el secreto WHATSAPP_OUTBOUND_APP_KEY que faltaba
INSERT INTO public.app_secrets (name, value, updated_at)
VALUES ('WHATSAPP_OUTBOUND_APP_KEY', 'manual-send-2024-secure', NOW())
ON CONFLICT (name) DO UPDATE SET 
  value = EXCLUDED.value, 
  updated_at = EXCLUDED.updated_at;