
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useGlobalBotToggle() {
  const [isBotEnabled, setIsBotEnabled] = useState(true); // Bot siempre habilitado
  const { toast } = useToast();

  // Sistema de escalación completamente desactivado
  // El bot permanece siempre activo y nunca escala
  
  const toggleBot = (enabled: boolean) => {
    console.log('🚫 Sistema de escalación desactivado - Bot siempre activo');
    setIsBotEnabled(true); // Forzar siempre a true
    
    if (!enabled) {
      toast({
        title: "⚠️ Sistema de escalación desactivado",
        description: "El bot permanece activo. Sistema de escalación completamente deshabilitado.",
        variant: "destructive"
      });
    }
  };

  return {
    isBotEnabled: true, // Siempre true
    toggleBot
  };
}
