
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAutoResponseDetection } from '@/hooks/useAutoResponseDetection';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';
import { useToast } from '@/hooks/use-toast';

export function AutoResponseIndicator() {
  const { isActive } = useAutoResponseDetection();
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { toast } = useToast();

  const handleIndicatorClick = () => {
    if (isAutoResponseEnabled && isActive) {
      toast({
        title: "🤖 Sistema de Auto-respuesta",
        description: "El sistema está activo y monitoreando mensajes entrantes. Envía un mensaje de WhatsApp para probar.",
      });
    } else if (isAutoResponseEnabled && !isActive) {
      toast({
        title: "⚠️ Conectando al sistema",
        description: "El bot está habilitado pero reconectándose. Espera unos segundos.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "ℹ️ Auto-respuesta deshabilitada",
        description: "Activa el bot avanzado para comenzar a responder automáticamente",
      });
    }
  };

  if (!isAutoResponseEnabled) {
    return null;
  }

  if (!isActive) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="destructive" 
          className="flex items-center gap-1 cursor-pointer"
          onClick={handleIndicatorClick}
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs">Conectando...</span>
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="default" 
        className="flex items-center gap-1 animate-pulse cursor-pointer bg-green-600 hover:bg-green-700"
        onClick={handleIndicatorClick}
      >
        <Bot className="h-3 w-3" />
        <Zap className="h-3 w-3" />
        <span className="text-xs">Auto-respuesta activa</span>
      </Badge>
    </div>
  );
}
