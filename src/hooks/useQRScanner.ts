
import { useEffect } from 'react';
import { useCamera } from './qr-scanner/useCamera';
import { useCameraStream } from './qr-scanner/useCameraStream';
import { useBarcodeScanner } from './qr-scanner/useBarcodeScanner';

export function useQRScanner() {
  const {
    hasPermission,
    error,
    setError,
    availableCameras,
    currentCameraIndex,
    switchCamera: switchCameraIndex
  } = useCamera();

  const {
    videoRef,
    streamRef,
    startVideoStream,
    cleanup: cleanupVideo
  } = useCameraStream();

  const {
    isScanning,
    startScanning: startBarcodeScanning,
    stopScanning,
    cleanup: cleanupScanner
  } = useBarcodeScanner();

  const switchCamera = async () => {
    if (availableCameras.length > 1) {
      // Stop current scanning
      stopScanning();
      
      // Switch to next camera
      switchCameraIndex();
    }
  };

  const startScanning = async (onCodeScanned: (codeData: string) => void) => {
    if (!videoRef.current || availableCameras.length === 0) {
      console.error('Video element or cameras not available');
      return;
    }

    try {
      setError(null);
      
      const selectedCamera = availableCameras[currentCameraIndex];
      console.log('Starting scan with camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);

      // Start video stream if not already started
      if (!streamRef.current) {
        await startVideoStream(selectedCamera.deviceId);
      }

      // Start barcode scanning
      await startBarcodeScanning(onCodeScanned, selectedCamera.deviceId, videoRef.current);
      
    } catch (err) {
      console.error('Error starting scan:', err);
      setError('Error al inicializar el escáner para códigos de barras de impresora térmica');
    }
  };

  // Cleanup function that properly handles all resources
  const cleanup = () => {
    cleanupScanner();
    cleanupVideo();
  };

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

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
