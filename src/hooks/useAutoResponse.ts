
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAIWhatsAppResponse } from './useAIWhatsAppResponse';
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useSentMessages } from './useSentMessages';
import { useToast } from './use-toast';

interface IncomingMessage {
  id: string;
  from_phone: string;
  customer_id?: string;
  message_content: string;
  timestamp: string;
}

export function useAutoResponse() {
  const { toast } = useToast();

  useEffect(() => {
    // 🚫 AUTO-RESPONSE COMPLETAMENTE DESACTIVADO
    console.log('🚫 Auto-response COMPLETAMENTE DESACTIVADO - No se configurará ninguna suscripción');
    console.log('🚫 El bot NO responderá automáticamente a ningún mensaje');
    
    toast({
      title: "🚫 Auto-respuesta desactivada",
      description: "El sistema NO responderá automáticamente a los mensajes",
      variant: "destructive"
    });

    // No configurar ninguna suscripción ni lógica de auto-respuesta
    return;
  }, [toast]);

  return {
    isAutoResponseEnabled: false // Siempre false
  };
}
