
-- Asegurar que incoming_messages tenga realtime habilitado
ALTER TABLE public.incoming_messages REPLICA IDENTITY FULL;

-- Agregar la tabla a la publicación de realtime si no está
DO $$
BEGIN
    -- Verificar si la tabla ya está en la publicación
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'incoming_messages'
    ) THEN
        -- Agregar la tabla a la publicación
        ALTER PUBLICATION supabase_realtime ADD TABLE public.incoming_messages;
    END IF;
END $$;
