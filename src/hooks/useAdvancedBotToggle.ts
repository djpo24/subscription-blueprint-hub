
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
      isAutoResponseEnabled: false, // Desactivado permanentemente
      isManualResponseEnabled: true
    };
  });

  useEffect(() => {
    // Suscribirse a cambios globales
    const unsubscribe = advancedBotToggleEmitter.subscribe((states) => {
      setBotStates(states);
    });

    return unsubscribe;
  }, []);

  const toggleAutoResponse = (enabled: boolean) => {
    // Respuesta automática desactivada permanentemente
    console.log('🚫 Respuesta automática desactivada - No se puede activar');
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
