
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

  const initCamera = async () => {
    try {
      // Check if camera is available and get camera list
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      // Sort cameras to prioritize rear camera (environment facing)
      const sortedCameras = videoDevices.sort((a, b) => {
        const aIsRear = a.label.toLowerCase().includes('back') || a.label.toLowerCase().includes('rear') || a.label.toLowerCase().includes('environment');
        const bIsRear = b.label.toLowerCase().includes('back') || b.label.toLowerCase().includes('rear') || b.label.toLowerCase().includes('environment');
        
        if (aIsRear && !bIsRear) return -1;
        if (!aIsRear && bIsRear) return 1;
        return 0;
      });
      
      setAvailableCameras(sortedCameras);
      setCurrentCameraIndex(0); // Start with first camera (should be rear if available)
      setHasPermission(true);
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Se requiere acceso a la cámara para escanear códigos QR');
    }
  };

  const switchCamera = () => {
    if (availableCameras.length > 1) {
      stopScanning();
      setCurrentCameraIndex((prev) => (prev + 1) % availableCameras.length);
    }
  };

  const startScanning = async (onQRCodeScanned: (qrData: string) => void) => {
    if (!videoRef.current || availableCameras.length === 0) return;

    try {
      setIsScanning(true);
      setError(null);
      
      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      // Use the selected camera
      const selectedCamera = availableCameras[currentCameraIndex];
      const selectedDeviceId = selectedCamera.deviceId;

      console.log('Using camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);

      // Start decoding from video element with the selected camera
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
    // Stop the video stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear the code reader
    codeReaderRef.current = null;
    setIsScanning(false);
  };

  useEffect(() => {
    initCamera();
    return () => {
      stopScanning();
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
