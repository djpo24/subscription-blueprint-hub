
import { useRef, useCallback } from 'react';

export function useScannerSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Crear el contexto de audio solo cuando sea necesario
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('🎵 AudioContext creado:', audioContextRef.current.state);
    }
    return audioContextRef.current;
  }, []);

  // Función para crear el sonido característico de escáner de supermercado
  const playSuccessBeep = useCallback(async () => {
    try {
      console.log('🔊 Iniciando reproducción de sonido de escáner...');
      const audioContext = getAudioContext();
      
      // Asegurar que el contexto esté activo
      if (audioContext.state === 'suspended') {
        console.log('🎵 Reactivando AudioContext suspendido...');
        await audioContext.resume();
      }
      
      console.log('🎵 AudioContext state:', audioContext.state);
      
      // Crear un oscilador para el sonido de beep
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Conectar los nodos
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar el sonido característico del escáner (frecuencia alta y corta)
      oscillator.frequency.setValueAtTime(2000, audioContext.currentTime); // 2kHz frecuencia alta
      oscillator.type = 'square'; // Onda cuadrada para sonido más "digital"
      
      // Configurar el volumen con fade in/out rápido
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01); // Volume más alto
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.2); // Fade out más largo
      
      // Reproducir el sonido por 200ms (más duración para asegurar que se escuche)
      const startTime = audioContext.currentTime;
      const duration = 0.2;
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      console.log('🔊 Sonido de escáner programado - inicio:', startTime, 'duración:', duration);
      
      // Esperar a que termine el sonido
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('🔊 Sonido de escáner completado');
          resolve();
        }, duration * 1000 + 50); // Agregar 50ms extra
      });
      
    } catch (error) {
      console.error('❌ Error al reproducir sonido de escáner:', error);
    }
  }, [getAudioContext]);

  // Función para crear sonido de error (opcional)
  const playErrorBeep = useCallback(async () => {
    try {
      console.log('🔊 Iniciando reproducción de sonido de error...');
      const audioContext = getAudioContext();
      
      // Asegurar que el contexto esté activo
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sonido más grave para indicar error
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // 400Hz más grave
      oscillator.type = 'sawtooth'; // Onda diente de sierra para sonido más áspero
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.4);
      
      const startTime = audioContext.currentTime;
      const duration = 0.4;
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
      
      console.log('🔊 Sonido de error programado');
      
      // Esperar a que termine el sonido
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('🔊 Sonido de error completado');
          resolve();
        }, duration * 1000 + 50);
      });
      
    } catch (error) {
      console.error('❌ Error al reproducir sonido de error:', error);
    }
  }, [getAudioContext]);

  // Función para limpiar recursos
  const cleanup = useCallback(() => {
    console.log('🎵 Limpiando recursos de audio...');
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
      console.log('🎵 AudioContext cerrado');
    }
  }, []);

  return {
    playSuccessBeep,
    playErrorBeep,
    cleanup
  };
}
