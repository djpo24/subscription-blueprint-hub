
-- Agregar columnas faltantes para el correcto funcionamiento del webhook V3

-- Agregar columna raw_data a incoming_messages para almacenar datos completos del webhook
ALTER TABLE public.incoming_messages 
ADD COLUMN IF NOT EXISTS raw_data jsonb;

-- Agregar columna profile_image_url a customers para las fotos de perfil de WhatsApp
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS profile_image_url text;

-- Agregar columnas faltantes a sent_messages para compatibilidad con el sistema de chat
-- Primero verificar la estructura actual y agregar solo las columnas que no existen

-- Agregar columna phone si no existe (renombrar phone_number si existe)
DO $$ 
BEGIN
    -- Si existe phone_number, renombrarlo a phone
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sent_messages' AND column_name = 'phone_number') THEN
        ALTER TABLE public.sent_messages RENAME COLUMN phone_number TO phone;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'sent_messages' AND column_name = 'phone') THEN
        ALTER TABLE public.sent_messages ADD COLUMN phone text NOT NULL DEFAULT '';
    END IF;
END $$;

-- Agregar columna message si no existe (renombrar message_content si existe)
DO $$ 
BEGIN
    -- Si existe message_content, renombrarlo a message
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sent_messages' AND column_name = 'message_content') THEN
        ALTER TABLE public.sent_messages RENAME COLUMN message_content TO message;
    ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'sent_messages' AND column_name = 'message') THEN
        ALTER TABLE public.sent_messages ADD COLUMN message text;
    END IF;
END $$;

-- Agregar columnas adicionales necesarias
ALTER TABLE public.sent_messages 
ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.sent_messages 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent';

-- Eliminar columna delivery_status duplicada si existe
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sent_messages' AND column_name = 'delivery_status') THEN
        ALTER TABLE public.sent_messages DROP COLUMN delivery_status;
    END IF;
END $$;

-- Comentario: Estas columnas son necesarias para:
-- 1. raw_data: Almacenar el payload completo del webhook para debugging
-- 2. profile_image_url: Mostrar fotos de perfil de WhatsApp en el chat
-- 3. Estandarizar la tabla sent_messages para compatibilidad con el sistema de chat
