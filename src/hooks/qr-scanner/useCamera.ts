
import { useState, useEffect } from 'react';

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const initCamera = async () => {
    try {
      console.log('Initializing camera for Beeprt CC450 CPCL Barcode scanning (priority over QR)...');
      
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
      
      console.log('Camera initialized for Barcode detection (priority). Default camera:', sortedCameras[0]?.label || 'Unknown');
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasPermission(false);
      setError('Se requiere acceso a la cámara para escanear códigos de barras');
    }
  };

  const switchCamera = () => {
    if (availableCameras.length > 1) {
      console.log('Switching camera...');
      const newIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(newIndex);
      console.log('Switched to camera:', availableCameras[newIndex]?.label || `Camera ${newIndex + 1}`);
    }
  };

  useEffect(() => {
    initCamera();
  }, []);

  return {
    hasPermission,
    error,
    setError,
    availableCameras,
    currentCameraIndex,
    switchCamera
  };
}
