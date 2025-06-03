
import { supabase } from '@/integrations/supabase/client';

interface SendWhatsAppMessageParams {
  selectedPhone: string;
  customerId: string | null;
  message: string;
  imageUrl?: string;
  sendManualNotification: (data: any) => Promise<any>;
}

export async function sendWhatsAppMessage({
  selectedPhone,
  customerId,
  message,
  imageUrl,
  sendManualNotification
}: SendWhatsAppMessageParams) {
  console.log('📱 Sending WhatsApp message...');
  
  if (customerId) {
    // Cliente registrado - usar sendManualNotification
    console.log('👤 Sending to registered customer');
    await sendManualNotification({
      customerId: customerId,
      packageId: '',
      message: message,
      phone: selectedPhone,
      imageUrl: imageUrl
    });
  } else {
    // Cliente no registrado - envío directo
    console.log('👤 Sending to unregistered customer');
    
    // Crear entrada de notificación
    const { data: notificationData, error: logError } = await supabase
      .from('notification_log')
      .insert({
        package_id: null,
        customer_id: null,
        notification_type: 'manual_reply',
        message: message,
        status: 'pending'
      })
      .select()
      .single();

    if (logError) {
      console.error('❌ Error creating notification log:', logError);
      throw new Error('Error al crear registro de notificación');
    }

    // Enviar a WhatsApp
    const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        notificationId: notificationData.id,
        phone: selectedPhone,
        message: message,
        imageUrl: imageUrl
      }
    });

    if (functionError) {
      console.error('❌ WhatsApp function error:', functionError);
      
      if (functionError.message && functionError.message.includes('Session has expired')) {
        throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
      }
      
      throw new Error('Error al enviar mensaje por WhatsApp: ' + functionError.message);
    }

    if (responseData && responseData.error) {
      console.error('❌ WhatsApp API error:', responseData.error);
      if (responseData.error.includes('Session has expired') || 
          responseData.error.includes('access token') ||
          responseData.error.includes('token')) {
        throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
      }
      throw new Error('Error de WhatsApp: ' + responseData.error);
    }

    console.log('✅ WhatsApp message sent successfully');
  }
}
