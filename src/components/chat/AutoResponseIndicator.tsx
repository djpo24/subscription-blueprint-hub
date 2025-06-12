
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, AlertCircle } from 'lucide-react';
import { useAutoResponseDetection } from '@/hooks/useAutoResponseDetection';
import { useToast } from '@/hooks/use-toast';

export function AutoResponseIndicator() {
  const { isActive } = useAutoResponseDetection();
  const { toast } = useToast();

  if (!isActive) {
    return null;
  }

  const handleTestAutoResponse = () => {
    toast({
      title: "🤖 Sistema de Auto-respuesta",
      description: "El sistema está activo y monitoreando mensajes entrantes. Envía un mensaje de WhatsApp para probar.",
    });
  };

  const handleInfoClick = () => {
    toast({
      title: "ℹ️ Auto-respuesta activa",
      description: "El bot está monitoreando mensajes entrantes y responderá automáticamente",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="default" 
        className="flex items-center gap-1 animate-pulse cursor-pointer"
        onClick={handleTestAutoResponse}
      >
        <Bot className="h-3 w-3" />
        <Zap className="h-3 w-3" />
        <span className="text-xs">Auto-respuesta activa</span>
      </Badge>
      <AlertCircle 
        className="h-4 w-4 text-blue-500 cursor-help" 
        onClick={handleInfoClick}
      />
    </div>
  );
}
