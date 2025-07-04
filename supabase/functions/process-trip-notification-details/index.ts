import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tripNotificationId, mode } = await req.json();
    
    console.log('🚀 Starting trip notification details processing:', { tripNotificationId, mode });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (mode === 'prepare') {
      return await prepareTripNotifications(supabase, tripNotificationId);
    } else if (mode === 'execute') {
      return await executeTripNotifications(supabase, tripNotificationId);
    } else if (mode === 'retry_failed') {
      return await retryFailedNotifications(supabase, tripNotificationId);
    } else {
      throw new Error('Invalid mode. Use "prepare", "execute", or "retry_failed"');
    }

  } catch (error) {
    console.error('❌ Error in process-trip-notification-details function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function prepareTripNotifications(supabase: any, tripNotificationId: string) {
  console.log('📋 PREPARANDO notificaciones de viaje usando números DIRECTOS del perfil para:', tripNotificationId);

  // Get notification details first
  const { data: notification, error: notificationError } = await supabase
    .from('trip_notifications')
    .select('*')
    .eq('id', tripNotificationId)
    .single();

  if (notificationError) {
    console.error('❌ Error fetching notification:', notificationError);
    throw new Error(`Notification not found: ${notificationError.message}`);
  }

  if (!notification) {
    console.error('❌ Notification is null for ID:', tripNotificationId);
    throw new Error('Notification not found');
  }

  // Get outbound trip details
  const { data: outboundTrip, error: outboundError } = await supabase
    .from('trips')
    .select('trip_date, origin, destination, flight_number')
    .eq('id', notification.outbound_trip_id)
    .single();

  if (outboundError) {
    console.error('❌ Error fetching outbound trip:', outboundError);
    throw new Error(`Outbound trip not found: ${outboundError.message}`);
  }

  // Get return trip details
  const { data: returnTrip, error: returnError } = await supabase
    .from('trips')
    .select('trip_date, origin, destination, flight_number')
    .eq('id', notification.return_trip_id)
    .single();

  if (returnError) {
    console.error('❌ Error fetching return trip:', returnError);
    throw new Error(`Return trip not found: ${returnError.message}`);
  }

  console.log('📋 Notification details:', {
    id: notification.id,
    outbound: outboundTrip?.trip_date,
    return: returnTrip?.trip_date,
    deadline: notification.deadline_date,
    template_name: notification.template_name || 'proximos_viajes',
    template_language: notification.template_language || 'es_CO'
  });

  // Get all customers with fresh data - EXACTAMENTE IGUAL QUE EN ARRIVAL NOTIFICATIONS
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, name, phone, whatsapp_number')
    .order('name');

  if (customersError) {
    throw new Error('Error fetching customers: ' + customersError.message);
  }

  console.log(`👥 Found ${customers?.length || 0} customers to prepare with DIRECT profile numbers`);

  let prepared = 0;

  // Process each customer - REPLICANDO EL FLUJO DE ARRIVAL NOTIFICATIONS
  for (const customer of customers || []) {
    try {
      // Determinar el número de teléfono ACTUAL del perfil - IGUAL QUE ARRIVAL NOTIFICATIONS
      const currentPhoneNumber = customer.whatsapp_number || customer.phone;
      
      if (!currentPhoneNumber || currentPhoneNumber.trim() === '') {
        console.warn(`⚠️ Cliente ${customer.name} (${customer.id}) NO tiene número de teléfono válido en su perfil`);
        continue;
      }

      console.log(`📱 PERFIL DIRECTO: ${customer.name} - Teléfono: "${currentPhoneNumber}"`);

      // Generate personalized message using the database function
      const { data: messageResult, error: messageError } = await supabase
        .rpc('generate_trip_notification_message', {
          customer_name_param: customer.name,
          template_param: notification.message_template,
          outbound_date: outboundTrip.trip_date,
          return_date: returnTrip.trip_date,
          deadline_date: notification.deadline_date
        });

      if (messageError) {
        console.error('❌ Error generating message:', messageError);
        throw new Error('Error generating message: ' + messageError.message);
      }

      // Create or update log entry with prepared status - IGUAL QUE ARRIVAL NOTIFICATIONS
      const { error: logError } = await supabase
        .from('trip_notification_log')
        .upsert({
          trip_notification_id: tripNotificationId,
          customer_id: customer.id,
          customer_phone: currentPhoneNumber, // Número DIRECTO del perfil
          customer_name: customer.name,
          personalized_message: messageResult,
          template_name: notification.template_name || 'proximos_viajes',
          template_language: notification.template_language || 'es_CO',
          status: 'prepared'
        }, {
          onConflict: 'trip_notification_id,customer_id'
        });

      if (logError) {
        console.error('❌ Error creating/updating log entry:', logError);
        continue;
      }

      prepared++;
      console.log(`✅ Prepared notification for ${customer.name} with DIRECT phone: "${currentPhoneNumber}" using template ${notification.template_name || 'proximos_viajes'}`);

    } catch (error) {
      console.error(`❌ Error preparing notification for customer ${customer.name}:`, error);
    }
  }

  console.log('📊 Trip notification preparation completed with DIRECT profile numbers:', { prepared });

  return new Response(JSON.stringify({
    success: true,
    prepared,
    mode: 'prepare'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function executeTripNotifications(supabase: any, tripNotificationId: string) {
  console.log('🚀 EJECUTANDO notificaciones de viaje preparadas con números DIRECTOS del perfil para:', tripNotificationId);

  // Get prepared notifications
  const { data: preparedLogs, error: logsError } = await supabase
    .from('trip_notification_log')
    .select('*')
    .eq('trip_notification_id', tripNotificationId)
    .eq('status', 'prepared');

  if (logsError) {
    throw new Error('Error fetching prepared logs: ' + logsError.message);
  }

  console.log(`📤 Found ${preparedLogs?.length || 0} prepared notifications to execute with DIRECT phone numbers`);

  let executed = 0;
  let failed = 0;

  // Process each prepared notification - IGUAL QUE ARRIVAL NOTIFICATIONS
  for (const log of preparedLogs || []) {
    try {
      console.log(`📱 Sending to ${log.customer_name} at DIRECT phone: "${log.customer_phone}"`);

      // Send WhatsApp message with template configuration - IGUAL QUE ARRIVAL NOTIFICATIONS
      const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: log.id,
          phone: log.customer_phone, // Número DIRECTO del perfil
          message: log.personalized_message,
          customerId: log.customer_id,
          useTemplate: true,
          templateName: log.template_name || 'proximos_viajes',
          templateLanguage: log.template_language || 'es_CO'
        }
      });

      if (whatsappError) {
        // Update log with error
        await supabase
          .from('trip_notification_log')
          .update({
            status: 'failed',
            error_message: whatsappError.message
          })
          .eq('id', log.id);
        
        failed++;
        console.error(`❌ Failed to send to ${log.customer_name} at "${log.customer_phone}": ${whatsappError.message}`);
      } else {
        // Update log with success
        await supabase
          .from('trip_notification_log')
          .update({
            status: 'sent',
            whatsapp_message_id: whatsappResult?.whatsapp_message_id,
            sent_at: new Date().toISOString()
          })
          .eq('id', log.id);
        
        executed++;
        console.log(`✅ Successfully sent to ${log.customer_name} at DIRECT phone "${log.customer_phone}" using template ${log.template_name || 'proximos_viajes'}`);
      }

    } catch (error) {
      failed++;
      console.error(`❌ Error processing notification for ${log.customer_name}:`, error);
      
      // Update log with error
      await supabase
        .from('trip_notification_log')
        .update({
          status: 'failed',
          error_message: error.message
        })
        .eq('id', log.id);
    }
  }

  console.log('📊 Trip notification execution completed with DIRECT profile numbers:', { executed, failed });

  return new Response(JSON.stringify({
    success: true,
    executed,
    failed,
    mode: 'execute'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function retryFailedNotifications(supabase: any, tripNotificationId: string) {
  console.log('🔄 REINTENTANDO notificaciones de viaje fallidas para:', tripNotificationId);

  // Get failed notifications
  const { data: failedLogs, error: logsError } = await supabase
    .from('trip_notification_log')
    .select('*')
    .eq('trip_notification_id', tripNotificationId)
    .eq('status', 'failed');

  if (logsError) {
    throw new Error('Error fetching failed logs: ' + logsError.message);
  }

  console.log(`🔄 Found ${failedLogs?.length || 0} failed notifications to retry`);

  if (!failedLogs || failedLogs.length === 0) {
    return new Response(JSON.stringify({
      success: true,
      retried: 0,
      executed: 0,
      failed: 0,
      mode: 'retry_failed',
      message: 'No hay mensajes fallidos para reintentar'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let executed = 0;
  let failed = 0;

  // Retry each failed notification
  for (const log of failedLogs) {
    try {
      console.log(`🔄 Retrying ${log.customer_name} at phone: "${log.customer_phone}"`);

      // Reset status to prepared before retrying
      await supabase
        .from('trip_notification_log')
        .update({
          status: 'prepared',
          error_message: null
        })
        .eq('id', log.id);

      // Send WhatsApp message with template configuration
      const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: log.id,
          phone: log.customer_phone,
          message: log.personalized_message,
          customerId: log.customer_id,
          useTemplate: true,
          templateName: log.template_name || 'proximos_viajes',
          templateLanguage: log.template_language || 'es_CO'
        }
      });

      if (whatsappError) {
        // Update log with error again
        await supabase
          .from('trip_notification_log')
          .update({
            status: 'failed',
            error_message: `RETRY FAILED: ${whatsappError.message}`
          })
          .eq('id', log.id);
        
        failed++;
        console.error(`❌ Retry failed for ${log.customer_name} at "${log.customer_phone}": ${whatsappError.message}`);
      } else {
        // Update log with success
        await supabase
          .from('trip_notification_log')
          .update({
            status: 'sent',
            whatsapp_message_id: whatsappResult?.whatsapp_message_id,
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', log.id);
        
        executed++;
        console.log(`✅ Successfully retried ${log.customer_name} at phone "${log.customer_phone}"`);
      }

    } catch (error) {
      failed++;
      console.error(`❌ Error retrying notification for ${log.customer_name}:`, error);
      
      // Update log with error
      await supabase
        .from('trip_notification_log')
        .update({
          status: 'failed',
          error_message: `RETRY ERROR: ${error.message}`
        })
        .eq('id', log.id);
    }
  }

  console.log('📊 Trip notification retry completed:', { retried: failedLogs.length, executed, failed });

  return new Response(JSON.stringify({
    success: true,
    retried: failedLogs.length,
    executed,
    failed,
    mode: 'retry_failed'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
