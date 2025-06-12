
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAIWhatsAppResponse } from '@/hooks/useAIWhatsAppResponse';
import { useAIFeedback } from '@/hooks/useAIFeedback';
import { useToast } from '@/hooks/use-toast';
import { AIResponseDisplay } from './components/AIResponseDisplay';
import { ResponseFeedback } from './components/ResponseFeedback';
import type { AIResponseButtonProps, CustomerInfo, AIResponseData } from './types/AIResponseTypes';

export function AIResponseButton({
  customerMessage,
  customerPhone,
  customerId,
  onResponseGenerated
}: AIResponseButtonProps) {
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isFromFallback, setIsFromFallback] = useState<boolean>(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [currentInteractionId, setCurrentInteractionId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<'positive' | 'negative' | null>(null);
  const [showResponse, setShowResponse] = useState<boolean>(false);
  
  const { generateAIResponse, isGenerating } = useAIWhatsAppResponse();
  const { submitFeedback, isSubmittingFeedback } = useAIFeedback();
  const { toast } = useToast();

  const handleGenerateResponse = async () => {
    try {
      const result: AIResponseData = await generateAIResponse({
        message: customerMessage,
        customerPhone,
        customerId: customerId || undefined
      });
      
      setAiResponse(result.response);
      setIsFromFallback(result.isFromFallback || false);
      setCustomerInfo(result.customerInfo || null);
      setCurrentInteractionId(result.interactionId || null);
      setFeedbackGiven(null);
      setShowResponse(true);
      
      // Notify parent component
      onResponseGenerated(result);
      
    } catch (error) {
      console.error('Error generating enhanced AI response:', error);
    }
  };

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(aiResponse);
    toast({
      title: "Copiado",
      description: "Respuesta de SARA copiada al portapapeles",
    });
  };

  const handleSendResponse = () => {
    // Pass the response back to parent for sending
    onResponseGenerated({ response: aiResponse, action: 'send' });
    setShowResponse(false);
    setAiResponse('');
    setIsFromFallback(false);
    setCustomerInfo(null);
    setFeedbackGiven(null);
    
    const description = customerInfo?.found 
      ? `Respuesta personalizada de SARA enviada a ${customerInfo.name}`
      : isFromFallback 
        ? "Respuesta de emergencia humanizada enviada" 
        : "Respuesta inteligente de SARA enviada";
        
    toast({
      title: "Enviado por SARA",
      description,
    });
  };

  const handleDismissResponse = () => {
    setShowResponse(false);
    setAiResponse('');
    setIsFromFallback(false);
    setCustomerInfo(null);
    setFeedbackGiven(null);
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
      
      toast({
        title: feedbackType === 'positive' ? "¡Feedback positivo enviado!" : "Feedback registrado",
        description: "Esto ayuda a SARA a mejorar sus respuestas",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const feedbackComponent = (
    <ResponseFeedback
      interactionId={currentInteractionId}
      feedbackGiven={feedbackGiven}
      isSubmittingFeedback={isSubmittingFeedback}
      onFeedback={handleFeedback}
    />
  );

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
        {isGenerating ? 'SARA está analizando y generando respuesta...' : 'Generar respuesta con SARA (IA humanizada)'}
      </Button>

      {showResponse && aiResponse && (
        <AIResponseDisplay
          response={aiResponse}
          isFromFallback={isFromFallback}
          customerInfo={customerInfo}
          onCopy={handleCopyResponse}
          onSend={handleSendResponse}
          onDismiss={handleDismissResponse}
          feedbackComponent={feedbackComponent}
        />
      )}
    </div>
  );
}
