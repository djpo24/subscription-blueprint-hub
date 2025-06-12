
import { useState, useEffect } from 'react';

export function useGlobalBotToggle() {
  const [isBotEnabled, setIsBotEnabled] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem('global-bot-enabled');
    if (savedState !== null) {
      setIsBotEnabled(JSON.parse(savedState));
    }
  }, []);

  const toggleBot = (enabled: boolean) => {
    localStorage.setItem('global-bot-enabled', JSON.stringify(enabled));
    setIsBotEnabled(enabled);
  };

  return {
    isBotEnabled,
    toggleBot
  };
}
