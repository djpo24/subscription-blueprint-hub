
-- Create app_secrets table to store application secrets
CREATE TABLE IF NOT EXISTS public.app_secrets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to manage secrets
CREATE POLICY "Service role can manage app secrets" ON public.app_secrets
    FOR ALL USING (auth.role() = 'service_role');

-- Insert default Meta WhatsApp secrets if they don't exist
INSERT INTO public.app_secrets (name, value) 
VALUES 
    ('META_WHATSAPP_TOKEN', 'EAAUbycRf1F0BO9po5k3rok0gj1NBf8E1f6NCCW6juXezkCUTUhiLc7YJ5IL4KTcepW9WBQ9QIDPZAsIu9E8n9KFZCrlTnjvxpCOt1ZBqSyi0ZBmhvDFqUZAQuJGgiAOygHf05Ehhkn9wuFHy8o2QmBUkYDWOJjNGh8OITnogsmFAardaHPTEVP8ZCiLlxP7QsGeBlZBVI19apvqZBH2TZAqvZAMcfC0HsBDEdnuvTjm2aelAAalogidBUZD'),
    ('META_WHATSAPP_VERIFY_TOKEN', 'ojitos_webhook_verify'),
    ('META_WHATSAPP_PHONE_NUMBER_ID', '123456789012345')
ON CONFLICT (name) DO NOTHING;

-- Create function to update secrets safely
CREATE OR REPLACE FUNCTION public.update_app_secret(secret_name TEXT, secret_value TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.app_secrets (name, value, updated_at)
    VALUES (secret_name, secret_value, NOW())
    ON CONFLICT (name) 
    DO UPDATE SET 
        value = EXCLUDED.value,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$;

-- Create function to get secrets safely
CREATE OR REPLACE FUNCTION public.get_app_secret(secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    secret_value TEXT;
BEGIN
    SELECT value INTO secret_value
    FROM public.app_secrets
    WHERE name = secret_name;
    
    RETURN secret_value;
END;
$$;
