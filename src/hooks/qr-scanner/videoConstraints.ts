
import type { VideoConstraints } from './types';

// Detectar si el dispositivo es un iPad
function isIPad(): boolean {
  return /iPad/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

// Detectar si el dispositivo es un iPhone
function isIPhone(): boolean {
  return /iPhone/.test(navigator.userAgent);
}

// Detectar si es Android
function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

export function getOptimalVideoConstraints(deviceId: string): VideoConstraints {
  const deviceType = getDeviceType();
  
  console.log(`🎯 Configurando cámara TRASERA para ${deviceType} - Máxima resolución para escaneo de códigos de barras`);
  
  // FORZAR facingMode environment para asegurar cámara trasera
  const baseConstraints = {
    deviceId: { exact: deviceId },
    facingMode: { exact: 'environment' }, // FORZAR cámara trasera
    focusMode: 'continuous',
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 60, min: 30, max: 120 },
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous'
  };
  
  // Configuraciones específicas por dispositivo con máxima resolución
  if (deviceType === 'iPad') {
    return getIPadMaxResolutionConstraints(deviceId, baseConstraints);
  } else if (deviceType === 'iPhone') {
    return getIPhoneMaxResolutionConstraints(deviceId, baseConstraints);
  } else if (deviceType === 'Android') {
    return getAndroidMaxResolutionConstraints(deviceId, baseConstraints);
  } else {
    return getGenericMaxResolutionConstraints(deviceId, baseConstraints);
  }
}

function getDeviceType(): string {
  if (isIPad()) return 'iPad';
  if (isIPhone()) return 'iPhone';
  if (isAndroid()) return 'Android';
  return 'Generic';
}

function getIPadMaxResolutionConstraints(deviceId: string, baseConstraints: any): VideoConstraints {
  return {
    ...baseConstraints,
    // Máxima resolución para iPad - hasta 8K si está disponible
    width: { 
      ideal: 7680, // 8K
      min: 3840,   // 4K mínimo
      max: 7680    // 8K máximo
    },
    height: { 
      ideal: 4320, // 8K
      min: 2160,   // 4K mínimo
      max: 4320    // 8K máximo
    },
    brightness: { ideal: 0.7 },
    contrast: { ideal: 1.5 },
    saturation: { ideal: 0.8 }
  };
}

function getIPhoneMaxResolutionConstraints(deviceId: string, baseConstraints: any): VideoConstraints {
  return {
    ...baseConstraints,
    // Máxima resolución para iPhone - hasta 4K
    width: { 
      ideal: 3840, // 4K
      min: 1920,   // Full HD mínimo
      max: 3840    // 4K máximo
    },
    height: { 
      ideal: 2160, // 4K
      min: 1080,   // Full HD mínimo
      max: 2160    // 4K máximo
    },
    brightness: { ideal: 0.5 },
    contrast: { ideal: 1.2 },
    saturation: { ideal: 1.1 }
  };
}

function getAndroidMaxResolutionConstraints(deviceId: string, baseConstraints: any): VideoConstraints {
  return {
    ...baseConstraints,
    // Máxima resolución para Android - hasta 4K
    width: { 
      ideal: 3840, // 4K
      min: 1920,   // Full HD mínimo
      max: 3840    // 4K máximo
    },
    height: { 
      ideal: 2160, // 4K
      min: 1080,   // Full HD mínimo
      max: 2160    // 4K máximo
    },
    brightness: { ideal: 0.6 },
    contrast: { ideal: 1.3 },
    saturation: { ideal: 1.0 }
  };
}

function getGenericMaxResolutionConstraints(deviceId: string, baseConstraints: any): VideoConstraints {
  return {
    ...baseConstraints,
    // Máxima resolución genérica - hasta Full HD
    width: { 
      ideal: 1920, // Full HD
      min: 1280,   // HD mínimo
      max: 1920    // Full HD máximo
    },
    height: { 
      ideal: 1080, // Full HD
      min: 720,    // HD mínimo
      max: 1080    // Full HD máximo
    },
    brightness: { ideal: 0.5 },
    contrast: { ideal: 1.2 },
    saturation: { ideal: 1.1 }
  };
}

export function getFallbackVideoConstraints(deviceId: string) {
  const deviceType = getDeviceType();
  
  console.log(`🔄 Usando configuración de respaldo TRASERA para ${deviceType}`);
  
  // FORZAR cámara trasera también en fallback
  const baseFallback = {
    deviceId: { exact: deviceId },
    facingMode: { exact: 'environment' }, // FORZAR cámara trasera
    frameRate: { ideal: 60, min: 30, max: 120 }
  };
  
  if (deviceType === 'iPad') {
    return {
      video: {
        ...baseFallback,
        width: { ideal: 3840, min: 1920, max: 3840 },
        height: { ideal: 2160, min: 1080, max: 2160 }
      },
      audio: false
    };
  }
  
  return {
    video: {
      ...baseFallback,
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 }
    },
    audio: false
  };
}
