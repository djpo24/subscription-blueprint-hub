
import { useState, useEffect } from 'react';

// Event emitter para sincronizar estados globalmente
class AdvancedBotToggleEventEmitter {
  private listeners: Array<(states: BotStates) => void> = [];

  subscribe(listener: (states: BotStates) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(states: BotStates) {
    this.listeners.forEach(listener => listener(states));
  }
}

const advancedBotToggleEmitter = new AdvancedBotToggleEventEmitter();

export interface BotStates {
  isAutoResponseEnabled: boolean;
  isManualResponseEnabled: boolean;
}

export function useAdvancedBotToggle() {
  const [botStates, setBotStates] = useState<BotStates>(() => {
    return {
      isAutoResponseEnabled: false, // COMPLETAMENTE DESACTIVADO
      isManualResponseEnabled: true // Solo respuesta manual permitida
    };
  });

  useEffect(() => {
    // Suscribirse a cambios globales
    const unsubscribe = advancedBotToggleEmitter.subscribe((states) => {
      setBotStates(states);
    });

    console.log('🚫 Sistema de auto-respuesta COMPLETAMENTE DESACTIVADO');

    return unsubscribe;
  }, []);

  const toggleAutoResponse = (enabled: boolean) => {
    // 🚫 RESPUESTA AUTOMÁTICA COMPLETAMENTE DESACTIVADA
    console.log('🚫 SISTEMA DE AUTO-RESPUESTA COMPLETAMENTE DESACTIVADO - No se puede activar');
    console.log('🚫 El bot NO responderá automáticamente bajo ninguna circunstancia');
    return;
  };

  const toggleManualResponse = (enabled: boolean) => {
    const newStates = { ...botStates, isManualResponseEnabled: enabled };
    localStorage.setItem('bot-manual-response-enabled', JSON.stringify(enabled));
    setBotStates(newStates);
    advancedBotToggleEmitter.emit(newStates);
  };

  return {
    ...botStates,
    toggleAutoResponse,
    toggleManualResponse
  };
}
