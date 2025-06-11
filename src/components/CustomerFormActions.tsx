
import { Button } from '@/components/ui/button';

interface CustomerFormActionsProps {
  isLoading: boolean;
  hasValidationError: boolean;
  onCancel: () => void;
  submitText?: string;
  loadingText?: string;
}

export function CustomerFormActions({ 
  isLoading, 
  hasValidationError, 
  onCancel,
  submitText = "Crear Cliente",
  loadingText = "Creando..."
}: CustomerFormActionsProps) {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || hasValidationError}
      >
        {isLoading ? loadingText : submitText}
      </Button>
    </div>
  );
}
