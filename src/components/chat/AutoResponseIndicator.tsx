
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAutoResponseDetection } from '@/hooks/useAutoResponseDetection';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function AutoResponseIndicator() {
  const { isActive } = useAutoResponseDetection();
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { toast } = useToast();
  const [connectionStable, setConnectionStable] = useState(false);

  // Considerar la conexión estable después de 3 segundos de estar conectado
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setConnectionStable(true);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      setConnectionStable(false);
    }
  }, [isActive]);

  const handleIndicatorClick = () => {
    if (isAutoResponseEnabled && isActive && connectionStable) {
      toast({
        title: "🤖 Sistema de Auto-respuesta",
        description: "El sistema está activo y monitoreando mensajes entrantes. Envía un mensaje de WhatsApp para probar.",
      });
    } else if (isAutoResponseEnabled && (!isActive || !connectionStable)) {
      toast({
        title: "⚠️ Sistema iniciándose",
        description: "El bot está habilitado y conectándose. Espera unos segundos.",
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

  // Si está habilitado pero no conectado o la conexión no es estable
  if (!isActive || !connectionStable) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1 cursor-pointer animate-pulse"
          onClick={handleIndicatorClick}
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="text-xs">Iniciando...</span>
        </Badge>
      </div>
    );
  }

  // Conexión estable y activa
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="default" 
        className="flex items-center gap-1 cursor-pointer bg-green-600 hover:bg-green-700"
        onClick={handleIndicatorClick}
      >
        <Bot className="h-3 w-3" />
        <Zap className="h-3 w-3" />
        <span className="text-xs">Auto-respuesta activa</span>
      </Badge>
    </div>
  );
}
