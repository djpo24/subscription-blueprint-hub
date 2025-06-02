
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChatConversation } from './ChatConversation';
import { useChatData } from '@/hooks/useChatData';
import { useChatMessages } from '@/hooks/useChatMessages';
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
  const { conversationsByPhone, isLoading } = useChatData();
  const { handleSendMessage, isManualSending } = useChatMessages();
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);

  // Buscar el teléfono del cliente en las conversaciones existentes
  useEffect(() => {
    if (open && customerId && conversationsByPhone) {
      const phoneForCustomer = Object.keys(conversationsByPhone).find(phone => 
        conversationsByPhone[phone].customerId === customerId
      );
      setSelectedPhone(phoneForCustomer || null);
    }
  }, [open, customerId, conversationsByPhone]);

  const handleSendMessageWrapper = async (message: string, image?: File) => {
    if (!selectedPhone) return;
    
    const selectedConversation = conversationsByPhone[selectedPhone];
    if (!selectedConversation) return;

    await handleSendMessage(
      selectedPhone,
      selectedConversation.customerId,
      message,
      image
    );
  };

  if (!open || !customerId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat con {customerName || 'Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Cargando conversación...</div>
            </div>
          ) : selectedPhone && conversationsByPhone[selectedPhone] ? (
            <div className="h-[500px]">
              <ChatConversation
                phone={selectedPhone}
                customerName={conversationsByPhone[selectedPhone].customerName}
                customerId={conversationsByPhone[selectedPhone].customerId}
                messages={conversationsByPhone[selectedPhone].messages}
                isRegistered={!!conversationsByPhone[selectedPhone].customerId}
                onSendMessage={handleSendMessageWrapper}
                isLoading={isManualSending}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No hay conversación</h3>
              <p className="text-gray-500 max-w-sm">
                Este cliente aún no ha enviado mensajes por WhatsApp. 
                La conversación aparecerá aquí cuando el cliente escriba.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
