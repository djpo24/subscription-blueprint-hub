
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, X } from 'lucide-react';
import { BrowserQRCodeReader } from '@zxing/browser';

interface QRScannerProps {
  onQRCodeScanned: (qrData: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function QRScanner({ onQRCodeScanned, onCancel, isLoading = false }: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);

  useEffect(() => {
    const initCamera = async () => {
      try {
        // Check if camera is available
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop the test stream
        setHasPermission(true);
      } catch (err) {
        console.error('Camera permission denied:', err);
        setHasPermission(false);
        setError('Se requiere acceso a la cámara para escanear códigos QR');
      }
    };

    initCamera();
  }, []);

  const startScanning = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      setError(null);
      
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      // Get available video input devices
      const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // Use the first available camera (usually back camera on mobile)
      const selectedDeviceId = videoInputDevices[0].deviceId;

      // Start decoding from video element
      const result = await codeReader.decodeOnceFromVideoDevice(selectedDeviceId, videoRef.current);
      
      if (result) {
        onQRCodeScanned(result.getText());
        stopScanning();
      }
    } catch (err) {
      console.error('Error scanning QR code:', err);
      setError('Error al escanear. Intenta nuevamente.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      try {
        codeReaderRef.current.reset();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
      codeReaderRef.current = null;
    }
    setIsScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

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

  return (
    <div className="space-y-4">
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
                  onClick={startScanning}
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
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        {isScanning && (
          <Button onClick={stopScanning} variant="outline" className="flex-1">
            Detener
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-2">Instrucciones:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Apunta la cámara hacia el código QR</li>
            <li>• Mantén el dispositivo estable</li>
            <li>• Asegúrate de que haya buena iluminación</li>
            <li>• El código QR debe estar completamente visible</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
