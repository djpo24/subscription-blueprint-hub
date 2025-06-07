
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, Send, Shield } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  message: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'failed';
}

export function SecureChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const COOLDOWN_MINUTES = 2; // Cooldown de 2 minutos entre mensajes
  const MAX_MESSAGE_LENGTH = 500;
  const MIN_MESSAGE_LENGTH = 5;

  const validateMessage = (): string | null => {
    if (!message.trim()) {
      return "El mensaje no puede estar vacío";
    }
    
    if (message.length < MIN_MESSAGE_LENGTH) {
      return `El mensaje debe tener al menos ${MIN_MESSAGE_LENGTH} caracteres`;
    }
    
    if (message.length > MAX_MESSAGE_LENGTH) {
      return `El mensaje no puede exceder ${MAX_MESSAGE_LENGTH} caracteres`;
    }

    // Verificar cooldown
    if (lastMessageTime) {
      const timeDiff = Date.now() - lastMessageTime.getTime();
      const cooldownMs = COOLDOWN_MINUTES * 60 * 1000;
      
      if (timeDiff < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - timeDiff) / (60 * 1000));
        return `Debes esperar ${remainingMinutes} minuto(s) antes de enviar otro mensaje`;
      }
    }

    // Detectar posible spam (mensajes repetitivos)
    const recentMessages = messages.slice(-3);
    const isDuplicate = recentMessages.some(msg => msg.message.trim().toLowerCase() === message.trim().toLowerCase());
    
    if (isDuplicate) {
      return "No puedes enviar el mismo mensaje repetidamente";
    }

    return null;
  };

  const sendMessage = async () => {
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes iniciar sesión para enviar mensajes",
        variant: "destructive"
      });
      return;
    }

    const validationError = validateMessage();
    if (validationError) {
      toast({
        title: "Mensaje inválido",
        description: validationError,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const messageId = Date.now().toString();
    const newMessage: ChatMessage = {
      id: messageId,
      message: message.trim(),
      timestamp: new Date(),
      status: 'sending'
    };

    // Agregar mensaje optimista a la UI
    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    try {
      // Registrar intento de envío para rate limiting
      const { error: logError } = await supabase
        .from('chat_rate_limit')
        .insert({
          user_id: user.id,
          message_length: newMessage.message.length,
          ip_address: 'frontend', // En producción, esto vendría del servidor
          created_at: new Date().toISOString()
        });

      if (logError) {
        console.warn('Error logging rate limit:', logError);
      }

      // Enviar mensaje a través de la función edge segura
      const { data, error } = await supabase.functions.invoke('secure-whatsapp-chat', {
        body: {
          message: newMessage.message,
          userId: user.id,
          userEmail: user.email
        }
      });

      if (error) {
        throw error;
      }

      // Actualizar estado del mensaje a enviado
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'sent' }
          : msg
      ));

      setLastMessageTime(new Date());

      toast({
        title: "Mensaje enviado",
        description: "Tu mensaje ha sido enviado exitosamente a través de WhatsApp",
      });

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Actualizar estado del mensaje a fallido
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'failed' }
          : msg
      ));

      let errorMessage = "Error al enviar mensaje";
      
      if (error.message?.includes('Rate limit exceeded')) {
        errorMessage = "Has excedido el límite de mensajes. Intenta más tarde.";
      } else if (error.message?.includes('Blocked')) {
        errorMessage = "Tu cuenta ha sido bloqueada por actividad sospechosa.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user) {
    return (
      <Button variant="outline" disabled className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        Chat (Requiere autenticación)
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Chat Seguro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Chat Seguro WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Información de seguridad */}
          <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
            <p className="font-medium mb-1">Medidas de seguridad activas:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Cooldown de {COOLDOWN_MINUTES} minutos entre mensajes</li>
              <li>Límite de {MAX_MESSAGE_LENGTH} caracteres por mensaje</li>
              <li>Detección automática de spam</li>
              <li>Registro de actividad para monitoreo</li>
            </ul>
          </div>

          {/* Historial de mensajes */}
          {messages.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-2 rounded text-sm ${
                  msg.status === 'sent' ? 'bg-green-100 text-green-800' :
                  msg.status === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  <p>{msg.message}</p>
                  <p className="text-xs opacity-70">
                    {msg.timestamp.toLocaleTimeString()} - {
                      msg.status === 'sending' ? 'Enviando...' :
                      msg.status === 'sent' ? 'Enviado' : 'Error'
                    }
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Campo de mensaje */}
          <div className="space-y-2">
            <Textarea
              placeholder={`Escribe tu mensaje (${MIN_MESSAGE_LENGTH}-${MAX_MESSAGE_LENGTH} caracteres)...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              className="min-h-[80px]"
              maxLength={MAX_MESSAGE_LENGTH}
            />
            
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>{message.length}/{MAX_MESSAGE_LENGTH} caracteres</span>
              {lastMessageTime && (
                <span>
                  Último mensaje: {lastMessageTime.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Botón de envío */}
          <Button 
            onClick={sendMessage}
            disabled={isLoading || !message.trim() || message.length < MIN_MESSAGE_LENGTH}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensaje
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
