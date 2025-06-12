
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
    
    setIsConnected(false);
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
        console.log('📡 Estado del canal:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal de auto-respuesta conectado exitosamente');
          setIsConnected(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('❌ Error en canal:', status);
          setIsConnected(false);
          
          // Reconectar automáticamente
          if (isEnabled && !reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('🔄 Reintentando conexión de auto-respuesta...');
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
      console.log('🚫 Auto-respuesta deshabilitada');
      cleanup();
      return;
    }

    console.log('🎯 Iniciando sistema de auto-respuesta automática...');
    channelRef.current = createChannel();

    return cleanup;
  }, [isEnabled, createChannel, cleanup]);

  return {
    isConnected,
    processedCount
  };
}
