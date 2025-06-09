
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
      console.log(`🎯 [${deviceType}] Inicializando cámara con máxima resolución para escaneo de códigos de barras...`);
      
      // Configuraciones específicas de permisos con máxima resolución
      const videoConstraints = deviceType === 'iPad' ? {
        video: {
          facingMode: 'environment',
          width: { ideal: 7680, min: 3840 }, // 8K para iPad
          height: { ideal: 4320, min: 2160 }
        }
      } : deviceType === 'iPhone' ? {
        video: {
          facingMode: 'environment',
          width: { ideal: 3840, min: 1920 }, // 4K para iPhone
          height: { ideal: 2160, min: 1080 }
        }
      } : {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920, min: 1280 }, // Full HD para otros
          height: { ideal: 1080, min: 720 }
        }
      };

      // Check if camera is available and get camera list
      const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
      stream.getTracks().forEach(track => track.stop()); // Stop the test stream
      
      // Get available video devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log(`📷 [${deviceType}] Cámaras disponibles:`, videoDevices.map(d => ({ 
        label: d.label, 
        deviceId: d.deviceId.substring(0, 20) + '...',
        groupId: d.groupId,
        isRear: isRearCamera(d.label)
      })));
      
      // Ordenar cámaras para GARANTIZAR que la cámara trasera sea la primera
      const sortedCameras = sortCamerasByRearPriority(videoDevices);
      
      setAvailableCameras(sortedCameras);
      setCurrentCameraIndex(0); // SIEMPRE empezar con la primera cámara (que debe ser trasera)
      setHasPermission(true);
      
      console.log(`✅ [${deviceType}] Cámara inicializada. Cámara predeterminada (TRASERA):`, 
        sortedCameras[0]?.label || 'Desconocida', 'Es trasera:', isRearCamera(sortedCameras[0]?.label || ''));
        
      // Verificación adicional para asegurar que la primera cámara es trasera
      if (sortedCameras.length > 0 && !isRearCamera(sortedCameras[0].label)) {
        console.warn(`⚠️ [${deviceType}] ADVERTENCIA: La primera cámara no parece ser trasera. Revisando orden...`);
        logCameraDetails(sortedCameras);
      } else {
        console.log(`🎯 [${deviceType}] ✅ CONFIRMADO: Cámara trasera establecida como predeterminada`);
      }
      
    } catch (err) {
      console.error(`❌ [${deviceType}] Permiso de cámara denegado:`, err);
      setHasPermission(false);
      setError(`Se requiere acceso a la cámara para escanear códigos de barras en ${deviceType}`);
    }
  };

  // Función mejorada y más estricta para detectar cámara trasera
  const isRearCamera = (label: string): boolean => {
    if (!label) return false;
    
    const lowerLabel = label.toLowerCase();
    
    // Palabras que indican cámara frontal (EXCLUIR estas cámaras)
    const frontKeywords = [
      'front', 'frontal', 'user', 'face', 'selfie', 'facetime'
    ];
    
    // Palabras que indican cámara trasera (INCLUIR estas cámaras)
    const rearKeywords = [
      'back', 'rear', 'environment', 'trasera', 'posterior',
      'main', 'principal', 'wide', 'ultra', 'telephoto', 'macro'
    ];
    
    // Si contiene palabras de frente, definitivamente NO es trasera
    if (frontKeywords.some(keyword => lowerLabel.includes(keyword))) {
      console.log(`📱 [Camera Detection] "${label}" -> FRONTAL (excluida)`);
      return false;
    }
    
    // Si contiene palabras de trasera, definitivamente ES trasera
    if (rearKeywords.some(keyword => lowerLabel.includes(keyword))) {
      console.log(`📱 [Camera Detection] "${label}" -> TRASERA (incluida)`);
      return true;
    }
    
    // Para cámaras sin etiqueta específica, usar heurística por posición
    // Las cámaras traseras suelen estar listadas primero en muchos dispositivos
    console.log(`📱 [Camera Detection] "${label}" -> INDEFINIDA (se evaluará por posición)`);
    return false;
  };

  // Nueva función para ordenar cámaras con prioridad absoluta a la trasera
  const sortCamerasByRearPriority = (cameras: MediaDeviceInfo[]): MediaDeviceInfo[] => {
    console.log(`🔄 [${deviceType}] Ordenando cámaras para priorizar cámara trasera...`);
    
    const rearCameras: MediaDeviceInfo[] = [];
    const frontCameras: MediaDeviceInfo[] = [];
    const unknownCameras: MediaDeviceInfo[] = [];
    
    cameras.forEach(camera => {
      const label = camera.label || '';
      if (isRearCamera(label)) {
        rearCameras.push(camera);
      } else if (label.toLowerCase().includes('front') || label.toLowerCase().includes('user')) {
        frontCameras.push(camera);
      } else {
        unknownCameras.push(camera);
      }
    });
    
    // Para dispositivos específicos, aplicar lógica adicional
    if (deviceType === 'iPad') {
      // En iPad, priorizar cámaras ultra wide o main
      rearCameras.sort((a, b) => {
        const aIsUltraWide = a.label.toLowerCase().includes('ultra') || a.label.toLowerCase().includes('wide');
        const bIsUltraWide = b.label.toLowerCase().includes('ultra') || b.label.toLowerCase().includes('wide');
        
        if (aIsUltraWide && !bIsUltraWide) return -1;
        if (!aIsUltraWide && bIsUltraWide) return 1;
        return 0;
      });
    }
    
    // Orden final: Traseras primero, luego desconocidas, luego frontales
    const finalOrder = [...rearCameras, ...unknownCameras, ...frontCameras];
    
    console.log(`📋 [${deviceType}] Orden final de cámaras:`, finalOrder.map((cam, index) => ({
      position: index + 1,
      label: cam.label,
      isRear: isRearCamera(cam.label),
      type: isRearCamera(cam.label) ? 'TRASERA' : (cam.label.toLowerCase().includes('front') ? 'FRONTAL' : 'DESCONOCIDA')
    })));
    
    return finalOrder;
  };

  // Función para loggear detalles de todas las cámaras
  const logCameraDetails = (cameras: MediaDeviceInfo[]) => {
    console.log(`📋 [${deviceType}] Detalle completo de cámaras disponibles:`);
    cameras.forEach((camera, index) => {
      console.log(`  ${index + 1}. ${camera.label} - Trasera: ${isRearCamera(camera.label)} - ID: ${camera.deviceId.substring(0, 15)}...`);
    });
  };

  const switchCamera = () => {
    if (availableCameras.length > 1) {
      console.log(`🔄 [${deviceType}] Cambiando cámara...`);
      const newIndex = (currentCameraIndex + 1) % availableCameras.length;
      setCurrentCameraIndex(newIndex);
      console.log(`✅ [${deviceType}] Cambiado a cámara:`, 
        availableCameras[newIndex]?.label || `Cámara ${newIndex + 1}`,
        '- Es trasera:', isRearCamera(availableCameras[newIndex]?.label || ''));
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
