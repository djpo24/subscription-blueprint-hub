import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader, BrowserMultiFormatReader } from '@zxing/browser';

export function useQRScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrCodeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const barcodeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningAbortController = useRef<AbortController | null>(null);
  const continuousScanRef = useRef<boolean>(false);

  const initCamera = async () => {
    try {
      console.log('Initializing camera for Beeprt CC450 CPCL QR/Barcode scanning...');
      
      // Check if camera is available and get camera list
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available cameras:', videoDevices.map(d => ({ label: d.label, deviceId: d.deviceId })));
      
      // Sort cameras to prioritize rear camera (environment facing)
      const sortedCameras = videoDevices.sort((a, b) => {
        const aIsRear = a.label.toLowerCase().includes('back') || 
                       a.label.toLowerCase().includes('rear') || 
                       a.label.toLowerCase().includes('environment') ||
                       a.label.toLowerCase().includes('trasera');
        const bIsRear = b.label.toLowerCase().includes('back') || 
                       b.label.toLowerCase().includes('rear') || 
                       b.label.toLowerCase().includes('environment') ||
                       b.label.toLowerCase().includes('trasera');
        
        if (aIsRear && !bIsRear) return -1;
        if (!aIsRear && bIsRear) return 1;
        return 0;
      });
      
      setAvailableCameras(sortedCameras);
      setCurrentCameraIndex(0); // Start with first camera (should be rear if available)
      setHasPermission(true);
      
      console.log('Camera initialized for thermal printer QR/Barcode detection. Default camera:', sortedCameras[0]?.label || 'Unknown');
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Se requiere acceso a la cámara para escanear códigos QR y códigos de barras');
    }
  };

  const getOptimalVideoConstraints = (deviceId: string) => {
    return {
      deviceId: { exact: deviceId },
      facingMode: 'environment',
      // Configuración ultra alta para impresoras térmicas
      width: { 
        ideal: 2560, // Aumentar resolución ideal
        min: 1280,
        max: 4096 
      },
      height: { 
        ideal: 1440, // Aumentar resolución ideal
        min: 720,
        max: 2160 
      },
      // Configuraciones específicas para códigos QR/Barcode de impresoras térmicas
      focusMode: 'continuous',
      aspectRatio: { ideal: 16/9 },
      frameRate: { ideal: 60, min: 30, max: 60 }, // Aumentar framerate
      exposureMode: 'continuous',
      whiteBalanceMode: 'continuous',
      // Configuraciones adicionales para mejor contraste
      brightness: { ideal: 0.5 },
      contrast: { ideal: 1.2 },
      saturation: { ideal: 1.1 }
    };
  };

  const startVideoStream = async (deviceId: string) => {
    try {
      console.log('Starting ultra high-resolution video stream for thermal printer QR/Barcode codes with device:', deviceId);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Get optimal constraints for the device
      const videoConstraints = getOptimalVideoConstraints(deviceId);
      
      console.log('Video constraints for thermal printer QR/Barcode:', videoConstraints);

      const constraints = {
        video: videoConstraints,
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Configurar el elemento video para máxima calidad
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        await videoRef.current.play();
        
        // Log de la resolución actual del stream
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log('Actual video settings for thermal printer QR/Barcode:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          facingMode: settings.facingMode,
          deviceId: settings.deviceId
        });
        
        console.log('Ultra high-resolution video stream started for thermal printer QR/Barcode detection');
      }

      return stream;
    } catch (err) {
      console.error('Error starting ultra high-resolution video stream:', err);
      
      // Fallback to high resolution if ultra high resolution fails
      try {
        console.log('Trying high resolution fallback for thermal printer QR/Barcode...');
        const fallbackConstraints = {
          video: {
            deviceId: { exact: deviceId },
            facingMode: 'environment',
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30, min: 15 }
          },
          audio: false
        };
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = fallbackStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
          console.log('High resolution fallback video stream started');
        }
        
        return fallbackStream;
      } catch (fallbackErr) {
        console.error('High resolution fallback also failed:', fallbackErr);
        throw fallbackErr;
      }
    }
  };

  const switchCamera = async () => {
    if (availableCameras.length > 1) {
      console.log('Switching camera...');
      
      // Stop current scanning
      stopScanning();
      
      // Switch to next camera
      const newIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(newIndex);
      
      console.log('Switched to camera:', availableCameras[newIndex]?.label || `Camera ${newIndex + 1}`);
      
      // Start video stream with new camera
      try {
        await startVideoStream(availableCameras[newIndex].deviceId);
      } catch (err) {
        console.error('Error switching camera:', err);
        setError('Error al cambiar de cámara');
      }
    }
  };

  // Función para escaneo continuo con QR y Barcode para impresoras térmicas
  const continuousCodeScan = async (onCodeScanned: (codeData: string) => void, qrReader: BrowserQRCodeReader, barcodeReader: BrowserMultiFormatReader, deviceId: string) => {
    if (!videoRef.current || !continuousScanRef.current) return;

    try {
      console.log('Attempting thermal printer QR scan...');
      const qrResult = await qrReader.decodeOnceFromVideoDevice(deviceId, videoRef.current);
      
      if (qrResult && continuousScanRef.current) {
        console.log('Thermal printer QR Code successfully detected:', qrResult.getText());
        onCodeScanned(qrResult.getText());
        stopScanning();
        return;
      }
    } catch (qrError: any) {
      // Si falla QR, intentar con código de barras
      try {
        console.log('QR failed, attempting thermal printer Barcode scan...');
        const barcodeResult = await barcodeReader.decodeOnceFromVideoDevice(deviceId, videoRef.current);
        
        if (barcodeResult && continuousScanRef.current) {
          console.log('Thermal printer Barcode successfully detected:', barcodeResult.getText());
          onCodeScanned(barcodeResult.getText());
          stopScanning();
          return;
        }
      } catch (barcodeError: any) {
        // Continuar intentando si no se detectó ningún código
        if (continuousScanRef.current) {
          setTimeout(() => {
            continuousCodeScan(onCodeScanned, qrReader, barcodeReader, deviceId);
          }, 25); // Escanear cada 25ms para mayor frecuencia
        }
      }
    }
  };

  const startScanning = async (onCodeScanned: (codeData: string) => void) => {
    if (!videoRef.current || availableCameras.length === 0) {
      console.error('Video element or cameras not available');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      continuousScanRef.current = true;
      
      const selectedCamera = availableCameras[currentCameraIndex];
      console.log('Starting thermal printer QR/Barcode scan with camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);

      // Start video stream if not already started
      if (!streamRef.current) {
        await startVideoStream(selectedCamera.deviceId);
      }

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      // Configurar QR code reader optimizado para impresoras térmicas
      const qrCodeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 25, // Reducir delay significativamente para escaneo más agresivo
        delayBetweenScanSuccess: 300 // Reducir delay después de escaneo exitoso
      });
      qrCodeReaderRef.current = qrCodeReader;

      // Configurar Multi-format reader para códigos de barras (incluyendo Code128, Code39, etc.)
      const barcodeReader = new BrowserMultiFormatReader(undefined, {
        delayBetweenScanAttempts: 25,
        delayBetweenScanSuccess: 300
      });
      barcodeReaderRef.current = barcodeReader;

      // Iniciar escaneo continuo con ambos lectores
      console.log('Starting continuous thermal printer QR/Barcode decode...');
      continuousCodeScan(onCodeScanned, qrCodeReader, barcodeReader, selectedCamera.deviceId);
      
    } catch (err) {
      console.error('Error starting thermal printer QR/Barcode scan:', err);
      setError('Error al inicializar el escáner para códigos QR y códigos de barras de impresora térmica');
      setIsScanning(false);
      continuousScanRef.current = false;
    }
  };

  const stopScanning = () => {
    console.log('Stopping thermal printer QR/Barcode scanning...');
    
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
    console.log('Cleaning up thermal printer QR/Barcode scanner resources...');
    
    // Stop scanning
    stopScanning();
    
    // Stop video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Clear video element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    initCamera();
    return cleanup;
  }, []);

  // Start video stream when camera changes
  useEffect(() => {
    if (availableCameras.length > 0 && hasPermission) {
      const selectedCamera = availableCameras[currentCameraIndex];
      if (selectedCamera) {
        startVideoStream(selectedCamera.deviceId).catch(err => {
          console.error('Error starting video stream on camera change:', err);
          setError('Error al inicializar la cámara con ultra alta resolución');
        });
      }
    }
  }, [currentCameraIndex, availableCameras, hasPermission]);

  return {
    hasPermission,
    error,
    isScanning,
    availableCameras,
    currentCameraIndex,
    videoRef,
    switchCamera,
    startScanning,
    stopScanning,
    setError
  };
}
