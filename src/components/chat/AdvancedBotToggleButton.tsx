
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, BotOff, Zap, ZapOff, MessageSquare, MessageSquareOff, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';

export function AdvancedBotToggleButton() {
  const {
    isAutoResponseEnabled,
    isManualResponseEnabled,
    toggleAutoResponse,
    toggleManualResponse
  } = useAdvancedBotToggle();
  const { toast } = useToast();

  const handleAutoResponseToggle = () => {
    const newState = !isAutoResponseEnabled;
    toggleAutoResponse(newState);
    
    toast({
      title: newState ? "🤖 Respuestas automáticas activadas" : "🔕 Respuestas automáticas desactivadas",
      description: newState 
        ? "SARA responderá automáticamente a todos los mensajes entrantes" 
        : "SARA no responderá automáticamente a los mensajes"
    });

    if (newState) {
      // Show additional info when enabling
      setTimeout(() => {
        toast({
          title: "💡 Cómo probar",
          description: "Envía un mensaje de WhatsApp al número configurado para ver la respuesta automática",
        });
      }, 2000);
    }
  };

  const handleManualResponseToggle = () => {
    const newState = !isManualResponseEnabled;
    toggleManualResponse(newState);
    
    toast({
      title: newState ? "✨ Generación de respuestas activada" : "🚫 Generación de respuestas desactivada",
      description: newState 
        ? "Puedes generar respuestas con SARA usando el botón en cada mensaje" 
        : "El botón de generar respuestas está deshabilitado"
    });
  };

  const handleTestInstructions = () => {
    toast({
      title: "🧪 Instrucciones de prueba",
      description: "1. Activa 'Respuestas Automáticas' 2. Envía un mensaje al WhatsApp configurado 3. SARA responderá automáticamente",
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Bot className="h-4 w-4" />
            Control de SARA (IA)
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestInstructions}
            className="flex items-center gap-1"
          >
            <TestTube className="h-3 w-3" />
            Cómo probar
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Control de respuestas automáticas */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Respuestas Automáticas</span>
            <span className="text-xs text-gray-500">Responde automáticamente a mensajes</span>
          </div>
          <Button
            variant={isAutoResponseEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleAutoResponseToggle}
            className="flex items-center gap-2"
          >
            {isAutoResponseEnabled ? <Zap className="h-3 w-3" /> : <ZapOff className="h-3 w-3" />}
            {isAutoResponseEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Control de generación manual */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-medium">Generación Manual</span>
            <span className="text-xs text-gray-500">Botón para generar respuestas</span>
          </div>
          <Button
            variant={isManualResponseEnabled ? "default" : "outline"}
            size="sm"
            onClick={handleManualResponseToggle}
            className="flex items-center gap-2"
          >
            {isManualResponseEnabled ? <MessageSquare className="h-3 w-3" /> : <MessageSquareOff className="h-3 w-3" />}
            {isManualResponseEnabled ? "ON" : "OFF"}
          </Button>
        </div>

        {/* Estado general */}
        <div className="flex items-center justify-center pt-2 border-t">
          <Badge variant={isAutoResponseEnabled || isManualResponseEnabled ? "default" : "secondary"}>
            {isAutoResponseEnabled && isManualResponseEnabled 
              ? "🤖 SARA completamente activa"
              : isAutoResponseEnabled 
                ? "⚡ Solo respuestas automáticas"
                : isManualResponseEnabled
                  ? "✋ Solo generación manual"
                  : "😴 SARA desactivada"
            }
          </Badge>
        </div>

        {/* Instrucciones cuando está activo */}
        {isAutoResponseEnabled && (
          <div className="text-xs text-center p-2 bg-blue-50 rounded">
            💡 Envía un mensaje de WhatsApp para probar la respuesta automática
          </div>
        )}
      </CardContent>
    </Card>
  );
}
