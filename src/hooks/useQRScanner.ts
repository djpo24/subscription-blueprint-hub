
import { useState, useEffect, useRef } from 'react';
import { BrowserQRCodeReader } from '@zxing/browser';

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

  const initCamera = async () => {
    try {
      console.log('Initializing camera with high resolution...');
      
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
      
      console.log('Camera initialized. Default camera:', sortedCameras[0]?.label || 'Unknown');
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
      // Configuración para máxima resolución y calidad
      width: { 
        ideal: 1920, 
        min: 640,
        max: 4096 
      },
      height: { 
        ideal: 1080, 
        min: 480,
        max: 2160 
      },
      // Enfocar específicamente para lectura de cerca
      focusMode: 'continuous',
      // Configuraciones adicionales para mejor calidad
      aspectRatio: { ideal: 16/9 },
      frameRate: { ideal: 30, min: 15, max: 60 },
      // Configuraciones específicas para dispositivos móviles
      exposureMode: 'continuous',
      whiteBalanceMode: 'continuous'
    };
  };

  const startVideoStream = async (deviceId: string) => {
    try {
      console.log('Starting high-resolution video stream with device:', deviceId);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Get optimal constraints for the device
      const videoConstraints = getOptimalVideoConstraints(deviceId);
      
      console.log('Video constraints:', videoConstraints);

      const constraints = {
        video: videoConstraints,
        audio: false // No necesitamos audio para QR scanning
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Configurar el elemento video para mejor calidad
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        await videoRef.current.play();
        
        // Log de la resolución actual del stream
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log('Actual video settings:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          facingMode: settings.facingMode,
          deviceId: settings.deviceId
        });
        
        console.log('High-resolution video stream started successfully');
      }

      return stream;
    } catch (err) {
      console.error('Error starting high-resolution video stream:', err);
      
      // Fallback to lower resolution if high resolution fails
      try {
        console.log('Trying fallback resolution...');
        const fallbackConstraints = {
          video: {
            deviceId: { exact: deviceId },
            facingMode: 'environment',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          },
          audio: false
        };
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = fallbackStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
          console.log('Fallback video stream started');
        }
        
        return fallbackStream;
      } catch (fallbackErr) {
        console.error('Fallback video stream also failed:', fallbackErr);
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

  const startScanning = async (onQRCodeScanned: (qrData: string) => void) => {
    if (!videoRef.current || availableCameras.length === 0) {
      console.error('Video element or cameras not available');
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      
      const selectedCamera = availableCameras[currentCameraIndex];
      console.log('Starting QR scan with high-resolution camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);

      // Start video stream if not already started
      if (!streamRef.current) {
        await startVideoStream(selectedCamera.deviceId);
      }

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      // Configurar QR code reader con mejores opciones
      const codeReader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 100, // Reducir delay para scanning más rápido
        delayBetweenScanSuccess: 500, // Delay después de escaneo exitoso
        tryHarder: true // Intentar más duro para detectar códigos
      });
      codeReaderRef.current = codeReader;

      // Start scanning from the video element
      try {
        console.log('Starting QR decode with enhanced settings...');
        const result = await codeReader.decodeOnceFromVideoDevice(selectedCamera.deviceId, videoRef.current);
        
        // Check if scanning was aborted
        if (abortController.signal.aborted) {
          console.log('QR scanning was aborted');
          return;
        }
        
        if (result) {
          console.log('QR Code successfully scanned:', result.getText());
          onQRCodeScanned(result.getText());
          stopScanning();
        }
      } catch (scanError: any) {
        // Check if scanning was aborted
        if (abortController.signal.aborted) {
          console.log('QR scanning was aborted during decode');
          return;
        }
        
        console.error('QR scan error:', scanError);
        
        // Provide more specific error messages
        if (scanError.name === 'NotFoundError') {
          setError('No se pudo detectar un código QR. Asegúrate de que esté bien iluminado y enfocado.');
        } else if (scanError.name === 'NotReadableError') {
          setError('Error de lectura de la cámara. Intenta cambiar de cámara.');
        } else {
          setError('Error al escanear. Intenta nuevamente o cambia de cámara.');
        }
        
        setIsScanning(false);
      }
    } catch (err) {
      console.error('Error starting QR scan:', err);
      setError('Error al inicializar el escáner. Verifica los permisos de la cámara.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    console.log('Stopping QR scanning...');
    
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
    console.log('Cleaning up camera resources...');
    
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
          setError('Error al inicializar la cámara con alta resolución');
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
