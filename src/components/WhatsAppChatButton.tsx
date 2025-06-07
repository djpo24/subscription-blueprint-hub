
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  message?: string;
  variant?: 'default' | 'floating' | 'inline';
  size?: 'sm' | 'default' | 'lg';
}

export function WhatsAppChatButton({ 
  phoneNumber = "573001513792", // Número real de Envíos Ojitos
  message = "¡Hola! Me interesa conocer más sobre sus servicios de envíos. ¿Podrían ayudarme con información?",
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
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <Button
          onClick={handleWhatsAppClick}
          size="icon"
          className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
          <span className="sr-only">Contactar por WhatsApp</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleWhatsAppClick}
      size={size}
      className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2 text-sm md:text-base px-4 py-2 md:px-6 md:py-3"
    >
      <MessageCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Contactar por WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </Button>
  );
}
