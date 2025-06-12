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
  const {
    toast
  } = useToast();
  const handleToggle = () => {
    const newState = !isBotEnabled;
    toggleBot(newState);
    toast({
      title: newState ? "🤖 Bot activado globalmente" : "🔕 Bot desactivado globalmente",
      description: newState ? "El bot responderá automáticamente en todos los chats" : "El bot no responderá automáticamente en ningún chat"
    });
  };
  return <div className="flex items-center gap-2">
      <Button variant={isBotEnabled ? "default" : "outline"} size="sm" onClick={handleToggle} className="flex items-center gap-2">
        {isBotEnabled ? <Bot className="h-4 w-4" /> : <BotOff className="h-4 w-4" />}
        {isBotEnabled ? "Bot ON" : "Bot OFF"}
      </Button>
      
      
    </div>;
}