
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X } from 'lucide-react';

interface CameraPermissionCheckProps {
  hasPermission: boolean | null;
  onCancel: () => void;
}

export function CameraPermissionCheck({ hasPermission, onCancel }: CameraPermissionCheckProps) {
  if (hasPermission === null) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p>Verificando permisos de cámara...</p>
        </CardContent>
      </Card>
    );
  }

  if (hasPermission === false) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-4">
          <Camera className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-900">Acceso a cámara requerido</h3>
            <p className="text-sm text-gray-600 mt-1">
              Para escanear códigos QR, necesitas permitir el acceso a la cámara
            </p>
          </div>
          <Button onClick={onCancel} variant="outline">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}
