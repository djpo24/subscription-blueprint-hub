
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useMessageDetection } from './useMessageDetection';
import { useAutoResponseEngine } from './useAutoResponseEngine';

export function useAutoResponseDetection() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { handleAutoResponse } = useAutoResponseEngine();

  // Set up message detection with auto-response handling
  const { isActive, processedCount } = useMessageDetection({
    isEnabled: isAutoResponseEnabled,
    onMessageDetected: handleAutoResponse
  });

  console.log('🤖 Auto-response system status:', {
    enabled: isAutoResponseEnabled,
    active: isActive,
    processedMessages: processedCount
  });

  return {
    isActive: isActive
  };
}
