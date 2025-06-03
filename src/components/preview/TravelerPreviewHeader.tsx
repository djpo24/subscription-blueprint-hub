
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TravelerPreviewHeaderProps {
  onBack: () => void;
}

export function TravelerPreviewHeader({ onBack }: TravelerPreviewHeaderProps) {
  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Eye className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-800">
          <strong>Vista Preview:</strong> Panel como Viajero - Puede crear paquetes y viajes, acceso a sus viajes asignados y entrega móvil
        </span>
        <Button variant="outline" size="sm" onClick={onBack} className="ml-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </AlertDescription>
    </Alert>
  );
}
