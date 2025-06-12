
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
    const savedAutoResponse = localStorage.getItem('bot-auto-response-enabled');
    const savedManualResponse = localStorage.getItem('bot-manual-response-enabled');
    
    return {
      isAutoResponseEnabled: savedAutoResponse !== null ? JSON.parse(savedAutoResponse) : false,
      isManualResponseEnabled: savedManualResponse !== null ? JSON.parse(savedManualResponse) : true
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
    const newStates = { ...botStates, isAutoResponseEnabled: enabled };
    localStorage.setItem('bot-auto-response-enabled', JSON.stringify(enabled));
    setBotStates(newStates);
    advancedBotToggleEmitter.emit(newStates);
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
