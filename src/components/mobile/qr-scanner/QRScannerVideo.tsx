
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

// Detectar si es iPad para optimizar la interfaz
function isIPad(): boolean {
  return /iPad/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isIPhone(): boolean {
  return /iPhone/.test(navigator.userAgent);
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
  const deviceIsIPad = isIPad();
  const deviceIsIPhone = isIPhone();
  
  // Configuraciones específicas por dispositivo
  const getVideoHeight = () => {
    if (deviceIsIPad) return 'h-96'; // Más altura para iPad
    if (deviceIsIPhone) return 'h-80';
    return 'h-80';
  };

  const getScanFrame = () => {
    if (deviceIsIPad) {
      return {
        width: 'w-80', // Más ancho para iPad
        height: 'h-48', // Más alto para iPad
        cornerSize: 'w-10 h-10', // Esquinas más grandes
        borderWidth: 'border-t-4 border-l-4 border-r-4 border-b-4'
      };
    }
    if (deviceIsIPhone) {
      return {
        width: 'w-72',
        height: 'h-40',
        cornerSize: 'w-8 h-8',
        borderWidth: 'border-t-4 border-l-4 border-r-4 border-b-4'
      };
    }
    return {
      width: 'w-72',
      height: 'h-40',
      cornerSize: 'w-8 h-8',
      borderWidth: 'border-t-4 border-l-4 border-r-4 border-b-4'
    };
  };

  const frameConfig = getScanFrame();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="relative">
          <video
            ref={videoRef}
            className={`w-full ${getVideoHeight()} bg-black rounded-lg object-cover`}
            autoPlay
            playsInline
            muted
            style={{
              imageRendering: 'crisp-edges',
              // Filtros específicos para iPad para mejorar contraste
              filter: deviceIsIPad 
                ? 'contrast(1.8) brightness(1.4) saturate(0.8) sharpness(1.5)' 
                : 'contrast(1.5) brightness(1.3)',
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
                  {/* Marco específico por dispositivo */}
                  <div className={`relative ${frameConfig.width} ${frameConfig.height} border-2 border-white rounded-lg`}>
                    {/* Esquinas mejoradas con colores más visibles */}
                    <div className={`absolute top-0 left-0 ${frameConfig.cornerSize} ${frameConfig.borderWidth} border-green-400 rounded-tl-lg`}></div>
                    <div className={`absolute top-0 right-0 ${frameConfig.cornerSize} ${frameConfig.borderWidth} border-green-400 rounded-tr-lg`}></div>
                    <div className={`absolute bottom-0 left-0 ${frameConfig.cornerSize} ${frameConfig.borderWidth} border-green-400 rounded-bl-lg`}></div>
                    <div className={`absolute bottom-0 right-0 ${frameConfig.cornerSize} ${frameConfig.borderWidth} border-green-400 rounded-br-lg`}></div>
                    
                    {/* Línea central para guía adicional en iPad */}
                    {deviceIsIPad && (
                      <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-green-400 opacity-60 transform -translate-y-1/2"></div>
                    )}
                  </div>
                </div>
                
                {/* Instrucciones específicas para iPad */}
                {deviceIsIPad && isScanning && (
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black bg-opacity-70 text-white text-xs p-2 rounded text-center">
                      📱 iPad: Mantén estable y enfoca el código de barras dentro del marco
                    </div>
                  </div>
                )}
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

        {/* Información de la cámara con detalles específicos del dispositivo */}
        {availableCameras.length > 0 && (
          <div className="mt-3 text-center">
            <p className="text-sm text-gray-600">
              {deviceIsIPad ? '📱 iPad' : deviceIsIPhone ? '📱 iPhone' : '📱 Móvil'} - 
              Cámara {currentCameraIndex + 1} de {availableCameras.length}
            </p>
            {deviceIsIPad && (
              <p className="text-xs text-gray-500 mt-1">
                Optimizado para códigos de barras térmicos en iPad
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
