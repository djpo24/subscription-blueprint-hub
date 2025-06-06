
import { useRef, useCallback } from 'react';

export function useScannerSounds() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Crear el contexto de audio solo cuando sea necesario
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Función para crear el sonido característico de escáner de supermercado
  const playSuccessBeep = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      
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
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01); // Fade in rápido
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15); // Fade out
      
      // Reproducir el sonido por 150ms (típico de escáneres)
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      
      console.log('🔊 Sonido de escáner reproducido exitosamente');
    } catch (error) {
      console.error('❌ Error al reproducir sonido de escáner:', error);
    }
  }, [getAudioContext]);

  // Función para crear sonido de error (opcional)
  const playErrorBeep = useCallback(async () => {
    try {
      const audioContext = getAudioContext();
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sonido más grave para indicar error
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // 400Hz más grave
      oscillator.type = 'sawtooth'; // Onda diente de sierra para sonido más áspero
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔊 Sonido de error reproducido');
    } catch (error) {
      console.error('❌ Error al reproducir sonido de error:', error);
    }
  }, [getAudioContext]);

  // Función para limpiar recursos
  const cleanup = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  return {
    playSuccessBeep,
    playErrorBeep,
    cleanup
  };
}
