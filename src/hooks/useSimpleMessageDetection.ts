
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
  const lastMessageIdRef = useRef<string | null>(null);

  const cleanup = useCallback(() => {
    console.log('🧹 Limpieza del canal de detección...');
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.log('⚠️ Error al remover canal:', error);
      }
      channelRef.current = null;
    }
    
    setIsConnected(false);
    isInitializingRef.current = false;
    console.log('✅ Canal limpiado correctamente');
  }, []);

  const createChannel = useCallback(() => {
    // Prevenir múltiples inicializaciones
    if (isInitializingRef.current || channelRef.current) {
      console.log('⏳ Canal ya existe o se está inicializando, omitiendo creación...');
      return;
    }

    console.log('🔄 Creando canal único de detección de mensajes...');
    isInitializingRef.current = true;
    
    // Usar un nombre de canal más estable
    const channelName = 'auto-response-messages';
    
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
          
          console.log('📨 MENSAJE DETECTADO:', {
            id: newMessage.id,
            phone: newMessage.from_phone,
            customer: newMessage.customer_id || 'NO_REGISTRADO'
          });
          
          // Validaciones estrictas para evitar duplicados
          if (!newMessage || !newMessage.id || !newMessage.from_phone || !newMessage.message_content) {
            console.log('⚠️ Mensaje inválido, omitiendo:', newMessage);
            return;
          }

          // Verificar si es el mismo mensaje que acabamos de procesar
          if (lastMessageIdRef.current === newMessage.id) {
            console.log('⏭️ Mensaje duplicado detectado, omitiendo:', newMessage.id);
            return;
          }

          // Verificar si ya fue procesado
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Mensaje ya procesado anteriormente:', newMessage.id);
            return;
          }

          // Solo procesar mensajes entrantes (no nuestros mensajes salientes)
          if (newMessage.is_from_customer === false) {
            console.log('📤 Mensaje saliente detectado, omitiendo auto-respuesta');
            return;
          }

          // Actualizar referencia del último mensaje
          lastMessageIdRef.current = newMessage.id;

          console.log('🚀 PROCESANDO MENSAJE ÚNICO PARA AUTO-RESPUESTA:', {
            id: newMessage.id,
            phone: newMessage.from_phone,
            customer: newMessage.customer_id || 'NO_REGISTRADO'
          });

          // Marcar como procesado ANTES de llamar el callback
          processedMessages.current.add(newMessage.id);
          setProcessedCount(processedMessages.current.size);

          // Activar callback de auto-respuesta con throttling
          try {
            onMessageDetected({
              id: newMessage.id,
              from_phone: newMessage.from_phone,
              customer_id: newMessage.customer_id || null,
              message_content: newMessage.message_content || '',
              timestamp: newMessage.timestamp || new Date().toISOString()
            });
          } catch (error) {
            console.error('❌ Error en callback de auto-respuesta:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado del canal:', status, 'para', channelName);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal único de auto-respuesta CONECTADO');
          channelRef.current = channel;
          setIsConnected(true);
          isInitializingRef.current = false;
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.log('❌ Error en canal de auto-respuesta:', status);
          setIsConnected(false);
          isInitializingRef.current = false;
          channelRef.current = null;
          
          // Reconectar con mayor intervalo para evitar loops
          if (isEnabled && !reconnectTimeoutRef.current) {
            console.log('🔄 Programando reconexión en 10 segundos...');
            reconnectTimeoutRef.current = setTimeout(() => {
              createChannel();
              reconnectTimeoutRef.current = null;
            }, 10000); // Aumentado a 10 segundos
          }
        }
      });
  }, [isEnabled, onMessageDetected]);

  useEffect(() => {
    if (!isEnabled) {
      console.log('🚫 Auto-respuesta DESHABILITADA - limpiando canal');
      cleanup();
      return;
    }

    console.log('🎯 AUTO-RESPUESTA HABILITADA - iniciando sistema único');
    
    // Solo crear canal si no existe
    if (!channelRef.current && !isInitializingRef.current) {
      createChannel();
    }

    return cleanup;
  }, [isEnabled, createChannel, cleanup]);

  // Limpiar cache periódicamente pero mantener más entradas
  useEffect(() => {
    if (processedMessages.current.size > 100) {
      console.log('🧹 Limpiando cache de mensajes procesados');
      const entries = Array.from(processedMessages.current);
      processedMessages.current.clear();
      // Mantener los últimos 50 en lugar de 25
      entries.slice(-50).forEach(id => processedMessages.current.add(id));
      setProcessedCount(processedMessages.current.size);
    }
  }, [processedCount]);

  return {
    isConnected,
    processedCount
  };
}
