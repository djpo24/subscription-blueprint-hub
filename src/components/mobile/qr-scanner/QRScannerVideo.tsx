
import { RefObject } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, SwitchCamera, Zap, Printer, BarChart3 } from 'lucide-react';

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
              // Optimizar para códigos de barras de impresoras térmicas (PRIORIDAD)
              imageRendering: 'crisp-edges',
              filter: 'contrast(1.5) brightness(1.3) saturate(1.2)', // Optimizado para códigos de barras
              transform: 'scale(1.1)' // Ligero zoom adicional para mejor detección
            }}
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-lg">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BarChart3 className="h-8 w-8 text-green-400" />
                  <Printer className="h-6 w-6 text-blue-400" />
                  <Zap className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-white text-sm mb-1 font-medium">Escáner optimizado para Códigos de Barras Beeprt CC450</p>
                <p className="text-gray-300 text-xs">Detección PRIORITARIA de Códigos de Barras</p>
                <p className="text-green-300 text-xs mt-1">Códigos de Barras + QR como respaldo • Ultra alta resolución</p>
              </div>
              <Button
                onClick={onStartScanning}
                disabled={isLoading}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {isLoading ? 'Procesando...' : 'Iniciar Escaneo de Código de Barras'}
              </Button>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 rounded-lg">
              {/* Marco de escaneo optimizado para códigos de barras */}
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  {/* Marco principal para códigos de barras - más ancho y menos alto */}
                  <div className="relative w-80 h-48 border-2 border-white rounded-lg">
                    {/* Esquinas animadas más prominentes para códigos de barras */}
                    <div className="absolute top-0 left-0 w-12 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg animate-pulse"></div>
                    <div className="absolute top-0 right-0 w-12 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-12 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg animate-pulse"></div>
                    
                    {/* Líneas de escaneo horizontales optimizadas para códigos de barras */}
                    <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
                    <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-bounce"></div>
                    <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-pulse"></div>
                    
                    {/* Centro de enfoque */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-2 border-2 border-green-400 rounded animate-ping"></div>
                  </div>
                  
                  {/* Texto de instrucción para códigos de barras */}
                  <div className="mt-4 text-center">
                    <p className="text-white text-sm font-medium">Enfoca el Código de Barras térmico</p>
                    <p className="text-gray-300 text-xs">Detección prioritaria de Barcode • Buena iluminación</p>
                    <p className="text-green-300 text-xs mt-1">🎯 BARCODE principal + QR respaldo</p>
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

          {/* Indicador de optimización para códigos de barras */}
          <div className="absolute top-4 left-4">
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-green-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              <span>BARCODE</span>
              <Zap className="h-3 w-3" />
            </div>
          </div>

          {/* Indicador de estado de escaneo prioritario para códigos de barras */}
          {isScanning && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/80 text-white px-3 py-2 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-medium">Escaneando Códigos de Barras...</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xs text-gray-300">Prioridad BARCODE para Beeprt CC450 CPCL</div>
              </div>
            </div>
          )}
        </div>

        {/* Camera info mejorada con detección prioritaria de códigos de barras */}
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
            <p className="text-xs text-green-600 mt-1">
              🎯 CÓDIGOS DE BARRAS prioritarios para impresoras térmicas Beeprt CC450
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
