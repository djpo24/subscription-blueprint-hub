
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone } from 'lucide-react';

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: 'default' | 'floating' | 'inline';
  size?: 'sm' | 'default' | 'lg';
}

export function WhatsAppChatButton({ 
  phoneNumber = "50760123456", // Número por defecto - cambiar por el real
  message = "Hola! Me interesa saber más sobre sus servicios de envíos.",
  variant = 'default',
  size = 'default'
}: WhatsAppChatButtonProps) {
  
  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleWhatsAppClick}
          size="icon"
          className="h-14 w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          <span className="sr-only">Contactar por WhatsApp</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      size={size}
      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2"
    >
      <MessageCircle className="h-4 w-4" />
      Contactar por WhatsApp
    </Button>
  );
}
