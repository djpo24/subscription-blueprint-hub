
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { useSentMessages } from '@/hooks/useSentMessages';
import { ChatList } from './chat/ChatList';
import { ChatConversation } from './chat/ChatConversation';

interface IncomingMessage {
  id: string;
  whatsapp_message_id: string;
  from_phone: string;
  customer_id: string | null;
  message_type: string;
  message_content: string | null;
  message_timestamp: string;
  customers?: {
    name: string;
  } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  messageType?: string;
  imageUrl?: string;
}

export function ChatView() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const { toast } = useToast();
  const { sendManualNotification, isManualSending } = useNotifications();
  const { sentMessages, saveSentMessage } = useSentMessages();

  const { data: incomingMessages = [], isLoading } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async (): Promise<IncomingMessage[]> => {
      const { data, error } = await supabase
        .from('incoming_messages')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
      }
      
      return (data || []).map(msg => ({
        id: msg.id,
        whatsapp_message_id: msg.whatsapp_message_id,
        from_phone: msg.from_phone,
        customer_id: msg.customer_id,
        message_type: msg.message_type,
        message_content: msg.message_content,
        message_timestamp: msg.timestamp,
        customers: msg.customers
      }));
    },
    refetchInterval: 5000,
  });

  // Combinar mensajes entrantes y enviados por teléfono
  const messagesByPhone = incomingMessages.reduce((acc, message) => {
    const phone = message.from_phone;
    if (!acc[phone]) {
      acc[phone] = [];
    }
    acc[phone].push(message);
    return acc;
  }, {} as Record<string, IncomingMessage[]>);

  // Crear conversaciones completas con mensajes enviados y recibidos
  const conversationsByPhone = Object.keys(messagesByPhone).reduce((acc, phone) => {
    const incoming = messagesByPhone[phone];
    const outgoing = sentMessages.filter(msg => msg.phone === phone);
    
    const allMessages: ChatMessage[] = [
      ...incoming.map(msg => ({
        id: msg.id,
        content: msg.message_content || '(Sin contenido de texto)',
        timestamp: msg.message_timestamp,
        type: 'incoming' as const,
        messageType: msg.message_type
      })),
      ...outgoing.map(msg => ({
        id: msg.id,
        content: msg.message,
        timestamp: msg.sent_at,
        type: 'outgoing' as const,
        imageUrl: msg.image_url
      }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    acc[phone] = {
      messages: allMessages,
      latestIncoming: incoming[0],
      customerName: incoming[0]?.customers?.name,
      customerId: incoming[0]?.customer_id
    };

    return acc;
  }, {} as Record<string, {
    messages: ChatMessage[];
    latestIncoming: IncomingMessage;
    customerName?: string;
    customerId: string | null;
  }>);

  // Crear lista de chats para la columna izquierda
  const chatList = Object.entries(conversationsByPhone).map(([phone, conversation]) => ({
    phone,
    customerName: conversation.customerName,
    lastMessage: conversation.messages[conversation.messages.length - 1]?.content || 'Sin mensajes',
    lastMessageTime: conversation.latestIncoming.message_timestamp,
    isRegistered: !!conversation.customerId,
    unreadCount: 0 // Podrías implementar esto más tarde
  })).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  const handleSendMessage = async (message: string, image?: File) => {
    if (!selectedPhone) return;
    
    const selectedConversation = conversationsByPhone[selectedPhone];
    if (!selectedConversation) return;

    const { customerId } = selectedConversation;

    try {
      let imageUrl: string | undefined;

      // Si hay una imagen seleccionada, subirla primero
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrl;
      }

      // Crear el mensaje final
      const finalMessage = message || (imageUrl ? '📷 Imagen' : '');

      if (!customerId) {
        // Crear entrada de notificación sin customer ID
        const { data: notificationData, error: logError } = await supabase
          .from('notification_log')
          .insert({
            package_id: null,
            customer_id: null,
            notification_type: 'manual_reply',
            message: finalMessage,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) throw logError;

        // Enviar notificación WhatsApp
        const response = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notificationData.id,
            phone: selectedPhone,
            message: finalMessage,
            imageUrl: imageUrl
          }
        });

        if (response.error) throw response.error;
      } else {
        // Usar sendManualNotification para clientes registrados
        await sendManualNotification({
          customerId: customerId,
          packageId: '',
          message: finalMessage,
          phone: selectedPhone
        });
      }

      // Guardar mensaje enviado en nuestra tabla
      saveSentMessage({
        customerId: customerId,
        phone: selectedPhone,
        message: finalMessage,
        imageUrl: imageUrl
      });

      toast({
        title: "Mensaje enviado",
        description: "Su respuesta ha sido enviada por WhatsApp",
      });

    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando mensajes del chat...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="h-full flex">
        {/* Columna izquierda - Lista de chats */}
        <div className="w-1/3 min-w-[300px] max-w-[400px]">
          {chatList.length === 0 ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                <p className="text-gray-500">
                  Los mensajes de WhatsApp aparecerán aquí cuando los clientes escriban
                </p>
              </CardContent>
            </Card>
          ) : (
            <ChatList
              chats={chatList}
              selectedPhone={selectedPhone}
              onChatSelect={setSelectedPhone}
            />
          )}
        </div>

        {/* Columna derecha - Conversación seleccionada */}
        <div className="flex-1">
          {selectedPhone && conversationsByPhone[selectedPhone] ? (
            <ChatConversation
              phone={selectedPhone}
              customerName={conversationsByPhone[selectedPhone].customerName}
              customerId={conversationsByPhone[selectedPhone].customerId}
              messages={conversationsByPhone[selectedPhone].messages}
              isRegistered={!!conversationsByPhone[selectedPhone].customerId}
              onSendMessage={handleSendMessage}
              isLoading={isManualSending}
            />
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">
                  {chatList.length > 0 ? 'Selecciona un chat' : 'No hay conversaciones'}
                </h3>
                <p className="text-gray-500">
                  {chatList.length > 0 
                    ? 'Haz clic en una conversación de la izquierda para ver los mensajes'
                    : 'Las conversaciones aparecerán cuando los clientes escriban'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
