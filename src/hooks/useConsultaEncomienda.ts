
import { useState } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useConsultaEncomienda() {
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const sendConsultaEncomienda = async (customerName: string, customerPhone: string, customerId?: string) => {
    setIsSending(true);
    
    try {
      console.log('🚀 [CONSULTA] Iniciando envío de plantilla consulta_encomienda:', { 
        customerName, 
        customerPhone, 
        customerId 
      });
      
      // Paso 1: Crear entrada de notificación
      console.log('📝 [CONSULTA] Paso 1: Creando entrada de notificación...');
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
        console.error('❌ [CONSULTA] Error creating notification log:', logError);
        throw new Error(`Error al crear registro de notificación: ${logError.message}`);
      }

      console.log('✅ [CONSULTA] Notification log created successfully:', notificationData);

      // Paso 2: Enviar plantilla usando la edge function
      console.log('📱 [CONSULTA] Paso 2: Enviando plantilla a WhatsApp...');
      const requestBody = {
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
      };
      
      console.log('📊 [CONSULTA] Request body:', requestBody);
      
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: requestBody
      });

      console.log('📱 [CONSULTA] Raw WhatsApp function response:', responseData);
      console.log('⚠️ [CONSULTA] Function error (if any):', functionError);

      if (functionError) {
        console.error('❌ [CONSULTA] Error en función de WhatsApp:', functionError);
        
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

      // Verificar respuesta de la función
      if (responseData?.success) {
        console.log('✅ [CONSULTA] Plantilla enviada exitosamente:', responseData);
        toast({
          title: "✅ Consulta iniciada",
          description: `Se envió la plantilla de consulta a ${customerName}`,
        });
        return true;
      } else {
        const errorMsg = responseData?.error || 'Error desconocido en respuesta de WhatsApp';
        console.error('❌ [CONSULTA] Error en respuesta de WhatsApp:', {
          responseData,
          errorMsg
        });
        
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
      console.error('❌ [CONSULTA] Error general enviando consulta_encomienda:', error);
      console.error('❌ [CONSULTA] Error stack:', error.stack);
      
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
