
import { useState, useRef } from 'react';
import { BrowserQRCodeReader, BrowserMultiFormatReader, Result } from '@zxing/browser';
import { useScannerSounds } from './useScannerSounds';

// Detectar tipo de dispositivo para optimizaciones específicas
function getDeviceType(): string {
  if (/iPad/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
    return 'iPad';
  }
  if (/iPhone/.test(navigator.userAgent)) {
    return 'iPhone';
  }
  if (/Android/.test(navigator.userAgent)) {
    return 'Android';
  }
  return 'Generic';
}

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningAbortController = useRef<AbortController | null>(null);
  const continuousScanRef = useRef<boolean>(false);
  const scanAttemptsRef = useRef<number>(0);
  const deviceType = getDeviceType();
  
  // Integrar los sonidos del escáner
  const { playSuccessBeep, playErrorBeep, cleanup: cleanupSounds } = useScannerSounds();

  // Configuraciones específicas por dispositivo
  const getScanConfig = () => {
    if (deviceType === 'iPad') {
      return {
        scanInterval: 20, // Más frecuente para iPad
        maxAttempts: 150, // Más intentos para iPad
        barcodeDelay: 20,
        qrDelay: 40,
        successDelay: 200
      };
    } else if (deviceType === 'iPhone') {
      return {
        scanInterval: 25,
        maxAttempts: 100,
        barcodeDelay: 25,
        qrDelay: 50,
        successDelay: 300
      };
    } else {
      return {
        scanInterval: 30,
        maxAttempts: 80,
        barcodeDelay: 30,
        qrDelay: 60,
        successDelay: 300
      };
    }
  };

  // Función mejorada para escaneo continuo con optimizaciones por dispositivo
  const continuousCodeScan = async (
    onCodeScanned: (codeData: string) => void, 
    barcodeReader: BrowserMultiFormatReader, 
    qrReader: BrowserQRCodeReader, 
    deviceId: string,
    videoElement: HTMLVideoElement
  ) => {
    if (!videoElement || !continuousScanRef.current) return;

    const config = getScanConfig();
    scanAttemptsRef.current++;

    try {
      console.log(`📊 [${deviceType}] Attempting thermal printer Barcode scan (PRIORITY) - Attempt ${scanAttemptsRef.current}/${config.maxAttempts}`);
      
      const barcodeResult = await Promise.race([
        barcodeReader.decodeOnceFromVideoDevice(deviceId, videoElement),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Barcode timeout')), config.barcodeDelay))
      ]) as Result;
      
      if (barcodeResult && continuousScanRef.current) {
        console.log(`🎯 [${deviceType}] Thermal printer Barcode successfully detected:`, barcodeResult.getText());
        
        // Detener el escaneo primero
        stopScanning();
        
        // Reproducir sonido de éxito DESPUÉS de detener el escaneo
        console.log('🔊 Playing success sound...');
        await playSuccessBeep();
        
        // Llamar al callback después del sonido
        onCodeScanned(barcodeResult.getText());
        return;
      }
    } catch (barcodeError: any) {
      // Si falla Barcode, intentar con QR como fallback (solo después de varios intentos de barcode)
      if (scanAttemptsRef.current % 3 === 0) { // Intentar QR cada 3 intentos de barcode
        try {
          console.log(`🔄 [${deviceType}] Barcode failed, attempting thermal printer QR scan as fallback...`);
          
          const qrResult = await Promise.race([
            qrReader.decodeOnceFromVideoDevice(deviceId, videoElement),
            new Promise<never>((_, reject) => setTimeout(() => reject(new Error('QR timeout')), config.qrDelay))
          ]) as Result;
          
          if (qrResult && continuousScanRef.current) {
            console.log(`🎯 [${deviceType}] Thermal printer QR Code successfully detected as fallback:`, qrResult.getText());
            
            // Detener el escaneo primero
            stopScanning();
            
            // Reproducir sonido de éxito DESPUÉS de detener el escaneo
            console.log('🔊 Playing success sound for QR...');
            await playSuccessBeep();
            
            // Llamar al callback después del sonido
            onCodeScanned(qrResult.getText());
            return;
          }
        } catch (qrError: any) {
          // Continuar con el siguiente intento
        }
      }
      
      // Continuar intentando si no se detectó ningún código y no hemos superado el máximo
      if (continuousScanRef.current && scanAttemptsRef.current < config.maxAttempts) {
        setTimeout(() => {
          continuousCodeScan(onCodeScanned, barcodeReader, qrReader, deviceId, videoElement);
        }, config.scanInterval);
      } else if (scanAttemptsRef.current >= config.maxAttempts) {
        console.log(`⚠️ [${deviceType}] Maximum scan attempts reached (${config.maxAttempts}), resetting...`);
        scanAttemptsRef.current = 0;
        
        // Reiniciar después de un breve pausa
        setTimeout(() => {
          if (continuousScanRef.current) {
            continuousCodeScan(onCodeScanned, barcodeReader, qrReader, deviceId, videoElement);
          }
        }, config.scanInterval * 2);
      }
    }
  };

  const startScanning = async (
    onCodeScanned: (codeData: string) => void,
    deviceId: string,
    videoElement: HTMLVideoElement | null
  ) => {
    if (!videoElement) {
      console.error('Video element not available');
      return;
    }

    try {
      setIsScanning(true);
      continuousScanRef.current = true;
      scanAttemptsRef.current = 0;
      
      console.log(`🚀 [${deviceType}] Starting thermal printer Barcode scan (PRIORITY) with device:`, deviceId);

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      // Configurar Multi-format reader para códigos de barras (PRIORIDAD - incluyendo Code128, Code39, etc.)
      const barcodeReader = new BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: getScanConfig().barcodeDelay,
        delayBetweenScanSuccess: getScanConfig().successDelay
      });
      barcodeReaderRef.current = barcodeReader;

      // Configurar QR code reader como fallback
      const qrCodeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: getScanConfig().qrDelay,
        delayBetweenScanSuccess: getScanConfig().successDelay
      });
      qrCodeReaderRef.current = qrCodeReader;

      // Iniciar escaneo continuo con PRIORIDAD a códigos de barras
      console.log(`🎯 [${deviceType}] Starting continuous thermal printer Barcode decode (priority over QR)...`);
      continuousCodeScan(onCodeScanned, barcodeReader, qrCodeReader, deviceId, videoElement);
      
    } catch (err) {
      console.error(`❌ [${deviceType}] Error starting thermal printer Barcode scan:`, err);
      
      // Reproducir sonido de error si falla al iniciar
      await playErrorBeep();
      
      setIsScanning(false);
      continuousScanRef.current = false;
      throw err;
    }
  };

  const stopScanning = () => {
    console.log(`🛑 [${deviceType}] Stopping thermal printer Barcode scanning...`);
    
    // Detener escaneo continuo
    continuousScanRef.current = false;
    scanAttemptsRef.current = 0;
    
    // Abort any ongoing scanning
    if (scanningAbortController.current) {
      scanningAbortController.current.abort();
      scanningAbortController.current = null;
    }
    
    // Clear the code reader references
    qrCodeReaderRef.current = null;
    barcodeReaderRef.current = null;
    
    setIsScanning(false);
    
    // NO limpiar recursos de audio inmediatamente - darle tiempo al sonido
    // El cleanup se hará después cuando se necesite o cuando el componente se desmonte
  };

  const cleanup = () => {
    stopScanning();
    // Limpiar recursos de audio con un pequeño delay para permitir que termine el sonido
    setTimeout(() => {
      cleanupSounds();
    }, 500);
  };

  return {
    isScanning,
    startScanning,
    stopScanning,
    cleanup
  };
}
