
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SwitchCamera, BarChart3 } from 'lucide-react';

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
            className="w-full h-80 bg-black rounded-lg object-cover"
            autoPlay
            playsInline
            muted
            style={{
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.5) brightness(1.3)',
            }}
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <Button
                onClick={onStartScanning}
                disabled={isLoading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Iniciar Escaneo'}
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 rounded-lg">
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Marco simple para escaneo */}
                  <div className="relative w-72 h-40 border-2 border-white rounded-lg">
                    {/* Solo las esquinas */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Botón para cambiar cámara */}
          {availableCameras.length > 1 && (
            <div className="absolute top-4 right-4">
              <Button
                onClick={onSwitchCamera}
                disabled={isScanning}
                variant="secondary"
                size="icon"
                className="rounded-full bg-white/90 hover:bg-white shadow-lg"
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Información mínima de la cámara */}
        {availableCameras.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              Cámara {currentCameraIndex + 1} de {availableCameras.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
