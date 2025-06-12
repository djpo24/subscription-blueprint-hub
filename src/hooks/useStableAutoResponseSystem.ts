
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useSimpleMessageDetection } from './useSimpleMessageDetection';
import { useReliableAutoResponse } from './useReliableAutoResponse';

export function useStableAutoResponseSystem() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { processAutoResponse } = useReliableAutoResponse();

  console.log('🎛️ Estado del bot de auto-respuesta:', {
    enabled: isAutoResponseEnabled,
    mode: 'AUTOMÁTICO_MEJORADO'
  });

  // Sistema de detección con callback mejorado
  const { isConnected, processedCount } = useSimpleMessageDetection({
    isEnabled: isAutoResponseEnabled,
    onMessageDetected: async (message) => {
      try {
        if (!isAutoResponseEnabled) {
          console.log('🚫 Auto-respuesta deshabilitada durante procesamiento');
          return;
        }

        console.log('🚀 MENSAJE DETECTADO - ACTIVANDO AUTO-RESPUESTA');
        console.log('📞 Teléfono:', message.from_phone);
        console.log('💬 Contenido:', message.message_content.substring(0, 50) + '...');
        
        // Procesar inmediatamente sin esperar
        await processAutoResponse(message);
      } catch (error) {
        console.error('❌ Error en callback de auto-respuesta:', error);
      }
    }
  });

  const systemStatus = {
    isActive: isAutoResponseEnabled && isConnected,
    processedCount,
    isEnabled: isAutoResponseEnabled,
    isConnected
  };

  console.log('📊 Estado completo del sistema:', systemStatus);

  return systemStatus;
}
