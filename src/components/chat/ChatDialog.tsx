
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatConversation } from './ChatConversation';
import { useChatData } from '@/hooks/useChatData';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useCustomerData } from '@/hooks/useCustomerData';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdvancedBotToggleButton } from './AdvancedBotToggleButton';
import type { ChatMessage } from '@/types/chatMessage';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string | null;
  customerName?: string;
  phone?: string;
}

export function ChatDialog({ 
  open, 
  onOpenChange, 
  customerId, 
  customerName,
  phone 
}: ChatDialogProps) {
  const { conversationsByPhone, isLoading: chatLoading, refetch: refetchChats } = useChatData();
  const { customer, isLoading: customerLoading, getPhoneNumber } = useCustomerData(customerId);
  const { handleSendMessage, isManualSending } = useChatMessages();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Debug log para ver la información del cliente
  useEffect(() => {
    if (customer) {
      console.log('ChatDialog - Customer data:', customer);
      console.log('ChatDialog - Profile image URL:', customer.profile_image_url);
    }
  }, [customer]);

  // Buscar el teléfono del cliente en las conversaciones existentes o usar el del customer
  useEffect(() => {
    if (open && customerId) {
      const customerPhone = getPhoneNumber();
      
      if (customerPhone) {
        // Normalizar el número para la búsqueda
        const normalizedCustomerPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
        
        // Buscar conversación existente por número de teléfono (comparación más flexible)
        const phoneForCustomer = Object.keys(conversationsByPhone || {}).find(phone => {
          const normalizedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
          return normalizedPhone === normalizedCustomerPhone || 
                 normalizedPhone.endsWith(normalizedCustomerPhone) || 
                 normalizedCustomerPhone.endsWith(normalizedPhone);
        });
        
        if (phoneForCustomer) {
          console.log('Found existing conversation for phone:', phoneForCustomer);
          setSelectedPhone(phoneForCustomer);
        } else {
          console.log('No existing conversation found, using customer phone:', customerPhone);
          setSelectedPhone(customerPhone);
        }
      }
    }
  }, [open, customerId, conversationsByPhone, getPhoneNumber]);

  // Refrescar chats cuando se vinculan mensajes
  useEffect(() => {
    if (customer && open) {
      // Pequeño delay para permitir que la vinculación se complete
      setTimeout(() => {
        refetchChats();
      }, 1000);
    }
  }, [customer, open, refetchChats]);

  const handleSendMessageWrapper = async (message: string, image?: File) => {
    if (!customerId) return;
    
    const phoneToUse = selectedPhone || getPhoneNumber();
    
    if (!phoneToUse) {
      console.error('No se pudo obtener el teléfono del cliente');
      return;
    }

    await handleSendMessage(
      phoneToUse,
      customerId,
      message,
      image
    );
    
    // Refrescar chats después de enviar mensaje
    refetchChats();
  };

  // Convert IncomingMessage to ChatMessage
  const convertToChatMessages = (messages: any[]): ChatMessage[] => {
    return messages.map(msg => ({
      id: msg.id,
      message_content: msg.message_content || '',
      message_type: msg.message_type || 'text',
      timestamp: msg.timestamp || new Date().toISOString(),
      whatsapp_message_id: msg.whatsapp_message_id,
      from_phone: msg.from_phone,
      is_from_customer: true,
      media_url: msg.media_url
    }));
  };

  if (!open || !customerId) return null;

  const existingConversation = selectedPhone && conversationsByPhone && conversationsByPhone[selectedPhone];
  const isLoading = chatLoading || customerLoading;
  const displayName = customerName || customer?.name || 'Cliente';
  const displayPhone = selectedPhone || getPhoneNumber() || '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Chat con {displayName}
            </DialogTitle>
            <AdvancedBotToggleButton />
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Cargando información del cliente...</div>
            </div>
          ) : (
            <div className="h-[500px]">
              <ChatConversation
                phone={displayPhone}
                customerName={displayName}
                customerId={customerId}
                messages={existingConversation ? convertToChatMessages(existingConversation.messages) : []}
                isRegistered={true}
                onSendMessage={handleSendMessageWrapper}
                isLoading={isManualSending}
                profileImageUrl={customer?.profile_image_url}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
