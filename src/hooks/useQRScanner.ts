
import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader, BarcodeFormat } from '@zxing/browser';

export function useQRScanner() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserQRCodeReader | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningAbortController = useRef<AbortController | null>(null);
  const continuousScanRef = useRef<boolean>(false);

  const initCamera = async () => {
    try {
      console.log('Initializing camera for Beeprt CC450 CPCL QR scanning...');
      
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
      
      console.log('Camera initialized for thermal printer QR detection. Default camera:', sortedCameras[0]?.label || 'Unknown');
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Se requiere acceso a la cámara para escanear códigos QR');
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
      // Configuraciones específicas para códigos QR de impresoras térmicas
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
      console.log('Starting ultra high-resolution video stream for thermal printer QR codes with device:', deviceId);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Get optimal constraints for the device
      const videoConstraints = getOptimalVideoConstraints(deviceId);
      
      console.log('Video constraints for thermal printer QR:', videoConstraints);

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
        console.log('Actual video settings for thermal printer QR:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          facingMode: settings.facingMode,
          deviceId: settings.deviceId
        });
        
        console.log('Ultra high-resolution video stream started for thermal printer QR detection');
      }

      return stream;
    } catch (err) {
      console.error('Error starting ultra high-resolution video stream:', err);
      
      // Fallback to high resolution if ultra high resolution fails
      try {
        console.log('Trying high resolution fallback for thermal printer QR...');
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

  // Función para escaneo continuo optimizado para impresoras térmicas
  const continuousQRScan = async (onQRCodeScanned: (qrData: string) => void, codeReader: BrowserQRCodeReader, deviceId: string) => {
    if (!videoRef.current || !continuousScanRef.current) return;

    try {
      console.log('Attempting thermal printer QR scan...');
      const result = await codeReader.decodeOnceFromVideoDevice(deviceId, videoRef.current);
      
      if (result && continuousScanRef.current) {
        console.log('Thermal printer QR Code successfully detected:', result.getText());
        onQRCodeScanned(result.getText());
        stopScanning();
        return;
      }
    } catch (scanError: any) {
      // Continuar intentando si no se detectó código o hay errores menores
      if (scanError.name === 'NotFoundException') {
        // No se encontró código QR, continuar escaneando
        if (continuousScanRef.current) {
          setTimeout(() => {
            continuousQRScan(onQRCodeScanned, codeReader, deviceId);
          }, 50); // Escanear cada 50ms para mayor frecuencia
        }
      } else {
        console.error('Thermal printer QR scan error:', scanError);
        if (continuousScanRef.current) {
          setTimeout(() => {
            continuousQRScan(onQRCodeScanned, codeReader, deviceId);
          }, 100);
        }
      }
    }
  };

  const startScanning = async (onQRCodeScanned: (qrData: string) => void) => {
    if (!videoRef.current || availableCameras.length === 0) {
      console.error('Video element or cameras not available');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      continuousScanRef.current = true;
      
      const selectedCamera = availableCameras[currentCameraIndex];
      console.log('Starting thermal printer QR scan with camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);

      // Start video stream if not already started
      if (!streamRef.current) {
        await startVideoStream(selectedCamera.deviceId);
      }

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      // Configurar QR code reader optimizado para impresoras térmicas
      const codeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 50, // Reducir delay significativamente para escaneo más agresivo
        delayBetweenScanSuccess: 300, // Reducir delay después de escaneo exitoso
        // Usar formatos específicos para mejor detección
        formats: [BarcodeFormat.QR_CODE]
      });
      codeReaderRef.current = codeReader;

      // Iniciar escaneo continuo
      console.log('Starting continuous thermal printer QR decode...');
      continuousQRScan(onQRCodeScanned, codeReader, selectedCamera.deviceId);
      
    } catch (err) {
      console.error('Error starting thermal printer QR scan:', err);
      setError('Error al inicializar el escáner para códigos QR de impresora térmica');
      setIsScanning(false);
      continuousScanRef.current = false;
    }
  };

  const stopScanning = () => {
    console.log('Stopping thermal printer QR scanning...');
    
    // Detener escaneo continuo
    continuousScanRef.current = false;
    
    // Abort any ongoing scanning
    if (scanningAbortController.current) {
      scanningAbortController.current.abort();
      scanningAbortController.current = null;
    }
    
    // Clear the code reader reference
    codeReaderRef.current = null;
    
    setIsScanning(false);
  };

  const cleanup = () => {
    console.log('Cleaning up thermal printer QR scanner resources...');
    
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
