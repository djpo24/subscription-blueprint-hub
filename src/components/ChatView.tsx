
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
import { useState, useEffect, useRef } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import { useSentMessages } from '@/hooks/useSentMessages';
import { ImageUpload } from '@/components/ImageUpload';

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
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const [selectedImages, setSelectedImages] = useState<Record<string, File | null>>({});
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const { toast } = useToast();
  const { sendManualNotification, isManualSending } = useNotifications();
  const { sentMessages, saveSentMessage } = useSentMessages();

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

  const handleReplyChange = (phone: string, message: string) => {
    setReplyMessages(prev => ({
      ...prev,
      [phone]: message
    }));
  };

  const handleImageSelect = (phone: string, file: File) => {
    setSelectedImages(prev => ({
      ...prev,
      [phone]: file
    }));
  };

  const handleImageRemove = (phone: string) => {
    setSelectedImages(prev => ({
      ...prev,
      [phone]: null
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, phone: string, customerId: string | null) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply(phone, customerId);
    }
  };

  const handleSendReply = async (phone: string, customerId: string | null) => {
    const message = replyMessages[phone];
    const selectedImage = selectedImages[phone];
    
    if (!message?.trim() && !selectedImage) {
      toast({
        title: "Error",
        description: "Por favor escriba un mensaje o seleccione una imagen antes de enviar",
        variant: "destructive"
      });
      return;
    }

    try {
      let imageUrl: string | undefined;

      // Si hay una imagen seleccionada, subirla primero
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, selectedImage);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrl;
      }

      // Crear el mensaje final
      const finalMessage = message?.trim() || (imageUrl ? '📷 Imagen' : '');

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
            phone: phone,
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
          phone: phone
        });
      }

      // Guardar mensaje enviado en nuestra tabla
      saveSentMessage({
        customerId: customerId,
        phone: phone,
        message: finalMessage,
        imageUrl: imageUrl
      });

      // Limpiar inputs
      setReplyMessages(prev => ({
        ...prev,
        [phone]: ''
      }));
      setSelectedImages(prev => ({
        ...prev,
        [phone]: null
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
          <p className="text-gray-600">Mensajes entrantes y salientes de WhatsApp</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          {Object.keys(conversationsByPhone).length} conversaciones
        </Badge>
      </div>

      {Object.keys(conversationsByPhone).length === 0 ? (
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
          {Object.entries(conversationsByPhone).map(([phone, conversation]) => {
            const { messages, latestIncoming, customerName, customerId } = conversation;
            const isRegistered = !!customerId;

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
                        {format(new Date(latestIncoming.message_timestamp), 'dd/MM HH:mm', { locale: es })}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-60">
                    <div className="space-y-3">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`rounded-lg p-3 ${
                            message.type === 'incoming' 
                              ? 'bg-gray-50 ml-0 mr-8' 
                              : 'bg-blue-50 ml-8 mr-0'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {message.type === 'incoming' ? (
                                <Badge 
                                  className={getMessageTypeColor(message.messageType || 'text')} 
                                  variant="secondary"
                                >
                                  {message.messageType || 'text'}
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-100 text-blue-800" variant="secondary">
                                  enviado
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              {format(new Date(message.timestamp), 'HH:mm', { locale: es })}
                            </span>
                          </div>
                          <div className="text-sm space-y-2">
                            {message.content}
                            {message.imageUrl && (
                              <img 
                                src={message.imageUrl} 
                                alt="Imagen enviada" 
                                className="max-w-48 rounded border"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-3">
                      {messages.length} mensaje{messages.length !== 1 ? 's' : ''}
                    </div>
                    
                    <div className="space-y-3">
                      <ImageUpload
                        onImageSelect={(file) => handleImageSelect(phone, file)}
                        selectedImage={selectedImages[phone] || null}
                        onImageRemove={() => handleImageRemove(phone)}
                      />
                      
                      <Textarea
                        ref={(el) => textareaRefs.current[phone] = el}
                        placeholder="Escribir respuesta... (Enter para enviar)"
                        value={replyMessages[phone] || ''}
                        onChange={(e) => handleReplyChange(phone, e.target.value)}
                        onKeyPress={(e) => handleKeyPress(e, phone, customerId)}
                        className="min-h-[80px] resize-none"
                      />
                      <Button
                        onClick={() => handleSendReply(phone, customerId)}
                        disabled={isManualSending || (!replyMessages[phone]?.trim() && !selectedImages[phone])}
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
