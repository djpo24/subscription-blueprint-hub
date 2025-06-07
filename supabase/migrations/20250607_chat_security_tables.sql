
-- Tabla para rate limiting del chat
CREATE TABLE IF NOT EXISTS chat_rate_limit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    message_length INTEGER NOT NULL,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para estado de usuarios del chat
CREATE TABLE IF NOT EXISTS user_chat_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    block_reason TEXT,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para actividad sospechosa
CREATE TABLE IF NOT EXISTS suspicious_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_chat_rate_limit_user_time ON chat_rate_limit(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_chat_status_blocked ON user_chat_status(is_blocked) WHERE is_blocked = TRUE;
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_time ON suspicious_activity(created_at);
CREATE INDEX IF NOT EXISTS idx_suspicious_activity_user ON suspicious_activity(user_id);

-- RLS Policies
ALTER TABLE chat_rate_limit ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;

-- Policies para chat_rate_limit (solo administradores pueden ver)
CREATE POLICY "Admins can view chat rate limit logs" ON chat_rate_limit FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Policies para user_chat_status (solo administradores pueden gestionar)
CREATE POLICY "Admins can manage user chat status" ON user_chat_status FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Policies para suspicious_activity (solo administradores pueden ver)
CREATE POLICY "Admins can view suspicious activity" ON suspicious_activity FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.id = auth.uid() 
        AND user_profiles.role = 'admin'
    )
);

-- Función para limpiar datos antiguos (ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_old_chat_security_data()
RETURNS void AS $$
BEGIN
    -- Eliminar logs de rate limiting mayores a 30 días
    DELETE FROM chat_rate_limit 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Eliminar actividad sospechosa mayor a 90 días
    DELETE FROM suspicious_activity 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Desbloquear usuarios cuyo bloqueo ya expiró
    UPDATE user_chat_status 
    SET is_blocked = FALSE, blocked_until = NULL 
    WHERE is_blocked = TRUE 
    AND blocked_until IS NOT NULL 
    AND blocked_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentarios para documentación
COMMENT ON TABLE chat_rate_limit IS 'Registro de mensajes para implementar rate limiting en el chat';
COMMENT ON TABLE user_chat_status IS 'Estado de usuarios para el sistema de chat (bloqueados, etc.)';
COMMENT ON TABLE suspicious_activity IS 'Registro de actividad sospechosa detectada por el sistema';
