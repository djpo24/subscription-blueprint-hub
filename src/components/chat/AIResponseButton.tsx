
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Send, AlertTriangle } from 'lucide-react';
import { useAIWhatsAppResponse } from '@/hooks/useAIWhatsAppResponse';
import { useToast } from '@/hooks/use-toast';

interface AIResponseButtonProps {
  customerMessage: string;
  customerPhone: string;
  customerId?: string | null;
  onSendMessage: (message: string) => void;
}

export function AIResponseButton({
  customerMessage,
  customerPhone,
  customerId,
  onSendMessage
}: AIResponseButtonProps) {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isFromFallback, setIsFromFallback] = useState<boolean>(false);
  const { generateAIResponse, isGenerating } = useAIWhatsAppResponse();
  const { toast } = useToast();

  const handleGenerateResponse = async () => {
    try {
      const result = await generateAIResponse({
        message: customerMessage,
        customerPhone,
        customerId: customerId || undefined
      });
      
      setAiResponse(result.response);
      setIsFromFallback(result.isFromFallback || false);
      
      if (result.isFromFallback) {
        toast({
          title: "⚠️ Respuesta de emergencia",
          description: "Sistema ocupado - se generó respuesta de fallback",
        });
      } else {
        toast({
          title: "🤖 Respuesta generada",
          description: result.hasPackageInfo 
            ? "Respuesta generada con información de paquetes" 
            : "Respuesta generada (sin paquetes específicos)",
        });
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(aiResponse);
    toast({
      title: "Copiado",
      description: "Respuesta copiada al portapapeles",
    });
  };

  const handleSendResponse = () => {
    onSendMessage(aiResponse);
    setAiResponse('');
    setIsFromFallback(false);
    toast({
      title: "Enviado",
      description: isFromFallback ? "Respuesta de emergencia enviada" : "Respuesta automática enviada",
    });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerateResponse}
        disabled={isGenerating}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
      >
        <Sparkles className="h-4 w-4" />
        {isGenerating ? 'Generando respuesta...' : 'Generar respuesta con IA'}
      </Button>

      {aiResponse && (
        <div className={`border rounded-lg p-3 space-y-3 ${
          isFromFallback 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-purple-50 border-purple-200'
        }`}>
          <div className={`text-sm font-medium flex items-center gap-2 ${
            isFromFallback ? 'text-amber-800' : 'text-purple-800'
          }`}>
            {isFromFallback ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                ⚠️ Respuesta de emergencia (Sistema ocupado):
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                🤖 Respuesta sugerida por IA:
              </>
            )}
          </div>
          <div className="text-sm text-gray-700 bg-white rounded p-2 border">
            {aiResponse}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyResponse}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copiar
            </Button>
            <Button
              onClick={handleSendResponse}
              size="sm"
              className={`flex-1 text-white ${
                isFromFallback 
                  ? 'bg-amber-600 hover:bg-amber-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Send className="h-3 w-3 mr-1" />
              Enviar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
