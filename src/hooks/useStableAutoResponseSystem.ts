
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useSimpleMessageDetection } from './useSimpleMessageDetection';
import { useReliableAutoResponse } from './useReliableAutoResponse';

export function useStableAutoResponseSystem() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { processAutoResponse } = useReliableAutoResponse();

  // Sistema de auto-respuesta automática - responde inmediatamente a mensajes entrantes
  const { isConnected, processedCount } = useSimpleMessageDetection({
    isEnabled: isAutoResponseEnabled,
    onMessageDetected: async (message) => {
      if (isAutoResponseEnabled) {
        console.log('🚀 ACTIVANDO AUTO-RESPUESTA AUTOMÁTICA:', message.from_phone);
        // Procesar inmediatamente sin esperar
        processAutoResponse(message);
      }
    }
  });

  console.log('🎛️ Estado del sistema de auto-respuesta automática:', {
    enabled: isAutoResponseEnabled,
    connected: isConnected,
    processed: processedCount,
    mode: 'AUTOMÁTICO'
  });

  return {
    isActive: isAutoResponseEnabled && isConnected,
    processedCount
  };
}
