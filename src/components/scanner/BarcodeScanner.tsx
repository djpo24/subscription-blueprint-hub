import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload } from 'lucide-react';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  mode?: 'camera' | 'file' | 'both';
}

export function BarcodeScanner({ onScanSuccess, mode = 'both' }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const recentScansRef = useRef<Map<string, number>>(new Map());
  const isProcessingRef = useRef(false);

  const playBeep = () => {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleScan = async (decodedText: string) => {
    if (isProcessingRef.current) return;
    
    const now = Date.now();
    const lastScan = recentScansRef.current.get(decodedText);
    
    if (lastScan && now - lastScan < 2000) {
      return;
    }
    
    isProcessingRef.current = true;
    recentScansRef.current.set(decodedText, now);
    
    playBeep();
    await onScanSuccess(decodedText);
    
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 500);

    setTimeout(() => {
      recentScansRef.current.delete(decodedText);
    }, 5000);
  };

  const startCamera = async () => {
    try {
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [
          // @ts-ignore
          'CODE_128',
          'CODE_39',
          'EAN_13',
          'EAN_8',
          'QR_CODE',
          'UPC_A',
          'UPC_E'
        ]
      };

      await scanner.start(
        { facingMode: "environment" },
        config,
        handleScan,
        () => {}
      );

      setIsScanning(true);
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error("Error stopping camera:", err);
      }
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const scanner = new Html5Qrcode("qr-reader-file");
      const result = await scanner.scanFile(file, true);
      await handleScan(result);
    } catch (err) {
      console.error("Error scanning file:", err);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {(mode === 'camera' || mode === 'both') && (
            <>
              <div id="qr-reader" className="w-full" />
              <div className="flex gap-2">
                {!isScanning ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Activar Cámara
                  </Button>
                ) : (
                  <Button onClick={stopCamera} variant="destructive" className="flex-1">
                    Detener Cámara
                  </Button>
                )}
              </div>
            </>
          )}

          {(mode === 'file' || mode === 'both') && (
            <>
              <div id="qr-reader-file" className="hidden" />
              <div className="flex gap-2">
                <Button
                  onClick={() => document.getElementById('file-input')?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Imagen
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}