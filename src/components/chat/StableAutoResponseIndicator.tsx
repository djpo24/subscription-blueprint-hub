
import { Badge } from '@/components/ui/badge';
import { Bot, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { useStableAutoResponseSystem } from '@/hooks/useStableAutoResponseSystem';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';

export function StableAutoResponseIndicator() {
  const { isActive, processedCount, isEnabled, isConnected } = useStableAutoResponseSystem();
  const { toggleAutoResponse } = useAdvancedBotToggle();
  const { toast } = useToast();
  const [isStable, setIsStable] = useState(false);
  const [lastProcessedCount, setLastProcessedCount] = useState(0);

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

  // Detectar nuevos mensajes procesados
  useEffect(() => {
    if (processedCount > lastProcessedCount) {
      console.log(`📈 Nuevo mensaje procesado: ${processedCount} total`);
      setLastProcessedCount(processedCount);
    }
  }, [processedCount, lastProcessedCount]);

  const handleClick = () => {
    if (!isEnabled) {
      // Activar auto-respuesta
      toggleAutoResponse(true);
      toast({
        title: "🤖 Auto-respuesta activada",
        description: "SARA comenzará a responder automáticamente a los mensajes entrantes",
      });
    } else if (isEnabled && isActive && isStable) {
      // Sistema funcionando - mostrar estado
      toast({
        title: "🤖 Sistema Activo",
        description: `Auto-respuesta funcionando. ${processedCount} mensajes procesados.`,
      });
    } else if (isEnabled && !isConnected) {
      // Problema de conexión
      toast({
        title: "⚡ Reconectando...",
        description: "Reestableciendo conexión para auto-respuestas",
        variant: "destructive"
      });
    } else {
      // Desactivar auto-respuesta
      toggleAutoResponse(false);
      toast({
        title: "🤖 Auto-respuesta desactivada",
        description: "SARA ya no responderá automáticamente",
      });
    }
  };

  // Sistema deshabilitado
  if (!isEnabled) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 cursor-pointer border-gray-300 text-gray-600 bg-gray-50 hover:bg-gray-100"
          onClick={handleClick}
        >
          <Bot className="h-3 w-3" />
          <span className="text-xs">Bot Inactivo</span>
        </Badge>
      </div>
    );
  }

  // Sistema habilitado pero sin conexión
  if (isEnabled && !isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 cursor-pointer border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
          onClick={handleClick}
        >
          <AlertTriangle className="h-3 w-3" />
          <span className="text-xs">Sin Conexión</span>
        </Badge>
      </div>
    );
  }

  // Sistema iniciándose
  if (isEnabled && isConnected && !isStable) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 cursor-pointer border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
          onClick={handleClick}
        >
          <RefreshCw className="h-3 w-3 animate-spin" />
          <span className="text-xs">Iniciando...</span>
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
