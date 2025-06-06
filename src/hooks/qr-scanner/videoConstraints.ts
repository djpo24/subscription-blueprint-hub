
import type { VideoConstraints } from './types';

export function getOptimalVideoConstraints(deviceId: string): VideoConstraints {
  return {
    deviceId: { exact: deviceId },
    facingMode: 'environment',
    // Configuración ultra alta para códigos de barras de impresoras térmicas
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
    // Configuraciones específicas para códigos de barras de impresoras térmicas
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
}

export function getFallbackVideoConstraints(deviceId: string) {
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
