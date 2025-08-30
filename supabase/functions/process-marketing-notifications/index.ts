
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Process Marketing Notifications started');
    
    const { mode, campaign_name, trip_start_date, trip_end_date, message_template } = await req.json();
    console.log('📋 Request data:', { mode, campaign_name, trip_start_date, trip_end_date });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (mode === 'create') {
      return await handleCreateNotifications(supabase, campaign_name, trip_start_date, trip_end_date, message_template);
    } else if (mode === 'prepare') {
      return await handlePrepareNotifications(supabase);
    } else if (mode === 'execute') {
      return await handleExecuteNotifications(supabase);
    } else {
      throw new Error('Modo no válido');
    }

  } catch (error) {
    console.error('❌ Error in process-marketing-notifications:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function handleCreateNotifications(supabase: any, campaign_name: string, trip_start_date: string, trip_end_date: string, message_template: string) {
  console.log('📦 Creating marketing notifications for all customers...');

  // 1. Obtener todos los clientes activos
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, name, phone, whatsapp_number')
    .order('name');

  if (customersError) {
    console.error('❌ Error fetching customers:', customersError);
    throw new Error('Error al obtener clientes: ' + customersError.message);
  }

  console.log(`👥 Found ${customers?.length || 0} customers`);

  let createdCount = 0;
  let skippedCount = 0;
  const notifications = [];

  for (const customer of customers || []) {
    // Verificar si el cliente tiene número de teléfono
    const phoneNumber = customer.whatsapp_number || customer.phone;
    
    if (!phoneNumber || phoneNumber.trim() === '') {
      console.log(`⚠️ Skipping customer ${customer.name} - no phone number`);
      skippedCount++;
      continue;
    }

    // Crear notificación pendiente
    const notificationData = {
      campaign_name,
      customer_name: customer.name,
      customer_phone: phoneNumber,
      message_content: message_template, // Plantilla sin procesar
      status: 'pending'
    };

    notifications.push(notificationData);
    createdCount++;
  }

  // Insertar notificaciones en batch
  if (notifications.length > 0) {
    const { error: insertError } = await supabase
      .from('marketing_message_log')
      .insert(notifications);

    if (insertError) {
      console.error('❌ Error inserting notifications:', insertError);
      throw new Error('Error al crear notificaciones: ' + insertError.message);
    }
  }

  console.log(`✅ Created ${createdCount} notifications, skipped ${skippedCount} customers without phone`);

  return new Response(
    JSON.stringify({
      success: true,
      created: createdCount,
      skipped: skippedCount,
      message: `Se cargaron ${createdCount} clientes para la campaña${skippedCount > 0 ? ` (${skippedCount} sin teléfono)` : ''}`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handlePrepareNotifications(supabase: any) {
  console.log('🔄 Preparing marketing notifications...');

  // Obtener notificaciones pendientes
  const { data: pendingNotifications, error: fetchError } = await supabase
    .from('marketing_message_log')
    .select('*')
    .eq('status', 'pending')
    .order('created_at');

  if (fetchError) {
    console.error('❌ Error fetching pending notifications:', fetchError);
    throw new Error('Error al obtener notificaciones pendientes');
  }

  console.log(`📝 Found ${pendingNotifications?.length || 0} pending notifications`);

  let preparedCount = 0;
  let errorCount = 0;

  for (const notification of pendingNotifications || []) {
    try {
      console.log(`📝 Processing notification for: ${notification.customer_name}`);

      // Obtener campaña de ejemplo para fechas (usando la primera notificación)
      const startDate = '2025-09-01'; // Usar las fechas de la campaña
      const endDate = '2025-09-30';

      // Generar mensaje personalizado usando la función RPC
      const { data: personalizedMessage, error: rpcError } = await supabase
        .rpc('generate_marketing_message_with_rates', {
          customer_name_param: notification.customer_name,
          template_param: notification.message_content,
          start_date: startDate,
          end_date: endDate
        });

      if (rpcError) {
        console.error('❌ Error generating message for customer:', notification.customer_name, rpcError);
        await supabase
          .from('marketing_message_log')
          .update({
            status: 'failed',
            error_message: `Error generando mensaje: ${rpcError.message}`
          })
          .eq('id', notification.id);
        
        errorCount++;
        continue;
      }

      console.log(`✅ Generated message for ${notification.customer_name}`);

      // Actualizar notificación con mensaje personalizado y estado prepared
      const { error: updateError } = await supabase
        .from('marketing_message_log')
        .update({
          message_content: personalizedMessage,
          status: 'prepared'
        })
        .eq('id', notification.id);

      if (updateError) {
        console.error('❌ Error updating notification:', updateError);
        errorCount++;
        continue;
      }

      preparedCount++;

    } catch (error) {
      console.error('❌ Error processing notification:', error);
      errorCount++;
    }
  }

  console.log(`✅ Prepared ${preparedCount} notifications, ${errorCount} errors`);

  return new Response(
    JSON.stringify({
      success: true,
      prepared: preparedCount,
      errors: errorCount,
      message: `Se prepararon ${preparedCount} notificaciones${errorCount > 0 ? ` (${errorCount} con errores)` : ''}`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}

async function handleExecuteNotifications(supabase: any) {
  console.log('🚀 Executing marketing notifications...');

  // Obtener notificaciones preparadas
  const { data: preparedNotifications, error: fetchError } = await supabase
    .from('marketing_message_log')
    .select('*')
    .eq('status', 'prepared')
    .order('created_at');

  if (fetchError) {
    console.error('❌ Error fetching prepared notifications:', fetchError);
    throw new Error('Error al obtener notificaciones preparadas');
  }

  console.log(`📤 Found ${preparedNotifications?.length || 0} prepared notifications`);

  let executedCount = 0;
  let failedCount = 0;

  for (const notification of preparedNotifications || []) {
    try {
      console.log(`📤 Sending notification to: ${notification.customer_name} (${notification.customer_phone})`);

      // Enviar mensaje por WhatsApp
      const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          phone: notification.customer_phone,
          message: notification.message_content,
          customerId: null // Para marketing no necesitamos customer_id específico
        }
      });

      if (whatsappError || (whatsappResponse && whatsappResponse.error)) {
        const errorMsg = whatsappError?.message || whatsappResponse?.error || 'Error desconocido en WhatsApp';
        console.error('❌ WhatsApp error for:', notification.customer_name, errorMsg);
        
        await supabase
          .from('marketing_message_log')
          .update({
            status: 'failed',
            error_message: errorMsg,
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id);
        
        failedCount++;
        continue;
      }

      console.log(`✅ Successfully sent to: ${notification.customer_name}`);

      // Actualizar como enviado
      const { error: updateError } = await supabase
        .from('marketing_message_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          whatsapp_message_id: whatsappResponse?.messageId || null
        })
        .eq('id', notification.id);

      if (updateError) {
        console.error('❌ Error updating sent notification:', updateError);
      }

      executedCount++;

    } catch (error) {
      console.error('❌ Error executing notification:', error);
      
      await supabase
        .from('marketing_message_log')
        .update({
          status: 'failed',
          error_message: error.message,
          sent_at: new Date().toISOString()
        })
        .eq('id', notification.id);
      
      failedCount++;
    }
  }

  console.log(`✅ Executed ${executedCount} notifications, ${failedCount} failed`);

  return new Response(
    JSON.stringify({
      success: true,
      executed: executedCount,
      failed: failedCount,
      message: `Se enviaron ${executedCount} notificaciones exitosamente${failedCount > 0 ? `, ${failedCount} fallaron` : ''}`
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
