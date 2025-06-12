
import { useState, useEffect } from 'react';

// Crear un event emitter simple para sincronizar el estado
class BotToggleEventEmitter {
  private listeners: Array<(enabled: boolean) => void> = [];

  subscribe(listener: (enabled: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(enabled: boolean) {
    this.listeners.forEach(listener => listener(enabled));
  }
}

const botToggleEmitter = new BotToggleEventEmitter();

export function useGlobalBotToggle() {
  const [isBotEnabled, setIsBotEnabled] = useState(() => {
    const savedState = localStorage.getItem('global-bot-enabled');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  useEffect(() => {
    // Suscribirse a cambios globales
    const unsubscribe = botToggleEmitter.subscribe((enabled) => {
      setIsBotEnabled(enabled);
    });

    return unsubscribe;
  }, []);

  const toggleBot = (enabled: boolean) => {
    localStorage.setItem('global-bot-enabled', JSON.stringify(enabled));
    setIsBotEnabled(enabled);
    
    // Emitir evento para sincronizar todos los componentes
    botToggleEmitter.emit(enabled);
  };

  return {
    isBotEnabled,
    toggleBot
  };
}
