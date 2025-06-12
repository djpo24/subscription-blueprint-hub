
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface WhatsAppSendRequest {
  phone: string;
  message: string;
  customerId: string | null; // Permitir null para clientes no registrados
  notificationType?: string;
}

export function useWhatsAppSender() {
  const { toast } = useToast();

  const sendWhatsAppMessage = useCallback(async ({ 
    phone, 
    message, 
    customerId, 
    notificationType = 'auto_reply' 
  }: WhatsAppSendRequest): Promise<boolean> => {
    console.log('📤 Sending WhatsApp message to:', {
      phone,
      customerId: customerId || 'UNREGISTERED',
      isRegistered: !!customerId,
      notificationType
    });

    try {
      // Create notification log entry
      console.log('📝 Creating notification log...');
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: null,
          customer_id: customerId, // Puede ser null para clientes no registrados
          notification_type: notificationType,
          message: message,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating notification log:', logError);
        throw new Error('Failed to create notification log');
      }

      console.log('✅ Notification log created:', notificationData.id);

      // Send via WhatsApp
      console.log('📱 Sending via WhatsApp API...');
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: phone,
          message: message,
          customerId: customerId // Puede ser null
        }
      });

      if (functionError) {
        console.error('❌ WhatsApp function error:', functionError);
        throw new Error('WhatsApp function failed');
      }

      if (responseData?.error) {
        console.error('❌ WhatsApp API error:', responseData.error);
        throw new Error(`WhatsApp API error: ${responseData.error}`);
      }

      console.log('✅ WhatsApp message sent successfully to', customerId ? 'registered customer' : 'unregistered customer');
      return true;

    } catch (error) {
      console.error('❌ Error sending WhatsApp message:', error);
      return false;
    }
  }, []);

  return { sendWhatsAppMessage };
}
