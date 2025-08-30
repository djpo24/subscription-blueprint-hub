
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
      
      // Get notification details (sin JOIN directo)
      const { data: notification, error: notificationError } = await supabase
        .from('trip_notifications')
        .select('*')
        .eq('id', tripNotificationId)
        .single();

      if (notificationError || !notification) {
        console.error('❌ Error fetching notification:', notificationError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Notification not found: ' + (notificationError?.message || 'Not found')
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('📋 Notification found:', {
        id: notification.id,
        template_name: notification.template_name,
        outbound_trip_id: notification.outbound_trip_id,
        return_trip_id: notification.return_trip_id
      });

      // Get outbound trip details separately
      let outboundTrip = null;
      if (notification.outbound_trip_id) {
        const { data: outboundData, error: outboundError } = await supabase
          .from('trips')
          .select('trip_date, origin, destination, flight_number')
          .eq('id', notification.outbound_trip_id)
          .single();

        if (outboundError) {
          console.error('❌ Error fetching outbound trip:', outboundError);
        } else {
          outboundTrip = outboundData;
          console.log('✅ Outbound trip found:', outboundTrip);
        }
      }

      // Get return trip details separately
      let returnTrip = null;
      if (notification.return_trip_id) {
        const { data: returnData, error: returnError } = await supabase
          .from('trips')
          .select('trip_date, origin, destination, flight_number')
          .eq('id', notification.return_trip_id)
          .single();

        if (returnError) {
          console.error('❌ Error fetching return trip:', returnError);
        } else {
          returnTrip = returnData;
          console.log('✅ Return trip found:', returnTrip);
        }
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

        // Generate personalized message using the database function
        const { data: messageResult, error: messageError } = await supabase
          .rpc('generate_trip_notification_message', {
            customer_name_param: customer.name,
            template_param: notification.message_template || '',
            outbound_date: outboundTrip?.trip_date || null,
            return_date: returnTrip?.trip_date || null,
            deadline_date: notification.deadline_date || null
          });

        if (messageError) {
          console.error('❌ Error generating message for', customer.name, ':', messageError);
          continue;
        }

        console.log(`📝 Generated message for ${customer.name}:`, messageResult?.substring(0, 100) + '...');

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

      // Get notification details for template parameters
      const { data: notification } = await supabase
        .from('trip_notifications')
        .select('*')
        .eq('id', tripNotificationId)
        .single();

      // Get trip details for template parameters
      let outboundTrip = null;
      let returnTrip = null;
      
      if (notification?.outbound_trip_id) {
        const { data } = await supabase
          .from('trips')
          .select('trip_date, origin, destination')
          .eq('id', notification.outbound_trip_id)
          .single();
        outboundTrip = data;
      }

      if (notification?.return_trip_id) {
        const { data } = await supabase
          .from('trips')
          .select('trip_date, origin, destination')
          .eq('id', notification.return_trip_id)
          .single();
        returnTrip = data;
      }

      // Send each prepared notification
      for (const notificationLog of preparedNotifications || []) {
        try {
          console.log(`📤 Sending WhatsApp message to ${notificationLog.customer_name}...`);

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
                outboundDate: outboundTrip?.trip_date || 'N/A',
                returnDate: returnTrip?.trip_date || 'N/A',
                deadlineDate: notification?.deadline_date || 'N/A'
              }
            }
          });

          if (whatsappError || !whatsappResult?.success) {
            console.error(`❌ Failed to send to ${notificationLog.customer_name}:`, whatsappError || whatsappResult?.error);
            
            // Update status to failed
            await supabase
              .from('trip_notification_log')
              .update({
                status: 'failed',
                error_message: whatsappError?.message || whatsappResult?.error || 'Unknown error'
              })
              .eq('id', notificationLog.id);
            
            failed++;
          } else {
            console.log(`✅ Successfully sent to ${notificationLog.customer_name}`);
            
            // Update status to sent
            await supabase
              .from('trip_notification_log')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                whatsapp_message_id: whatsappResult.whatsappMessageId || null
              })
              .eq('id', notificationLog.id);
            
            executed++;
          }

        } catch (error) {
          console.error(`❌ Error processing ${notificationLog.customer_name}:`, error);
          
          // Update status to failed
          await supabase
            .from('trip_notification_log')
            .update({
              status: 'failed',
              error_message: error.message
            })
            .eq('id', notificationLog.id);
          
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

      // Get notification and trip details for template parameters
      const { data: notification } = await supabase
        .from('trip_notifications')
        .select('*')
        .eq('id', tripNotificationId)
        .single();

      let outboundTrip = null;
      let returnTrip = null;
      
      if (notification?.outbound_trip_id) {
        const { data } = await supabase
          .from('trips')
          .select('trip_date, origin, destination')
          .eq('id', notification.outbound_trip_id)
          .single();
        outboundTrip = data;
      }

      if (notification?.return_trip_id) {
        const { data } = await supabase
          .from('trips')
          .select('trip_date, origin, destination')
          .eq('id', notification.return_trip_id)
          .single();
        returnTrip = data;
      }

      // Retry each failed notification
      for (const notificationLog of failedNotifications || []) {
        try {
          retried++;
          console.log(`🔄 Retrying WhatsApp message to ${notificationLog.customer_name}...`);
          
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
                outboundDate: outboundTrip?.trip_date || 'N/A',
                returnDate: returnTrip?.trip_date || 'N/A',
                deadlineDate: notification?.deadline_date || 'N/A'
              }
            }
          });

          if (whatsappError || !whatsappResult?.success) {
            console.error(`❌ Retry failed for ${notificationLog.customer_name}:`, whatsappError || whatsappResult?.error);
            failed++;
          } else {
            console.log(`✅ Retry successful for ${notificationLog.customer_name}`);
            
            // Update status to sent
            await supabase
              .from('trip_notification_log')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                whatsapp_message_id: whatsappResult.whatsappMessageId || null,
                error_message: null
              })
              .eq('id', notificationLog.id);
            
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
