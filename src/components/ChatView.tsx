
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User, Clock, Phone, Send } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

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

export function ChatView() {
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { sendManualNotification, isManualSending } = useNotifications();

  const { data: incomingMessages = [], isLoading, refetch } = useQuery({
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
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Group messages by phone number
  const messagesByPhone = incomingMessages.reduce((acc, message) => {
    const phone = message.from_phone;
    if (!acc[phone]) {
      acc[phone] = [];
    }
    acc[phone].push(message);
    return acc;
  }, {} as Record<string, IncomingMessage[]>);

  const handleReplyChange = (phone: string, message: string) => {
    setReplyMessages(prev => ({
      ...prev,
      [phone]: message
    }));
  };

  const handleSendReply = async (phone: string, customerId: string | null) => {
    const message = replyMessages[phone];
    if (!message?.trim()) {
      toast({
        title: "Error",
        description: "Por favor escriba un mensaje antes de enviar",
        variant: "destructive"
      });
      return;
    }

    try {
      // If we don't have a customer ID, we need to create a temporary one or handle it differently
      if (!customerId) {
        // Create notification log entry without customer ID
        const { data: notificationData, error: logError } = await supabase
          .from('notification_log')
          .insert({
            package_id: null,
            customer_id: null,
            notification_type: 'manual_reply',
            message: message,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) throw logError;

        // Send WhatsApp notification
        const response = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notificationData.id,
            phone: phone,
            message: message
          }
        });

        if (response.error) throw response.error;
      } else {
        // Use the existing sendManualNotification for registered customers
        await sendManualNotification({
          customerId: customerId,
          packageId: '', // We don't have a specific package for chat replies
          message: message,
          phone: phone
        });
      }

      // Clear the reply input
      setReplyMessages(prev => ({
        ...prev,
        [phone]: ''
      }));

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

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'text':
        return "bg-blue-100 text-blue-800";
      case 'image':
        return "bg-green-100 text-green-800";
      case 'audio':
        return "bg-purple-100 text-purple-800";
      case 'video':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone.startsWith('57')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
    }
    return `+${phone}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando mensajes del chat...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Chat con Clientes</h2>
          <p className="text-gray-600">Mensajes entrantes de WhatsApp</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {Object.keys(messagesByPhone).length} conversaciones
        </Badge>
      </div>

      {Object.keys(messagesByPhone).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
            <p className="text-gray-500">
              Los mensajes de WhatsApp aparecerán aquí cuando los clientes escriban
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(messagesByPhone).map(([phone, messages]) => {
            const latestMessage = messages[0];
            const customerName = latestMessage.customers?.name;
            const isRegistered = !!latestMessage.customer_id;

            return (
              <Card key={phone} className="h-fit">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {customerName || 'Cliente Anónimo'}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {formatPhoneNumber(phone)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge 
                        variant={isRegistered ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isRegistered ? 'Registrado' : 'No registrado'}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {format(new Date(latestMessage.message_timestamp), 'dd/MM HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-40">
                    <div className="space-y-3">
                      {messages.slice().reverse().map((message) => (
                        <div key={message.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-start justify-between mb-2">
                            <Badge 
                              className={getMessageTypeColor(message.message_type)} 
                              variant="secondary"
                            >
                              {message.message_type}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.message_timestamp), 'HH:mm', { locale: es })}
                            </span>
                          </div>
                          <div className="text-sm">
                            {message.message_content || '(Sin contenido de texto)'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-3">
                      {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
                    </div>
                    
                    {/* Reply Form */}
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Escribir respuesta..."
                        value={replyMessages[phone] || ''}
                        onChange={(e) => handleReplyChange(phone, e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                      <Button
                        onClick={() => handleSendReply(phone, latestMessage.customer_id)}
                        disabled={isManualSending || !replyMessages[phone]?.trim()}
                        className="w-full"
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isManualSending ? 'Enviando...' : 'Enviar Respuesta'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
