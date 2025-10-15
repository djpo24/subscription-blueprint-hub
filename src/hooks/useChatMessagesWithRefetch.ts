import { useQueryClient } from '@tanstack/react-query';
import { useChatMessages } from './useChatMessages';

/**
 * Hook extendido que fuerza la actualización inmediata de la lista de chats
 * después de enviar un mensaje para actualizar el orden
 */
export function useChatMessagesWithRefetch() {
  const queryClient = useQueryClient();
  const { handleSendMessage: originalHandleSendMessage, isManualSending } = useChatMessages();

  const handleSendMessage = async (
    selectedPhone: string, 
    customerId: string | null,
    message: string, 
    image?: File
  ) => {
    await originalHandleSendMessage(selectedPhone, customerId, message, image);
    
    // Forzar actualización inmediata de la lista de chats
    await queryClient.invalidateQueries({ queryKey: ['chat-data'] });
    await queryClient.refetchQueries({ queryKey: ['chat-data'] });
  };

  return {
    handleSendMessage,
    isManualSending
  };
}
