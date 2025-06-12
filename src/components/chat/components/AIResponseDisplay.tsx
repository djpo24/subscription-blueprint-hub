
import { Button } from '@/components/ui/button';
import { Copy, Send, AlertTriangle, User, Sparkles } from 'lucide-react';
import { CustomerInfoDisplay } from './CustomerInfoDisplay';
import type { AIResponseDisplayProps } from '../types/AIResponseTypes';

export function AIResponseDisplay({
  response,
  isFromFallback,
  customerInfo,
  onCopy,
  onSend,
  feedbackComponent
}: AIResponseDisplayProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getContainerClasses = () => {
    if (isFromFallback) return 'bg-amber-50 border-amber-200';
    if (customerInfo?.found) return 'bg-green-50 border-green-200';
    return 'bg-purple-50 border-purple-200';
  };

  const getHeaderClasses = () => {
    if (isFromFallback) return 'text-amber-800';
    if (customerInfo?.found) return 'text-green-800';
    return 'text-purple-800';
  };

  const getButtonClasses = () => {
    if (isFromFallback) return 'bg-amber-600 hover:bg-amber-700';
    if (customerInfo?.found) return 'bg-green-600 hover:bg-green-700';
    return 'bg-purple-600 hover:bg-purple-700';
  };

  return (
    <div className={`border rounded-lg p-3 space-y-3 ${getContainerClasses()}`}>
      {/* Header with customer info */}
      <div className={`text-sm font-medium flex items-center gap-2 ${getHeaderClasses()}`}>
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
        <CustomerInfoDisplay customerInfo={customerInfo} formatCurrency={formatCurrency} />
      )}
      
      {/* AI Response */}
      <div className="text-sm text-gray-700 bg-white rounded p-3 border">
        {response}
      </div>
      
      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            onClick={onCopy}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copiar
          </Button>
          <Button
            onClick={onSend}
            size="sm"
            className={`flex-1 text-white ${getButtonClasses()}`}
          >
            <Send className="h-3 w-3 mr-1" />
            Enviar
          </Button>
        </div>
        
        {/* Feedback section */}
        {feedbackComponent}
      </div>
    </div>
  );
}
