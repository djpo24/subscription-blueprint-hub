
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatConversation } from './ChatConversation';
import { useChatData } from '@/hooks/useChatData';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useCustomerData } from '@/hooks/useCustomerData';
import { MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  const { conversationsByPhone, isLoading: chatLoading } = useChatData();
  const { customer, isLoading: customerLoading, getPhoneNumber } = useCustomerData(customerId);
  const { handleSendMessage, isManualSending } = useChatMessages();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Buscar el teléfono del cliente en las conversaciones existentes o usar el del customer
  useEffect(() => {
    if (open && customerId) {
      // Primero intentar encontrar una conversación existente
      const phoneForCustomer = Object.keys(conversationsByPhone || {}).find(phone => 
        conversationsByPhone[phone].customerId === customerId
      );
      
      if (phoneForCustomer) {
        setSelectedPhone(phoneForCustomer);
      } else {
        // Si no hay conversación existente, usar el teléfono del cliente
        const customerPhone = getPhoneNumber();
        setSelectedPhone(customerPhone);
      }
    }
  }, [open, customerId, conversationsByPhone, getPhoneNumber]);

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
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat con {displayName}
          </DialogTitle>
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
                messages={existingConversation?.messages || []}
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
