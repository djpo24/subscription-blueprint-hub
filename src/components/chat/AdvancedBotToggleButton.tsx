
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, BotOff, MessageSquare, MessageSquareOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';

export function AdvancedBotToggleButton() {
  const {
    isManualResponseEnabled,
    toggleManualResponse
  } = useAdvancedBotToggle();
  const { toast } = useToast();

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

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bot className="h-4 w-4" />
          Control de SARA (IA) - Auto-respuesta DESACTIVADA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Aviso de auto-respuesta desactivada */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm font-medium text-red-800">🚫 Auto-respuesta DESACTIVADA</p>
          <p className="text-xs text-red-600">El bot NO responderá automáticamente a ningún mensaje</p>
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
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            🚫 Auto-respuesta COMPLETAMENTE DESACTIVADA
            {isManualResponseEnabled ? " | ✋ Solo generación manual" : " | 😴 Todo desactivado"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
