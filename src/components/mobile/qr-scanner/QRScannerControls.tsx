
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface QRScannerControlsProps {
  isScanning: boolean;
  onCancel: () => void;
  onStopScanning: () => void;
}

export function QRScannerControls({ isScanning, onCancel, onStopScanning }: QRScannerControlsProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onCancel} variant="outline" className="flex-1">
        <X className="h-4 w-4 mr-2" />
        Cancelar
      </Button>
      
      {isScanning && (
        <Button onClick={onStopScanning} variant="outline" className="flex-1">
          Detener
        </Button>
      )}
    </div>
  );
}
