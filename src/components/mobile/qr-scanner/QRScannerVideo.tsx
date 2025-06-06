
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, SwitchCamera, Zap, Printer } from 'lucide-react';

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
              // Optimizar para códigos QR de impresoras térmicas
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.3) brightness(1.1) saturate(1.2)', // Aumentar contraste para impresoras térmicas
              transform: 'scale(1.05)' // Ligero zoom para mejor detección
            }}
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Printer className="h-6 w-6 text-blue-400" />
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-white text-sm mb-1 font-medium">Escáner optimizado para Beeprt CC450</p>
                <p className="text-gray-300 text-xs">Ultra alta resolución + detección mejorada</p>
                <p className="text-blue-300 text-xs mt-1">Especial para códigos QR de impresoras térmicas</p>
              </div>
              <Button
                onClick={onStartScanning}
                disabled={isLoading}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Iniciar Escaneo Térmico'}
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 rounded-lg">
              {/* Marco de escaneo mejorado para impresoras térmicas */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Marco principal más grande para mejor detección */}
                  <div className="relative w-64 h-64 border-2 border-white rounded-lg">
                    {/* Esquinas animadas más prominentes */}
                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-blue-400 rounded-tl-lg animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-blue-400 rounded-tr-lg animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-blue-400 rounded-bl-lg animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-blue-400 rounded-br-lg animate-pulse"></div>
                    
                    {/* Múltiples líneas de escaneo para mejor detección */}
                    <div className="absolute top-1/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-bounce"></div>
                    <div className="absolute top-3/4 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse"></div>
                    
                    {/* Centro de enfoque */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 border-2 border-red-400 rounded-full animate-ping"></div>
                  </div>
                  
                  {/* Texto de instrucción específico para impresoras térmicas */}
                  <div className="mt-4 text-center">
                    <p className="text-white text-sm font-medium">Enfoca el código QR térmico</p>
                    <p className="text-gray-300 text-xs">Mantén estable • Buena iluminación • Sin reflejos</p>
                    <p className="text-blue-300 text-xs mt-1">⚡ Detección continua activa</p>
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

          {/* Indicador de optimización para impresoras térmicas */}
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <Printer className="h-3 w-3" />
              <span>TÉRMICO</span>
              <Zap className="h-3 w-3" />
            </div>
          </div>

          {/* Indicador de estado de escaneo */}
          {isScanning && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Escaneando códigos térmicos...</span>
                </div>
                <div className="text-xs text-gray-300">Optimizado para Beeprt CC450 CPCL</div>
              </div>
            </div>
          )}
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
              🖨️ Configuración especial para impresoras térmicas Beeprt CC450
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
