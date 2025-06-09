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
  
  console.log(`🎯 Optimizing camera for ${deviceType} - Thermal printer barcode scanning`);
  
  // Configuraciones específicas por dispositivo
  if (deviceType === 'iPad') {
    return getIPadOptimizedConstraints(deviceId);
  } else if (deviceType === 'iPhone') {
    return getIPhoneOptimizedConstraints(deviceId);
  } else if (deviceType === 'Android') {
    return getAndroidOptimizedConstraints(deviceId);
  } else {
    return getGenericOptimizedConstraints(deviceId);
  }
}

function getDeviceType(): string {
  if (isIPad()) return 'iPad';
  if (isIPhone()) return 'iPhone';
  if (isAndroid()) return 'Android';
  return 'Generic';
}

function getIPadOptimizedConstraints(deviceId: string): VideoConstraints {
  return {
    deviceId: { exact: deviceId },
    facingMode: 'environment',
    // Configuraciones específicas para iPad - resolución ultra alta
    width: { 
      ideal: 3840, // 4K para iPads más nuevos
      min: 1920,
      max: 4096 
    },
    height: { 
      ideal: 2160, // 4K para iPads más nuevos
      min: 1080,
      max: 2160 
    },
    // iPad específico - configuraciones para códigos de barras térmicos
    focusMode: 'continuous',
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 60, min: 30, max: 60 },
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous',
    // Configuraciones mejoradas para códigos de barras en iPad
    brightness: { ideal: 0.7 }, // Más brillo para iPad
    contrast: { ideal: 1.5 },   // Más contraste para iPad
    saturation: { ideal: 0.8 } // Menos saturación para mejor contraste
  };
}

function getIPhoneOptimizedConstraints(deviceId: string): VideoConstraints {
  return {
    deviceId: { exact: deviceId },
    facingMode: 'environment',
    // Configuraciones específicas para iPhone
    width: { 
      ideal: 2560,
      min: 1280,
      max: 4096 
    },
    height: { 
      ideal: 1440,
      min: 720,
      max: 2160 
    },
    focusMode: 'continuous',
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 60, min: 30, max: 60 },
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous',
    brightness: { ideal: 0.5 },
    contrast: { ideal: 1.2 },
    saturation: { ideal: 1.1 }
  };
}

function getAndroidOptimizedConstraints(deviceId: string): VideoConstraints {
  return {
    deviceId: { exact: deviceId },
    facingMode: 'environment',
    // Configuraciones específicas para Android
    width: { 
      ideal: 1920,
      min: 1280,
      max: 3840 
    },
    height: { 
      ideal: 1080,
      min: 720,
      max: 2160 
    },
    focusMode: 'continuous',
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 30, min: 15, max: 60 },
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous',
    brightness: { ideal: 0.6 },
    contrast: { ideal: 1.3 },
    saturation: { ideal: 1.0 }
  };
}

function getGenericOptimizedConstraints(deviceId: string): VideoConstraints {
  return {
    deviceId: { exact: deviceId },
    facingMode: 'environment',
    width: { 
      ideal: 1920,
      min: 1280,
      max: 2560 
    },
    height: { 
      ideal: 1080,
      min: 720,
      max: 1440 
    },
    focusMode: 'continuous',
    aspectRatio: { ideal: 16/9 },
    frameRate: { ideal: 30, min: 15, max: 60 },
    exposureMode: 'continuous',
    whiteBalanceMode: 'continuous',
    brightness: { ideal: 0.5 },
    contrast: { ideal: 1.2 },
    saturation: { ideal: 1.1 }
  };
}

export function getFallbackVideoConstraints(deviceId: string) {
  const deviceType = getDeviceType();
  
  console.log(`🔄 Using fallback constraints for ${deviceType}`);
  
  if (deviceType === 'iPad') {
    return {
      video: {
        deviceId: { exact: deviceId },
        facingMode: 'environment',
        width: { ideal: 1920, min: 1280, max: 2560 },
        height: { ideal: 1080, min: 720, max: 1440 },
        frameRate: { ideal: 30, min: 15, max: 60 }
      },
      audio: false
    };
  }
  
  return {
    video: {
      deviceId: { exact: deviceId },
      facingMode: 'environment',
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 },
      frameRate: { ideal: 30, min: 15 }
    },
    audio: false
  };
}
