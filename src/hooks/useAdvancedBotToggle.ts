
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
    // Inicializar desde localStorage como fallback
    const savedAutoResponse = localStorage.getItem('bot-auto-response-enabled');
    const savedManualResponse = localStorage.getItem('bot-manual-response-enabled');
    
    return {
      isAutoResponseEnabled: savedAutoResponse !== null ? JSON.parse(savedAutoResponse) : false,
      isManualResponseEnabled: savedManualResponse !== null ? JSON.parse(savedManualResponse) : true
    };
  });

  // Cargar configuración desde la base de datos al inicializar
  useEffect(() => {
    const loadBotSettings = async () => {
      try {
        console.log('🔍 Loading bot settings from database...');
        
        // Use direct table queries with type assertion since bot_settings isn't in generated types yet
        const { data: autoResponseData, error: autoError } = await (supabase as any)
          .from('bot_settings')
          .select('setting_value')
          .eq('setting_name', 'auto_response_enabled')
          .maybeSingle();
        
        const { data: manualResponseData, error: manualError } = await (supabase as any)
          .from('bot_settings')
          .select('setting_value')
          .eq('setting_name', 'manual_response_enabled')
          .maybeSingle();

        if (autoError || manualError) {
          console.error('Error loading bot settings:', { autoError, manualError });
          return;
        }

        const newStates: BotStates = {
          isAutoResponseEnabled: autoResponseData?.setting_value ?? false,
          isManualResponseEnabled: manualResponseData?.setting_value ?? true
        };

        console.log('✅ Bot settings loaded:', newStates);
        setBotStates(newStates);
        
        // Sincronizar con localStorage
        localStorage.setItem('bot-auto-response-enabled', JSON.stringify(newStates.isAutoResponseEnabled));
        localStorage.setItem('bot-manual-response-enabled', JSON.stringify(newStates.isManualResponseEnabled));
        
      } catch (error) {
        console.error('Error loading bot settings:', error);
      }
    };

    loadBotSettings();
  }, []);

  useEffect(() => {
    // Suscribirse a cambios globales
    const unsubscribe = advancedBotToggleEmitter.subscribe((states) => {
      setBotStates(states);
    });

    return unsubscribe;
  }, []);

  const toggleAutoResponse = async (enabled: boolean) => {
    try {
      console.log('🔄 Updating auto-response setting to:', enabled);
      
      // Use direct table update with upsert and type assertion
      const { error } = await (supabase as any)
        .from('bot_settings')
        .upsert({
          setting_name: 'auto_response_enabled',
          setting_value: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_name'
        });

      if (error) {
        console.error('Error updating auto-response setting:', error);
        throw new Error('Failed to update setting');
      }

      const newStates = { ...botStates, isAutoResponseEnabled: enabled };
      localStorage.setItem('bot-auto-response-enabled', JSON.stringify(enabled));
      setBotStates(newStates);
      advancedBotToggleEmitter.emit(newStates);
      
      console.log('✅ Auto-response setting updated successfully');
    } catch (error) {
      console.error('Error toggling auto-response:', error);
      throw error;
    }
  };

  const toggleManualResponse = async (enabled: boolean) => {
    try {
      console.log('🔄 Updating manual-response setting to:', enabled);
      
      // Use direct table update with upsert and type assertion
      const { error } = await (supabase as any)
        .from('bot_settings')
        .upsert({
          setting_name: 'manual_response_enabled',
          setting_value: enabled,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_name'
        });

      if (error) {
        console.error('Error updating manual-response setting:', error);
        throw new Error('Failed to update setting');
      }

      const newStates = { ...botStates, isManualResponseEnabled: enabled };
      localStorage.setItem('bot-manual-response-enabled', JSON.stringify(enabled));
      setBotStates(newStates);
      advancedBotToggleEmitter.emit(newStates);
      
      console.log('✅ Manual-response setting updated successfully');
    } catch (error) {
      console.error('Error toggling manual-response:', error);
      throw error;
    }
  };

  return {
    ...botStates,
    toggleAutoResponse,
    toggleManualResponse
  };
}
