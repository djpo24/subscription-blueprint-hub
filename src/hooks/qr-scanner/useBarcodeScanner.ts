
import { useState, useRef } from 'react';
import { BrowserQRCodeReader, BrowserMultiFormatReader } from '@zxing/browser';
import { Result } from '@zxing/library';
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
  const deviceType = getDeviceType();
  
  // Integrar los sonidos del escáner
  const { playSuccessBeep, playErrorBeep, cleanup: cleanupSounds } = useScannerSounds();

  // Función de escaneo continuo SIN intervalos - funciona como antes
  const continuousCodeScan = async (
    onCodeScanned: (codeData: string) => void, 
    barcodeReader: BrowserMultiFormatReader, 
    qrReader: BrowserQRCodeReader, 
    deviceId: string,
    videoElement: HTMLVideoElement
  ) => {
    if (!videoElement || !continuousScanRef.current) return;

    try {
      console.log(`📊 [${deviceType}] Escaneando código de barras (PRIORIDAD) - Máxima resolución`);
      
      // Intentar escanear código de barras primero (PRIORIDAD)
      const barcodeResult = await barcodeReader.decodeOnceFromVideoDevice(deviceId, videoElement) as Result;
      
      if (barcodeResult && continuousScanRef.current) {
        console.log(`🎯 [${deviceType}] Código de barras detectado exitosamente:`, barcodeResult.getText());
        
        // Detener el escaneo primero
        stopScanning();
        
        // Reproducir sonido de éxito
        console.log('🔊 Reproduciendo sonido de éxito...');
        await playSuccessBeep();
        
        // Llamar al callback después del sonido
        onCodeScanned(barcodeResult.getText());
        return;
      }
    } catch (barcodeError: any) {
      // Si falla código de barras, intentar QR como fallback
      try {
        console.log(`🔄 [${deviceType}] Código de barras falló, intentando QR como respaldo...`);
        
        const qrResult = await qrReader.decodeOnceFromVideoDevice(deviceId, videoElement) as Result;
        
        if (qrResult && continuousScanRef.current) {
          console.log(`🎯 [${deviceType}] Código QR detectado como respaldo:`, qrResult.getText());
          
          // Detener el escaneo primero
          stopScanning();
          
          // Reproducir sonido de éxito
          console.log('🔊 Reproduciendo sonido de éxito para QR...');
          await playSuccessBeep();
          
          // Llamar al callback después del sonido
          onCodeScanned(qrResult.getText());
          return;
        }
      } catch (qrError: any) {
        // Continuar con el siguiente intento SIN delay
      }
      
      // Continuar intentando INMEDIATAMENTE sin intervalos
      if (continuousScanRef.current) {
        continuousCodeScan(onCodeScanned, barcodeReader, qrReader, deviceId, videoElement);
      }
    }
  };

  const startScanning = async (
    onCodeScanned: (codeData: string) => void,
    deviceId: string,
    videoElement: HTMLVideoElement | null
  ) => {
    if (!videoElement) {
      console.error('Elemento de video no disponible');
      return;
    }

    try {
      setIsScanning(true);
      continuousScanRef.current = true;
      
      console.log(`🚀 [${deviceType}] Iniciando escaneo de códigos de barras con máxima resolución - dispositivo:`, deviceId);

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      // Configurar Multi-format reader para códigos de barras (PRIORIDAD)
      const barcodeReader = new BrowserMultiFormatReader();
      barcodeReaderRef.current = barcodeReader;

      // Configurar QR code reader como fallback
      const qrCodeReader = new BrowserQRCodeReader();
      qrCodeReaderRef.current = qrCodeReader;

      // Iniciar escaneo continuo INMEDIATO sin intervalos
      console.log(`🎯 [${deviceType}] Iniciando decodificación continua inmediata de códigos de barras...`);
      continuousCodeScan(onCodeScanned, barcodeReader, qrCodeReader, deviceId, videoElement);
      
    } catch (err) {
      console.error(`❌ [${deviceType}] Error iniciando escaneo de códigos de barras:`, err);
      
      // Reproducir sonido de error si falla al iniciar
      await playErrorBeep();
      
      setIsScanning(false);
      continuousScanRef.current = false;
      throw err;
    }
  };

  const stopScanning = () => {
    console.log(`🛑 [${deviceType}] Deteniendo escaneo de códigos de barras...`);
    
    // Detener escaneo continuo
    continuousScanRef.current = false;
    
    // Abort any ongoing scanning
    if (scanningAbortController.current) {
      scanningAbortController.current.abort();
      scanningAbortController.current = null;
    }
    
    // Clear the code reader references
    qrCodeReaderRef.current = null;
    barcodeReaderRef.current = null;
    
    setIsScanning(false);
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
