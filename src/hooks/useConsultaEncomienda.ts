
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useConsultaEncomienda() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendConsultaEncomienda = async (customerName: string, customerPhone: string, customerId?: string) => {
    setIsSending(true);
    
    try {
      console.log('Enviando plantilla consulta_encomienda:', { customerName, customerPhone, customerId });
      
      // Crear entrada de notificación
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          customer_id: customerId || null,
          notification_type: 'consulta_encomienda',
          message: `Consulta encomienda para ${customerName}`,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating notification log:', logError);
        throw logError;
      }

      // Enviar plantilla usando la edge function
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: customerPhone,
          message: `Consulta sobre encomienda para ${customerName}`,
          useTemplate: true,
          templateName: 'consulta_encomienda',
          templateLanguage: 'es_CO',
          templateParameters: {
            customerName: customerName
          },
          customerId: customerId
        }
      });

      if (functionError) {
        console.error('Error enviando plantilla:', functionError);
        throw functionError;
      }

      if (responseData?.success) {
        toast({
          title: "✅ Consulta iniciada",
          description: `Se envió la plantilla de consulta a ${customerName}`,
        });
        console.log('Plantilla consulta_encomienda enviada exitosamente:', responseData);
        return true;
      } else {
        throw new Error(responseData?.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('Error enviando consulta_encomienda:', error);
      toast({
        title: "❌ Error al iniciar consulta",
        description: error.message || "Error desconocido",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendConsultaEncomienda,
    isSending
  };
}
