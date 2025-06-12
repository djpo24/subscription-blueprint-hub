
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Send, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAIWhatsAppResponse } from '@/hooks/useAIWhatsAppResponse';
import { useAIFeedback } from '@/hooks/useAIFeedback';
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
  const [currentInteractionId, setCurrentInteractionId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  
  const { generateAIResponse, isGenerating } = useAIWhatsAppResponse();
  const { submitFeedback, isSubmittingFeedback } = useAIFeedback();
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
      setFeedbackGiven(null); // Reset feedback state
      
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

      // Get the latest interaction ID for feedback
      // Note: En una implementación real, deberías obtener el ID de la interacción
      // desde la respuesta de la función edge o hacer una consulta adicional
      
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
    setFeedbackGiven(null);
    toast({
      title: "Enviado",
      description: isFromFallback ? "Respuesta de emergencia enviada" : "Respuesta automática enviada",
    });
  };

  const handleFeedback = async (feedbackType: 'positive' | 'negative') => {
    if (!currentInteractionId) {
      toast({
        title: "Error",
        description: "No se puede enviar feedback en este momento",
        variant: "destructive"
      });
      return;
    }

    try {
      await submitFeedback({
        interactionId: currentInteractionId,
        feedbackType,
        feedbackSource: 'agent_rating'
      });
      
      setFeedbackGiven(feedbackType);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
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
          
          {/* Feedback buttons */}
          <div className="flex items-center justify-between">
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
            
            {/* Feedback section */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span>¿Útil?</span>
              <Button
                onClick={() => handleFeedback('positive')}
                disabled={isSubmittingFeedback || feedbackGiven === 'positive'}
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${
                  feedbackGiven === 'positive' ? 'text-green-600' : 'text-gray-400 hover:text-green-600'
                }`}
              >
                <ThumbsUp className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => handleFeedback('negative')}
                disabled={isSubmittingFeedback || feedbackGiven === 'negative'}
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 ${
                  feedbackGiven === 'negative' ? 'text-red-600' : 'text-gray-400 hover:text-red-600'
                }`}
              >
                <ThumbsDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
