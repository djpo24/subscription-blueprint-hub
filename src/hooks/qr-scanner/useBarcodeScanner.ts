
import { useState, useRef } from 'react';
import { BrowserQRCodeReader, BrowserMultiFormatReader } from '@zxing/browser';

export function useBarcodeScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const qrCodeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const scanningAbortController = useRef<AbortController | null>(null);
  const continuousScanRef = useRef<boolean>(false);

  // Función para escaneo continuo con prioridad a Barcode sobre QR
  const continuousCodeScan = async (
    onCodeScanned: (codeData: string) => void, 
    barcodeReader: BrowserMultiFormatReader, 
    qrReader: BrowserQRCodeReader, 
    deviceId: string,
    videoElement: HTMLVideoElement
  ) => {
    if (!videoElement || !continuousScanRef.current) return;

    try {
      console.log('Attempting thermal printer Barcode scan (PRIORITY)...');
      const barcodeResult = await barcodeReader.decodeOnceFromVideoDevice(deviceId, videoElement);
      
      if (barcodeResult && continuousScanRef.current) {
        console.log('Thermal printer Barcode successfully detected:', barcodeResult.getText());
        onCodeScanned(barcodeResult.getText());
        stopScanning();
        return;
      }
    } catch (barcodeError: any) {
      // Si falla Barcode, intentar con QR como fallback
      try {
        console.log('Barcode failed, attempting thermal printer QR scan as fallback...');
        const qrResult = await qrReader.decodeOnceFromVideoDevice(deviceId, videoElement);
        
        if (qrResult && continuousScanRef.current) {
          console.log('Thermal printer QR Code successfully detected as fallback:', qrResult.getText());
          onCodeScanned(qrResult.getText());
          stopScanning();
          return;
        }
      } catch (qrError: any) {
        // Continuar intentando si no se detectó ningún código
        if (continuousScanRef.current) {
          setTimeout(() => {
            continuousCodeScan(onCodeScanned, barcodeReader, qrReader, deviceId, videoElement);
          }, 25); // Escanear cada 25ms para mayor frecuencia
        }
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
      
      console.log('Starting thermal printer Barcode scan (PRIORITY) with device:', deviceId);

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      // Configurar Multi-format reader para códigos de barras (PRIORIDAD - incluyendo Code128, Code39, etc.)
      const barcodeReader = new BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 25,
        delayBetweenScanSuccess: 300
      });
      barcodeReaderRef.current = barcodeReader;

      // Configurar QR code reader como fallback
      const qrCodeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 50, // Más delay para QR ya que es fallback
        delayBetweenScanSuccess: 300
      });
      qrCodeReaderRef.current = qrCodeReader;

      // Iniciar escaneo continuo con PRIORIDAD a códigos de barras
      console.log('Starting continuous thermal printer Barcode decode (priority over QR)...');
      continuousCodeScan(onCodeScanned, barcodeReader, qrCodeReader, deviceId, videoElement);
      
    } catch (err) {
      console.error('Error starting thermal printer Barcode scan:', err);
      setIsScanning(false);
      continuousScanRef.current = false;
      throw err;
    }
  };

  const stopScanning = () => {
    console.log('Stopping thermal printer Barcode scanning...');
    
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

  return {
    isScanning,
    startScanning,
    stopScanning
  };
}
