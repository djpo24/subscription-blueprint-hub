
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
    
    console.log('🔄 Processing trip notification details:', { tripNotificationId, mode });

    if (!tripNotificationId || !mode) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'tripNotificationId and mode are required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Supabase credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (mode === 'prepare') {
      console.log('📋 PREPARE MODE: Generating individual trip notification messages...');
      
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
        console.error('❌ Error fetching notification:', notificationError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Notification not found' 
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get all customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp_number')
        .order('name');

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Error fetching customers: ' + customersError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let prepared = 0;

      // Generate personalized messages for each customer
      for (const customer of customers || []) {
        const phone = customer.whatsapp_number || customer.phone;
        
        if (!phone) {
          console.log(`⚠️ Skipping customer ${customer.name} - no phone number`);
          continue;
        }

        // Generate personalized message
        const { data: messageResult, error: messageError } = await supabase
          .rpc('generate_trip_notification_message', {
            customer_name_param: customer.name,
            template_param: notification.message_template || '',
            outbound_date: notification.outbound_trip?.trip_date || null,
            return_date: notification.return_trip?.trip_date || null,
            deadline_date: notification.deadline_date || null
          });

        if (messageError) {
          console.error('❌ Error generating message for', customer.name, ':', messageError);
          continue;
        }

        // Create/update log entry
        const { error: logError } = await supabase
          .from('trip_notification_log')
          .upsert({
            trip_notification_id: tripNotificationId,
            customer_id: customer.id,
            customer_name: customer.name,
            customer_phone: phone,
            personalized_message: messageResult || 'Generated message',
            template_name: notification.template_name,
            template_language: notification.template_language || 'es_CO',
            status: 'prepared'
          }, {
            onConflict: 'trip_notification_id,customer_id',
            ignoreDuplicates: false
          });

        if (logError) {
          console.error('❌ Error creating trip notification log for', customer.name, ':', logError);
          continue;
        }

        prepared++;
      }

      console.log(`✅ Prepared ${prepared} trip notifications`);

      return new Response(JSON.stringify({
        success: true,
        prepared
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'execute') {
      console.log('🚀 EXECUTE MODE: Sending prepared trip notifications...');
      
      // Get prepared notifications
      const { data: preparedNotifications, error: fetchError } = await supabase
        .from('trip_notification_log')
        .select('*')
        .eq('trip_notification_id', tripNotificationId)
        .eq('status', 'prepared');

      if (fetchError) {
        console.error('❌ Error fetching prepared notifications:', fetchError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Error fetching prepared notifications' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let executed = 0;
      let failed = 0;

      // Send each prepared notification
      for (const notificationLog of preparedNotifications || []) {
        try {
          const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: notificationLog.id,
              phone: notificationLog.customer_phone,
              message: notificationLog.personalized_message,
              customerId: notificationLog.customer_id,
              useTemplate: true,
              templateName: notificationLog.template_name,
              templateLanguage: notificationLog.template_language || 'es_CO',
              templateParameters: {
                customerName: notificationLog.customer_name,
                outboundDate: new Date().toISOString().split('T')[0], // This should come from notification
                returnDate: new Date().toISOString().split('T')[0], // This should come from notification
                deadlineDate: new Date().toISOString().split('T')[0] // This should come from notification
              }
            }
          });

          if (whatsappError || !whatsappResult?.success) {
            console.error(`❌ Failed to send to ${notificationLog.customer_name}:`, whatsappError);
            failed++;
          } else {
            console.log(`✅ Successfully sent to ${notificationLog.customer_name}`);
            executed++;
          }

        } catch (error) {
          console.error(`❌ Error processing ${notificationLog.customer_name}:`, error);
          failed++;
        }
      }

      console.log(`✅ Execution completed: ${executed} sent, ${failed} failed`);

      return new Response(JSON.stringify({
        success: true,
        executed,
        failed
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'retry_failed') {
      console.log('🔄 RETRY MODE: Retrying failed trip notifications...');
      
      // Get failed notifications
      const { data: failedNotifications, error: fetchError } = await supabase
        .from('trip_notification_log')
        .select('*')
        .eq('trip_notification_id', tripNotificationId)
        .eq('status', 'failed');

      if (fetchError) {
        console.error('❌ Error fetching failed notifications:', fetchError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Error fetching failed notifications' 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let retried = 0;
      let executed = 0;
      let failed = 0;

      // Retry each failed notification
      for (const notificationLog of failedNotifications || []) {
        try {
          retried++;
          
          const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: notificationLog.id,
              phone: notificationLog.customer_phone,
              message: notificationLog.personalized_message,
              customerId: notificationLog.customer_id,
              useTemplate: true,
              templateName: notificationLog.template_name,
              templateLanguage: notificationLog.template_language || 'es_CO',
              templateParameters: {
                customerName: notificationLog.customer_name,
                outboundDate: new Date().toISOString().split('T')[0],
                returnDate: new Date().toISOString().split('T')[0],
                deadlineDate: new Date().toISOString().split('T')[0]
              }
            }
          });

          if (whatsappError || !whatsappResult?.success) {
            console.error(`❌ Retry failed for ${notificationLog.customer_name}:`, whatsappError);
            failed++;
          } else {
            console.log(`✅ Retry successful for ${notificationLog.customer_name}`);
            executed++;
          }

        } catch (error) {
          console.error(`❌ Error retrying ${notificationLog.customer_name}:`, error);
          failed++;
        }
      }

      console.log(`✅ Retry completed: ${retried} retried, ${executed} successful, ${failed} failed`);

      return new Response(JSON.stringify({
        success: true,
        retried,
        executed,
        failed
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid mode. Use: prepare, execute, or retry_failed' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in process-trip-notification-details function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
