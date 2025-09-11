
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function GlobalBotToggleButton() {
  const { toast } = useToast();

  const handleToggle = () => {
    toast({
      title: "🤖 Bot siempre activo",
      description: "El bot responde a TODOS los mensajes. Sistema de escalación completamente desactivado.",
      variant: "default"
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="default" 
        size="sm" 
        onClick={handleToggle} 
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
      >
        <Bot className="h-4 w-4" />
        Bot SIEMPRE Activo
      </Button>
      
      <Badge variant="default" className="text-xs bg-green-100 text-green-800">
        Sin escalación
      </Badge>
    </div>
  );
}
