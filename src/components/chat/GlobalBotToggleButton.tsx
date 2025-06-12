
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, BotOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGlobalBotToggle } from '@/hooks/useGlobalBotToggle';

export function GlobalBotToggleButton() {
  const {
    isBotEnabled,
    toggleBot
  } = useGlobalBotToggle();
  const { toast } = useToast();

  const handleToggle = () => {
    toast({
      title: "🚫 Sistema de escalación desactivado",
      description: "El bot permanece siempre activo. No hay escalaciones automáticas.",
      variant: "destructive"
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleToggle} 
        className="flex items-center gap-2"
        disabled
      >
        <Bot className="h-4 w-4" />
        Bot ON (Sin escalación)
      </Button>
      
      <Badge variant="destructive" className="text-xs">
        Escalación desactivada
      </Badge>
    </div>
  );
}
