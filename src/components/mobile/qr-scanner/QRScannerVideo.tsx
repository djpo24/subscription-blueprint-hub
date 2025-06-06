
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, SwitchCamera, Zap } from 'lucide-react';

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
              // Mejorar la calidad visual del video
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.1) brightness(1.05)'
            }}
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 rounded-lg">
              <div className="text-center mb-4">
                <Zap className="h-8 w-8 mx-auto text-yellow-400 mb-2" />
                <p className="text-white text-sm mb-1">Cámara de alta resolución lista</p>
                <p className="text-gray-300 text-xs">Para mejor lectura de códigos QR</p>
              </div>
              <Button
                onClick={onStartScanning}
                disabled={isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Iniciar Escaneo HD'}
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 rounded-lg">
              {/* Marco de escaneo mejorado */}
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Marco principal */}
                  <div className="relative w-56 h-56 border-2 border-white rounded-lg">
                    {/* Esquinas animadas */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg animate-pulse"></div>
                    
                    {/* Línea de escaneo */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-bounce"></div>
                  </div>
                  
                  {/* Texto de instrucción */}
                  <div className="mt-4 text-center">
                    <p className="text-white text-sm font-medium">Enfoca el código QR</p>
                    <p className="text-gray-300 text-xs">Mantén estable y bien iluminado</p>
                  </div>
                </div>
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
                className="rounded-full bg-white/90 hover:bg-white shadow-lg"
              >
                <SwitchCamera className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Indicador de alta resolución */}
          <div className="absolute top-4 left-4">
            <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              HD
            </div>
          </div>
        </div>

        {/* Camera info mejorada */}
        {availableCameras.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-700 font-medium">
              📹 {availableCameras[currentCameraIndex]?.label || `Cámara ${currentCameraIndex + 1}`}
            </p>
            {availableCameras.length > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                ({currentCameraIndex + 1} de {availableCameras.length} cámaras disponibles)
              </p>
            )}
            <p className="text-xs text-blue-600 mt-1">
              ⚡ Configurada en alta resolución para mejor lectura
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
