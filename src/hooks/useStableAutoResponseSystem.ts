
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useSimpleMessageDetection } from './useSimpleMessageDetection';
import { useReliableAutoResponse } from './useReliableAutoResponse';

export function useStableAutoResponseSystem() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { processAutoResponse } = useReliableAutoResponse();

  // Sistema simplificado de detección y respuesta
  const { isConnected, processedCount } = useSimpleMessageDetection({
    isEnabled: isAutoResponseEnabled,
    onMessageDetected: processAutoResponse
  });

  console.log('🎛️ Estado del sistema de auto-respuesta:', {
    enabled: isAutoResponseEnabled,
    connected: isConnected,
    processed: processedCount
  });

  return {
    isActive: isAutoResponseEnabled && isConnected,
    processedCount
  };
}
