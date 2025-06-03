
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
      console.log('Initializing camera...');
      
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

  const startVideoStream = async (deviceId: string) => {
    try {
      console.log('Starting video stream with device:', deviceId);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Start new stream with selected camera
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          facingMode: 'environment' // Try to use rear camera
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        console.log('Video stream started successfully');
      }

      return stream;
    } catch (err) {
      console.error('Error starting video stream:', err);
      throw err;
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
      console.log('Starting scan with camera:', selectedCamera.label || `Camera ${currentCameraIndex + 1}`);

      // Start video stream if not already started
      if (!streamRef.current) {
        await startVideoStream(selectedCamera.deviceId);
      }

      // Create abort controller for this scanning session
      const abortController = new AbortController();
      scanningAbortController.current = abortController;

      const codeReader = new BrowserQRCodeReader();
      codeReaderRef.current = codeReader;

      // Start scanning from the video element
      try {
        const result = await codeReader.decodeOnceFromVideoDevice(selectedCamera.deviceId, videoRef.current);
        
        // Check if scanning was aborted
        if (abortController.signal.aborted) {
          return;
        }
        
        if (result) {
          console.log('QR Code scanned:', result.getText());
          onQRCodeScanned(result.getText());
          stopScanning();
        }
      } catch (scanError) {
        // Check if scanning was aborted
        if (abortController.signal.aborted) {
          return;
        }
        throw scanError;
      }
    } catch (err) {
      console.error('Error scanning QR code:', err);
      setError('Error al escanear. Intenta nuevamente.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    console.log('Stopping scanning...');
    
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
          setError('Error al inicializar la cámara');
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
