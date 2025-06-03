
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, SwitchCamera } from 'lucide-react';

interface QRScannerVideoProps {
  videoRef: RefObject<HTMLVideoElement>;
  isScanning: boolean;
  isLoading: boolean;
  availableCameras: MediaDeviceInfo[];
  currentCameraIndex: number;
  onStartScanning: () => void;
  onSwitchCamera: () => void;
}

export function QRScannerVideo({
  videoRef,
  isScanning,
  isLoading,
  availableCameras,
  currentCameraIndex,
  onStartScanning,
  onSwitchCamera
}: QRScannerVideoProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-black rounded-lg object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
              <Button
                onClick={onStartScanning}
                disabled={isLoading}
                size="lg"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Iniciar Escaneo'}
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
              </div>
            </div>
          )}

          {/* Camera switch button */}
          {availableCameras.length > 1 && (
            <div className="absolute top-4 right-4">
              <Button
                onClick={onSwitchCamera}
                disabled={isScanning}
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/80 hover:bg-white/90"
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Camera info */}
        {availableCameras.length > 0 && (
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              Cámara: {availableCameras[currentCameraIndex]?.label || `Cámara ${currentCameraIndex + 1}`}
              {availableCameras.length > 1 && ` (${currentCameraIndex + 1}/${availableCameras.length})`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
