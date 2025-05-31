
import { Button } from '@/components/ui/button';

interface CustomerFormActionsProps {
  isLoading: boolean;
  hasValidationError: boolean;
  onCancel: () => void;
}

export function CustomerFormActions({
  isLoading,
  hasValidationError,
  onCancel
}: CustomerFormActionsProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button 
        type="submit" 
        disabled={isLoading || hasValidationError} 
        className="px-6"
      >
        {isLoading ? 'Creando...' : 'Crear Cliente'}
      </Button>
      <Button 
        type="button" 
        variant="outline" 
        onClick={(e) => {
          console.log('🟢 Cancel button clicked');
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }} 
        className="px-6"
      >
        Cancelar
      </Button>
    </div>
  );
}
