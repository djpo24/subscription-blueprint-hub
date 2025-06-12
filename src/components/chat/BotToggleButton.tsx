
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, BotOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BotToggleButtonProps {
  customerPhone: string;
  onToggle?: (enabled: boolean) => void;
}

export function BotToggleButton({ customerPhone, onToggle }: BotToggleButtonProps) {
  const [isBotEnabled, setIsBotEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Cargar estado del bot desde localStorage
  useEffect(() => {
    const botKey = `bot-enabled-${customerPhone}`;
    const savedState = localStorage.getItem(botKey);
    if (savedState !== null) {
      setIsBotEnabled(JSON.parse(savedState));
    }
  }, [customerPhone]);

  const toggleBot = () => {
    setIsLoading(true);
    const newState = !isBotEnabled;
    
    // Guardar estado en localStorage
    const botKey = `bot-enabled-${customerPhone}`;
    localStorage.setItem(botKey, JSON.stringify(newState));
    
    setIsBotEnabled(newState);
    setIsLoading(false);

    // Notificar al componente padre
    onToggle?.(newState);

    // Mostrar toast
    toast({
      title: newState ? "🤖 Bot activado" : "🔕 Bot desactivado",
      description: newState 
        ? "El bot responderá automáticamente a los mensajes"
        : "El bot no responderá automáticamente",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isBotEnabled ? "default" : "outline"}
        size="sm"
        onClick={toggleBot}
        disabled={isLoading}
        className="flex items-center gap-2"
      >
        {isBotEnabled ? (
          <Bot className="h-4 w-4" />
        ) : (
          <BotOff className="h-4 w-4" />
        )}
        {isLoading ? "..." : (isBotEnabled ? "Bot ON" : "Bot OFF")}
      </Button>
      
      <Badge variant={isBotEnabled ? "default" : "secondary"} className="text-xs">
        {isBotEnabled ? "Automático" : "Manual"}
      </Badge>
    </div>
  );
}
