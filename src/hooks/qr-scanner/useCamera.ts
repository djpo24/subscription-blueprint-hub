
import { useState, useEffect } from 'react';

// Detectar tipo de dispositivo
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

export function useCamera() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const deviceType = getDeviceType();

  const initCamera = async () => {
    try {
      console.log(`🎯 [${deviceType}] Initializing camera for Beeprt CC450 CPCL Barcode scanning (priority over QR)...`);
      
      // Configuraciones específicas de permisos para iPad
      const videoConstraints = deviceType === 'iPad' ? {
        video: {
          facingMode: 'environment',
          width: { ideal: 3840, min: 1920 },
          height: { ideal: 2160, min: 1080 }
        }
      } : { video: true };

      // Check if camera is available and get camera list
      const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log(`📷 [${deviceType}] Available cameras:`, videoDevices.map(d => ({ 
        label: d.label, 
        deviceId: d.deviceId.substring(0, 20) + '...',
        groupId: d.groupId
      })));
      
      // Sort cameras to prioritize rear camera (environment facing) con lógica específica para iPad
      const sortedCameras = videoDevices.sort((a, b) => {
        const aIsRear = isRearCamera(a.label);
        const bIsRear = isRearCamera(b.label);
        
        // Para iPad, priorizar cámaras ultra wide o main
        if (deviceType === 'iPad') {
          const aIsUltraWide = a.label.toLowerCase().includes('ultra') || a.label.toLowerCase().includes('wide');
          const bIsUltraWide = b.label.toLowerCase().includes('ultra') || b.label.toLowerCase().includes('wide');
          
          if (aIsUltraWide && !bIsUltraWide) return -1;
          if (!aIsUltraWide && bIsUltraWide) return 1;
        }
        
        if (aIsRear && !bIsRear) return -1;
        if (!aIsRear && bIsRear) return 1;
        return 0;
      });
      
      setAvailableCameras(sortedCameras);
      setCurrentCameraIndex(0); // Start with first camera (should be rear if available)
      setHasPermission(true);
      
      console.log(`✅ [${deviceType}] Camera initialized for Barcode detection (priority). Default camera:`, 
        sortedCameras[0]?.label || 'Unknown');
        
      // Log adicional para iPad
      if (deviceType === 'iPad' && sortedCameras.length > 0) {
        console.log(`🎯 [iPad] Selected camera details:`, {
          label: sortedCameras[0].label,
          deviceId: sortedCameras[0].deviceId.substring(0, 20) + '...',
          isRear: isRearCamera(sortedCameras[0].label)
        });
      }
      
    } catch (err) {
      console.error(`❌ [${deviceType}] Camera permission denied:`, err);
      setHasPermission(false);
      setError(`Se requiere acceso a la cámara para escanear códigos de barras en ${deviceType}`);
    }
  };

  // Función mejorada para detectar cámara trasera
  const isRearCamera = (label: string): boolean => {
    const lowerLabel = label.toLowerCase();
    const rearKeywords = [
      'back', 'rear', 'environment', 'trasera', 'posterior',
      'main', 'principal', 'wide', 'ultra', 'telephoto'
    ];
    const frontKeywords = [
      'front', 'frontal', 'user', 'face', 'selfie'
    ];
    
    // Si contiene palabras de frente, no es trasera
    if (frontKeywords.some(keyword => lowerLabel.includes(keyword))) {
      return false;
    }
    
    // Si contiene palabras de trasera, es trasera
    return rearKeywords.some(keyword => lowerLabel.includes(keyword));
  };

  const switchCamera = () => {
    if (availableCameras.length > 1) {
      console.log(`🔄 [${deviceType}] Switching camera...`);
      const newIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(newIndex);
      console.log(`✅ [${deviceType}] Switched to camera:`, 
        availableCameras[newIndex]?.label || `Camera ${newIndex + 1}`);
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
