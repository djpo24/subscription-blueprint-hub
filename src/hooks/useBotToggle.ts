
import { useState, useEffect } from 'react';

export function useBotToggle(customerPhone: string) {
  const [isBotEnabled, setIsBotEnabled] = useState(true);

  useEffect(() => {
    const botKey = `bot-enabled-${customerPhone}`;
    const savedState = localStorage.getItem(botKey);
    if (savedState !== null) {
      setIsBotEnabled(JSON.parse(savedState));
    }
  }, [customerPhone]);

  const toggleBot = (enabled: boolean) => {
    const botKey = `bot-enabled-${customerPhone}`;
    localStorage.setItem(botKey, JSON.stringify(enabled));
    setIsBotEnabled(enabled);
  };

  return {
    isBotEnabled,
    toggleBot
  };
}
