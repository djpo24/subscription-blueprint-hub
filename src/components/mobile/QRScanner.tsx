
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X, RotateCcw } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QRScannerProps {
  onQRCodeScanned: (data: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function QRScanner({ onQRCodeScanned, onCancel, isLoading = false }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeReader, setCodeReader] = useState<BrowserQRCodeReader | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      stopScanning();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      // Check camera permission
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permission.state === 'granted');

      const reader = new BrowserQRCodeReader();
      setCodeReader(reader);
      startScanning(reader);
    } catch (err) {
      console.error('Error initializing scanner:', err);
      setError('No se pudo acceder a la cámara. Asegúrate de permitir el acceso.');
    }
  };

  const startScanning = async (reader: BrowserQRCodeReader) => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);

      // Get video devices
      const videoInputDevices = await reader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // Try to use back camera first (for mobile devices)
      const backCamera = videoInputDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('environment')
      );
      
      const deviceId = backCamera?.deviceId || videoInputDevices[0].deviceId;

      // Start scanning
      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current,
        (result, error) => {
          if (result) {
            const text = result.getText();
            console.log('QR Code scanned:', text);
            onQRCodeScanned(text);
            stopScanning();
          }
          if (error && !(error instanceof Error && error.name === 'NotFoundException')) {
            console.error('Scanning error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error starting scan:', err);
      setError('Error al iniciar el escáner. Verifica los permisos de cámara.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    setIsScanning(false);
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      if (codeReader) {
        startScanning(codeReader);
      }
    } catch (err) {
      console.error('Camera permission denied:', err);
      setError('Permiso de cámara denegado. Habilita el acceso en la configuración.');
    }
  };

  const retryScanning = () => {
    setError(null);
    if (codeReader) {
      startScanning(codeReader);
    } else {
      initializeScanner();
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            {/* Video element */}
            <video
              ref={videoRef}
              className="w-full aspect-square object-cover rounded-lg bg-black"
              playsInline
              muted
            />
            
            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                <div className="text-white text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Procesando código QR...</p>
                </div>
              </div>
            )}

            {/* Scanner overlay */}
            {isScanning && !isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white w-48 h-48 rounded-lg"></div>
              </div>
            )}

            {/* Instructions */}
            {isScanning && !isLoading && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white bg-black bg-opacity-50 px-3 py-1 rounded text-sm">
                  Apunta la cámara al código QR
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm mb-3">{error}</p>
            {hasPermission === false && (
              <Button
                onClick={requestCameraPermission}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Permitir Acceso a Cámara
              </Button>
            )}
            {hasPermission === true && (
              <Button
                onClick={retryScanning}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        {isScanning && (
          <Button
            onClick={retryScanning}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reiniciar
          </Button>
        )}
      </div>
    </div>
  );
}
