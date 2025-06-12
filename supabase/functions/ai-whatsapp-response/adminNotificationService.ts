
export async function notifyAdminOfEscalation(
  supabase: any,
  escalationId: string,
  customerName: string,
  originalQuestion: string
): Promise<boolean> {
  try {
    console.log('📢 Notifying admin of escalation:', escalationId);

    // Obtener el administrador principal (primer admin activo)
    const { data: adminUser, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (adminError || !adminUser) {
      console.error('❌ No admin user found:', adminError);
      return false;
    }

    const adminPhone = adminUser.phone || adminUser.whatsapp_number;
    
    if (!adminPhone) {
      console.error('❌ Admin has no phone number configured');
      return false;
    }

    // Generar mensaje de escalación para el administrador
    const escalationMessage = `🚨 PREGUNTA ESCALADA DE CLIENTE

👤 Cliente: ${customerName}
❓ Pregunta: ${originalQuestion}

📞 Esta pregunta fue escalada automáticamente porque el bot no pudo proporcionar una respuesta adecuada.

Para responder, envía tu mensaje y será retransmitido automáticamente al cliente.

ID de escalación: ${escalationId}`;

    // Enviar notificación al administrador
    const { error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        phone: adminPhone,
        message: escalationMessage,
        isEscalation: true,
        escalationId: escalationId
      }
    });

    if (notificationError) {
      console.error('❌ Error sending admin notification:', notificationError);
      return false;
    }

    console.log('✅ Admin notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in notifyAdminOfEscalation:', error);
    return false;
  }
}

export async function handleAdminResponse(
  supabase: any,
  adminPhone: string,
  responseMessage: string
): Promise<boolean> {
  try {
    console.log('📝 Processing admin response from:', adminPhone);

    // Verificar que el remitente sea un administrador
    const { data: adminUser, error: adminError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('role', 'admin')
      .eq('is_active', true)
      .or(`phone.eq.${adminPhone},whatsapp_number.eq.${adminPhone}`)
      .single();

    if (adminError || !adminUser) {
      console.log('❌ Message not from admin user:', adminPhone);
      return false;
    }

    // Buscar escalación pendiente más reciente
    const { data: escalation, error: escalationError } = await supabase
      .from('admin_escalations')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (escalationError || !escalation) {
      console.log('❌ No pending escalation found');
      return false;
    }

    // Actualizar la escalación con la respuesta del admin
    const { error: updateError } = await supabase
      .from('admin_escalations')
      .update({
        admin_response: responseMessage,
        status: 'answered',
        answered_at: new Date().toISOString()
      })
      .eq('id', escalation.id);

    if (updateError) {
      console.error('❌ Error updating escalation:', updateError);
      return false;
    }

    // Enviar respuesta al cliente
    const customerMessage = `${escalation.customer_name ? escalation.customer_name + ', ' : ''}aquí tienes la respuesta de nuestro equipo especializado:

${responseMessage}

¡Espero que esta información te sea útil! 😊`;

    const { error: customerNotificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        phone: escalation.customer_phone,
        message: customerMessage,
        isAdminResponse: true
      }
    });

    if (customerNotificationError) {
      console.error('❌ Error sending customer response:', customerNotificationError);
      return false;
    }

    console.log('✅ Admin response forwarded to customer successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in handleAdminResponse:', error);
    return false;
  }
}
