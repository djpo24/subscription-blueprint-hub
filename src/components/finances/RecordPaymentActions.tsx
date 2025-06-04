
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface RecordPaymentActionsProps {
  isLoading: boolean;
  hasPayments: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export function RecordPaymentActions({
  isLoading,
  hasPayments,
  onCancel,
  onSubmit
}: RecordPaymentActionsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="w-full"
      >
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      <Button
        type="button"
        disabled={isLoading || !hasPayments}
        className="w-full"
        onClick={onSubmit}
      >
        <Check className="h-4 w-4 mr-2" />
        {isLoading ? 'Registrando...' : 'Registrar Pago'}
      </Button>
    </div>
  );
}
