
import { useRef, useEffect } from 'react';
import type { VideoConstraints } from './types';

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const getOptimalVideoConstraints = (deviceId: string): VideoConstraints => {
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
  };

  const startVideoStream = async (deviceId: string) => {
    try {
      console.log('Starting ultra high-resolution video stream for thermal printer Barcode detection with device:', deviceId);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Get optimal constraints for the device
      const videoConstraints = getOptimalVideoConstraints(deviceId);
      
      console.log('Video constraints for thermal printer Barcode:', videoConstraints);

      const constraints = {
        video: videoConstraints,
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Configurar el elemento video para máxima calidad
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('autoplay', 'true');
        videoRef.current.setAttribute('muted', 'true');
        
        await videoRef.current.play();
        
        // Log de la resolución actual del stream
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        console.log('Actual video settings for thermal printer Barcode:', {
          width: settings.width,
          height: settings.height,
          frameRate: settings.frameRate,
          facingMode: settings.facingMode,
          deviceId: settings.deviceId
        });
        
        console.log('Ultra high-resolution video stream started for thermal printer Barcode detection');
      }

      return stream;
    } catch (err) {
      console.error('Error starting ultra high-resolution video stream:', err);
      
      // Fallback to high resolution if ultra high resolution fails
      try {
        console.log('Trying high resolution fallback for thermal printer Barcode...');
        const fallbackConstraints = {
          video: {
            deviceId: { exact: deviceId },
            facingMode: 'environment',
            width: { ideal: 1920, min: 1280 },
            height: { ideal: 1080, min: 720 },
            frameRate: { ideal: 30, min: 15 }
          },
          audio: false
        };
        
        const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
        streamRef.current = fallbackStream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
          console.log('High resolution fallback video stream started');
        }
        
        return fallbackStream;
      } catch (fallbackErr) {
        console.error('High resolution fallback also failed:', fallbackErr);
        throw fallbackErr;
      }
    }
  };

  const cleanup = () => {
    console.log('Cleaning up video stream...');
    
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
    return cleanup;
  }, []);

  return {
    videoRef,
    streamRef,
    startVideoStream,
    cleanup
  };
}
