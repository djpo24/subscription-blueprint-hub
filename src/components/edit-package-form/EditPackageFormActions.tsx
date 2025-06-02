
import { Button } from '@/components/ui/button';
import { EditPackageFormDelete } from './EditPackageFormDelete';
import { EditPackageFormWarehouse } from './EditPackageFormWarehouse';

interface Package {
  id: string;
  tracking_number: string;
}

interface EditPackageFormActionsProps {
  package: Package;
  isLoading: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPackageFormActions({
  package: pkg,
  isLoading,
  onSuccess,
  onCancel
}: EditPackageFormActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? 'Actualizando...' : 'Actualizar'}
      </Button>
      
      <div className="grid grid-cols-2 gap-3">
        <EditPackageFormWarehouse package={pkg} onSuccess={onSuccess} />
        <EditPackageFormDelete package={pkg} onSuccess={onSuccess} />
      </div>
      
      <Button type="button" variant="outline" onClick={onCancel} className="w-full">
        Cancelar
      </Button>
    </div>
  );
}
