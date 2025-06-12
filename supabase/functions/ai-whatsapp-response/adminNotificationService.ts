
export async function notifyAdminOfEscalation(
  supabase: any,
  escalationId: string,
  customerName: string,
  originalQuestion: string
): Promise<boolean> {
  try {
    console.log('📱 NOTIFICANDO AL ADMINISTRADOR - Escalación crítica');
    
    // Número del administrador Didier Pedroza
    const adminPhone = '+573014940399';
    
    const escalationMessage = `🚨 ESCALACIÓN AUTOMÁTICA - ATENCIÓN REQUERIDA

👤 Cliente: ${customerName}
❓ Pregunta: "${originalQuestion}"

⚠️ SARA no pudo proporcionar información específica.

📱 RESPONDE DIRECTAMENTE A ESTE MENSAJE y será enviado automáticamente al cliente.

⚡ Tu respuesta NO generará respuestas automáticas adicionales.

🔄 Responde solo UNA VEZ por escalación.

⏰ Respuesta requerida lo antes posible.

ID: ${escalationId}`;

    console.log('📤 Enviando notificación al admin:', adminPhone);

    const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        phone: adminPhone,
        message: escalationMessage,
        isEscalationNotification: true
      }
    });

    if (notificationError) {
      console.error('❌ Error enviando notificación al admin:', notificationError);
      return false;
    }

    console.log('✅ Notificación enviada exitosamente al administrador');
    return true;
  } catch (error) {
    console.error('❌ Error crítico en notifyAdminOfEscalation:', error);
    return false;
  }
}
