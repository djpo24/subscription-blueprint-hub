
import { Card, CardContent } from '@/components/ui/card';

interface QRScannerInstructionsProps {
  availableCameras: MediaDeviceInfo[];
}

export function QRScannerInstructions({ availableCameras }: QRScannerInstructionsProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-medium mb-2">Instrucciones:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Apunta la cámara hacia el código QR</li>
          <li>• Mantén el dispositivo estable</li>
          <li>• Asegúrate de que haya buena iluminación</li>
          <li>• El código QR debe estar completamente visible</li>
          {availableCameras.length > 1 && (
            <li>• Usa el botón de cambio para alternar entre cámaras</li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
