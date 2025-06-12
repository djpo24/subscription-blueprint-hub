
import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string | null;
  message_content: string;
  timestamp: string;
}

export interface MessageDetectionProps {
  isEnabled: boolean;
  onMessageDetected: (message: DetectedMessage) => void;
}

export function useSimpleMessageDetection({ isEnabled, onMessageDetected }: MessageDetectionProps) {
  const channelRef = useRef<any>(null);
  const processedMessages = useRef(new Set<string>());
  const [isConnected, setIsConnected] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializingRef = useRef(false);

  const cleanup = useCallback(() => {
    console.log('🧹 Iniciando limpieza del canal...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (channelRef.current) {
      console.log('🔌 Removiendo canal existente');
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.log('⚠️ Error al remover canal:', error);
      }
      channelRef.current = null;
    }
    
    setIsConnected(false);
    isInitializingRef.current = false;
    console.log('✅ Limpieza completada');
  }, []);

  const createChannel = useCallback(() => {
    // Evitar crear múltiples canales si ya estamos inicializando
    if (isInitializingRef.current || channelRef.current) {
      console.log('⏳ Canal ya existe o está siendo creado, omitiendo...');
      return;
    }

    console.log('🔄 Creando nuevo canal de detección...');
    isInitializingRef.current = true;
    
    const channelName = `messages-detection-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_messages'
        },
        (payload) => {
          const newMessage = payload.new as any;
          
          console.log('📨 Nuevo mensaje detectado:', {
            id: newMessage.id,
            phone: newMessage.from_phone,
            customerId: newMessage.customer_id || 'NO_REGISTRADO',
            content: newMessage.message_content?.substring(0, 50) + '...'
          });

          // Verificar si ya fue procesado
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Mensaje ya procesado, omitiendo');
            return;
          }

          // Validar datos mínimos
          if (!newMessage.from_phone || !newMessage.message_content) {
            console.log('⚠️ Mensaje incompleto, omitiendo');
            return;
          }

          // Solo procesar mensajes de clientes (no nuestros mensajes salientes)
          if (newMessage.is_from_customer === false) {
            console.log('📤 Mensaje saliente, omitiendo auto-respuesta');
            return;
          }

          // Marcar como procesado
          processedMessages.current.add(newMessage.id);
          setProcessedCount(processedMessages.current.size);

          // Limpiar cache si es muy grande
          if (processedMessages.current.size > 50) {
            const entries = Array.from(processedMessages.current);
            processedMessages.current.clear();
            entries.slice(-25).forEach(id => processedMessages.current.add(id));
            setProcessedCount(processedMessages.current.size);
          }

          // Activar auto-respuesta inmediatamente
          console.log('🚀 Activando auto-respuesta automática para:', newMessage.from_phone);
          
          onMessageDetected({
            id: newMessage.id,
            from_phone: newMessage.from_phone,
            customer_id: newMessage.customer_id || null,
            message_content: newMessage.message_content || '',
            timestamp: newMessage.timestamp
          });
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado del canal:', status, 'Canal:', channelName);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal conectado exitosamente');
          channelRef.current = channel;
          setIsConnected(true);
          isInitializingRef.current = false;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('❌ Error en canal:', status);
          setIsConnected(false);
          isInitializingRef.current = false;
          channelRef.current = null;
          
          // Reconectar automáticamente solo si está habilitado
          if (isEnabled && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Reintentando conexión automática...');
              createChannel();
              reconnectTimeoutRef.current = null;
            }, 3000);
          }
        }
      });
  }, [isEnabled, onMessageDetected]);

  useEffect(() => {
    if (!isEnabled) {
      console.log('🚫 Auto-respuesta deshabilitada, limpiando...');
      cleanup();
      return;
    }

    // Solo crear canal si no existe uno activo y no estamos inicializando
    if (!channelRef.current && !isInitializingRef.current) {
      console.log('🎯 Iniciando sistema de auto-respuesta...');
      createChannel();
    }

    return cleanup;
  }, [isEnabled, createChannel, cleanup]);

  return {
    isConnected,
    processedCount
  };
}
