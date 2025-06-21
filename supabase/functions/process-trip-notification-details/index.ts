
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
    } else {
      throw new Error('Invalid mode. Use "prepare" or "execute"');
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
  console.log('📋 Preparando notificaciones de viaje para:', tripNotificationId);

  // Get notification details
  const { data: notification, error: notificationError } = await supabase
    .from('trip_notifications')
    .select(`
      *,
      outbound_trip:outbound_trip_id(trip_date, origin, destination, flight_number),
      return_trip:return_trip_id(trip_date, origin, destination, flight_number)
    `)
    .eq('id', tripNotificationId)
    .single();

  if (notificationError || !notification) {
    throw new Error('Notification not found');
  }

  console.log('📋 Notification details:', {
    id: notification.id,
    outbound: notification.outbound_trip?.trip_date,
    return: notification.return_trip?.trip_date,
    deadline: notification.deadline_date
  });

  // Get all customers with fresh data
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('id, name, phone, whatsapp_number')
    .order('name');

  if (customersError) {
    throw new Error('Error fetching customers: ' + customersError.message);
  }

  console.log(`👥 Found ${customers?.length || 0} customers to prepare`);

  let prepared = 0;

  // Process each customer
  for (const customer of customers || []) {
    try {
      const phone = customer.whatsapp_number || customer.phone;
      
      if (!phone) {
        console.log(`⚠️ Skipping customer ${customer.name} - no phone number`);
        continue;
      }

      // Generate personalized message using the database function
      const { data: messageResult, error: messageError } = await supabase
        .rpc('generate_trip_notification_message', {
          customer_name_param: customer.name,
          template_param: notification.message_template,
          outbound_date: notification.outbound_trip.trip_date,
          return_date: notification.return_trip.trip_date,
          deadline_date: notification.deadline_date
        });

      if (messageError) {
        throw new Error('Error generating message: ' + messageError.message);
      }

      // Create or update log entry with prepared status
      const { error: logError } = await supabase
        .from('trip_notification_log')
        .upsert({
          trip_notification_id: tripNotificationId,
          customer_id: customer.id,
          customer_phone: phone,
          customer_name: customer.name,
          personalized_message: messageResult,
          status: 'prepared'
        }, {
          onConflict: 'trip_notification_id,customer_id'
        });

      if (logError) {
        console.error('Error creating/updating log entry:', logError);
        continue;
      }

      prepared++;
      console.log(`✅ Prepared notification for ${customer.name}`);

    } catch (error) {
      console.error(`❌ Error preparing notification for customer ${customer.name}:`, error);
    }
  }

  console.log('📊 Trip notification preparation completed:', { prepared });

  return new Response(JSON.stringify({
    success: true,
    prepared,
    mode: 'prepare'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function executeTripNotifications(supabase: any, tripNotificationId: string) {
  console.log('🚀 Ejecutando notificaciones de viaje preparadas para:', tripNotificationId);

  // Get prepared notifications
  const { data: preparedLogs, error: logsError } = await supabase
    .from('trip_notification_log')
    .select('*')
    .eq('trip_notification_id', tripNotificationId)
    .eq('status', 'prepared');

  if (logsError) {
    throw new Error('Error fetching prepared logs: ' + logsError.message);
  }

  console.log(`📤 Found ${preparedLogs?.length || 0} prepared notifications to execute`);

  let executed = 0;
  let failed = 0;

  // Process each prepared notification
  for (const log of preparedLogs || []) {
    try {
      // Send WhatsApp message
      const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: log.id,
          phone: log.customer_phone,
          message: log.personalized_message,
          customerId: log.customer_id
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
        console.error(`❌ Failed to send to ${log.customer_name}: ${whatsappError.message}`);
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
        console.log(`✅ Successfully sent to ${log.customer_name}`);
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

  console.log('📊 Trip notification execution completed:', { executed, failed });

  return new Response(JSON.stringify({
    success: true,
    executed,
    failed,
    mode: 'execute'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
