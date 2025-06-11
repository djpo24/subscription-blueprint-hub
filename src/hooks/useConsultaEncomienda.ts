
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useConsultaEncomienda() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendConsultaEncomienda = async (customerName: string, customerPhone: string, customerId?: string) => {
    setIsSending(true);
    
    try {
      console.log('🚀 Iniciando envío de plantilla consulta_encomienda:', { 
        customerName, 
        customerPhone, 
        customerId 
      });
      
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
        console.error('❌ Error creating notification log:', logError);
        throw new Error(`Error al crear registro de notificación: ${logError.message}`);
      }

      console.log('✅ Notification log created:', notificationData);

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
        console.error('❌ Error en función de WhatsApp:', functionError);
        
        // Actualizar el log de notificación como fallido
        await supabase
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: functionError.message
          })
          .eq('id', notificationData.id);

        throw new Error(`Error enviando plantilla: ${functionError.message}`);
      }

      console.log('📱 WhatsApp function response:', responseData);

      if (responseData?.success) {
        toast({
          title: "✅ Consulta iniciada",
          description: `Se envió la plantilla de consulta a ${customerName}`,
        });
        console.log('✅ Plantilla consulta_encomienda enviada exitosamente:', responseData);
        return true;
      } else {
        const errorMsg = responseData?.error || 'Error desconocido en respuesta de WhatsApp';
        console.error('❌ Error en respuesta de WhatsApp:', responseData);
        
        // Actualizar el log de notificación como fallido
        await supabase
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: errorMsg
          })
          .eq('id', notificationData.id);

        throw new Error(errorMsg);
      }

    } catch (error: any) {
      console.error('❌ Error general enviando consulta_encomienda:', error);
      
      const userFriendlyMessage = error.message.includes('Token de WhatsApp') 
        ? error.message 
        : `Error al iniciar consulta: ${error.message}`;

      toast({
        title: "❌ Error al iniciar consulta",
        description: userFriendlyMessage,
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
