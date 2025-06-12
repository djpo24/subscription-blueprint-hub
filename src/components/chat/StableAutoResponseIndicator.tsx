
import { Badge } from '@/components/ui/badge';
import { Bot, RefreshCw, CheckCircle } from 'lucide-react';
import { useStableAutoResponseSystem } from '@/hooks/useStableAutoResponseSystem';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function StableAutoResponseIndicator() {
  const { isActive, processedCount } = useStableAutoResponseSystem();
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { toast } = useToast();
  const [isStable, setIsStable] = useState(false);

  // Considerar estable después de 2 segundos de conexión activa
  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setIsStable(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setIsStable(false);
    }
  }, [isActive]);

  const handleClick = () => {
    if (isAutoResponseEnabled && isActive && isStable) {
      toast({
        title: "🤖 Sistema Estable",
        description: `Auto-respuesta activa. ${processedCount} mensajes procesados.`,
      });
    } else if (isAutoResponseEnabled && !isStable) {
      toast({
        title: "⚡ Iniciando Sistema",
        description: "Estableciendo conexión estable...",
        variant: "destructive"
      });
    } else {
      toast({
        title: "ℹ️ Sistema Deshabilitado",
        description: "Activa el bot avanzado para habilitar auto-respuestas",
      });
    }
  };

  if (!isAutoResponseEnabled) {
    return null;
  }

  // Sistema iniciándose
  if (!isActive || !isStable) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 cursor-pointer border-yellow-300 text-yellow-700 bg-yellow-50"
          onClick={handleClick}
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="text-xs">Conectando...</span>
        </Badge>
      </div>
    );
  }

  // Sistema estable y funcionando
  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant="default" 
        className="flex items-center gap-1 cursor-pointer bg-green-600 hover:bg-green-700 text-white"
        onClick={handleClick}
      >
        <CheckCircle className="h-3 w-3" />
        <Bot className="h-3 w-3" />
        <span className="text-xs">SARA Activa</span>
        {processedCount > 0 && (
          <span className="text-xs bg-green-800 px-1 rounded">
            {processedCount}
          </span>
        )}
      </Badge>
    </div>
  );
}
