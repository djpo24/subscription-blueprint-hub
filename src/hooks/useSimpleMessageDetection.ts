
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string | null;
  message_content: string;
  timestamp: string;
}

interface MessageDetectionProps {
  isEnabled: boolean;
  onMessageDetected: (message: DetectedMessage) => void;
}

export function useSimpleMessageDetection({ isEnabled, onMessageDetected }: MessageDetectionProps) {
  const channelRef = useRef<any>(null);
  const processedMessages = useRef(new Set<string>());
  const isConnectedRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (channelRef.current) {
      console.log('🔌 Desconectando canal de mensajes');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    
    isConnectedRef.current = false;
  }, []);

  const createChannel = useCallback(() => {
    console.log('🔄 Creando canal de detección de mensajes...');
    
    const channel = supabase
      .channel(`messages-${Date.now()}`)
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
            customerId: newMessage.customer_id || 'NO_REGISTRADO'
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

          // Marcar como procesado
          processedMessages.current.add(newMessage.id);

          // Limpiar cache si es muy grande
          if (processedMessages.current.size > 50) {
            const entries = Array.from(processedMessages.current);
            processedMessages.current.clear();
            entries.slice(-25).forEach(id => processedMessages.current.add(id));
          }

          // Procesar mensaje
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
        console.log('📡 Estado del canal:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal conectado exitosamente');
          isConnectedRef.current = true;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('❌ Error en canal:', status);
          isConnectedRef.current = false;
          
          // Reconectar automáticamente
          if (isEnabled && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Reintentando conexión...');
              cleanup();
              channelRef.current = createChannel();
              reconnectTimeoutRef.current = null;
            }, 3000);
          }
        }
      });

    return channel;
  }, [isEnabled, onMessageDetected, cleanup]);

  useEffect(() => {
    if (!isEnabled) {
      console.log('🚫 Detección de mensajes deshabilitada');
      cleanup();
      return;
    }

    console.log('🎯 Iniciando detección de mensajes...');
    channelRef.current = createChannel();

    return cleanup;
  }, [isEnabled, createChannel, cleanup]);

  return {
    isConnected: isConnectedRef.current,
    processedCount: processedMessages.current.size
  };
}
