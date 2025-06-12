
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Copy, Send, AlertTriangle, ThumbsUp, ThumbsDown, User, Package } from 'lucide-react';
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
  const [customerInfo, setCustomerInfo] = useState<any>(null);
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
      setCustomerInfo(result.customerInfo || null);
      setFeedbackGiven(null); // Reset feedback state
      
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
    setCustomerInfo(null);
    setFeedbackGiven(null);
    
    const description = customerInfo?.found 
      ? `Respuesta personalizada enviada a ${customerInfo.name}`
      : isFromFallback 
        ? "Respuesta de emergencia enviada" 
        : "Respuesta automática enviada";
        
    toast({
      title: "Enviado",
      description,
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
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
        {isGenerating ? 'Analizando cliente y generando respuesta...' : 'Generar respuesta inteligente'}
      </Button>

      {aiResponse && (
        <div className={`border rounded-lg p-3 space-y-3 ${
          isFromFallback 
            ? 'bg-amber-50 border-amber-200' 
            : customerInfo?.found
              ? 'bg-green-50 border-green-200'
              : 'bg-purple-50 border-purple-200'
        }`}>
          {/* Header with customer info */}
          <div className={`text-sm font-medium flex items-center gap-2 ${
            isFromFallback 
              ? 'text-amber-800' 
              : customerInfo?.found
                ? 'text-green-800'
                : 'text-purple-800'
          }`}>
            {isFromFallback ? (
              <>
                <AlertTriangle className="h-4 w-4" />
                ⚠️ Respuesta de emergencia (Sistema ocupado)
              </>
            ) : customerInfo?.found ? (
              <>
                <User className="h-4 w-4" />
                🎯 Respuesta personalizada para {customerInfo.name}
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                🤖 Respuesta automática
              </>
            )}
          </div>

          {/* Customer summary if found */}
          {customerInfo?.found && (
            <div className="text-xs bg-white rounded p-2 border space-y-1">
              <div className="flex items-center gap-2 font-medium">
                <Package className="h-3 w-3" />
                Resumen del cliente:
              </div>
              {customerInfo.pendingAmount > 0 && (
                <div className="text-red-600">
                  💰 Saldo pendiente: {formatCurrency(customerInfo.pendingAmount)} 
                  ({customerInfo.pendingPackages} encomienda{customerInfo.pendingPackages !== 1 ? 's' : ''})
                </div>
              )}
              {customerInfo.transitPackages > 0 && (
                <div className="text-blue-600">
                  🚚 En tránsito: {customerInfo.transitPackages} encomienda{customerInfo.transitPackages !== 1 ? 's' : ''}
                </div>
              )}
              {customerInfo.pendingAmount === 0 && customerInfo.transitPackages === 0 && (
                <div className="text-green-600">
                  ✅ Todo al día - sin pendientes
                </div>
              )}
            </div>
          )}
          
          {/* AI Response */}
          <div className="text-sm text-gray-700 bg-white rounded p-3 border">
            {aiResponse}
          </div>
          
          {/* Action buttons */}
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
                    : customerInfo?.found
                      ? 'bg-green-600 hover:bg-green-700'
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
