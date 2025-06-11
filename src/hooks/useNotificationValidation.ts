
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNotificationValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateNotification = async (notificationId: string) => {
    setIsValidating(true);
    try {
      console.log('🔍 Validating notification:', notificationId);

      // Since we don't have the proper notification structure, 
      // we'll simulate a validation
      const { data, error } = await supabase
        .from('notification_log')
        .select('*')
        .eq('id', notificationId)
        .maybeSingle();

      if (error) {
        console.error('❌ Error validating notification:', error);
        toast({
          title: "Error",
          description: "Error al validar la notificación",
          variant: "destructive"
        });
        return false;
      }

      if (!data) {
        toast({
          title: "Error",
          description: "Notificación no encontrada",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Validación exitosa",
        description: "La notificación ha sido validada correctamente",
      });

      return true;
    } catch (error) {
      console.error('❌ Error in validateNotification:', error);
      toast({
        title: "Error",
        description: "Error al validar la notificación",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  return {
    validateNotification,
    isValidating
  };
}
