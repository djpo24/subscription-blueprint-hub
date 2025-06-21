
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
    const { tripNotificationId } = await req.json();
    
    console.log('🚀 Starting trip notification sending process:', tripNotificationId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (notification.status !== 'draft') {
      throw new Error('Notification has already been sent');
    }

    console.log('📋 Notification details:', {
      id: notification.id,
      outbound: notification.outbound_trip?.trip_date,
      return: notification.return_trip?.trip_date,
      deadline: notification.deadline_date
    });

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, phone, whatsapp_number')
      .order('name');

    if (customersError) {
      throw new Error('Error fetching customers: ' + customersError.message);
    }

    console.log(`👥 Found ${customers?.length || 0} customers to notify`);

    let successCount = 0;
    let failedCount = 0;
    const logs = [];

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

        // Create log entry
        const { data: logEntry, error: logError } = await supabase
          .from('trip_notification_log')
          .insert({
            trip_notification_id: tripNotificationId,
            customer_id: customer.id,
            customer_phone: phone,
            customer_name: customer.name,
            personalized_message: messageResult,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) {
          console.error('Error creating log entry:', logError);
          continue;
        }

        // Send WhatsApp message
        const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: logEntry.id,
            phone: phone,
            message: messageResult,
            customerId: customer.id
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
            .eq('id', logEntry.id);
          
          failedCount++;
          console.error(`❌ Failed to send to ${customer.name}: ${whatsappError.message}`);
        } else {
          // Update log with success
          await supabase
            .from('trip_notification_log')
            .update({
              status: 'sent',
              whatsapp_message_id: whatsappResult?.whatsapp_message_id,
              sent_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);
          
          successCount++;
          console.log(`✅ Successfully sent to ${customer.name}`);
        }

        logs.push({
          customer: customer.name,
          phone: phone,
          status: whatsappError ? 'failed' : 'sent',
          error: whatsappError?.message
        });

      } catch (error) {
        failedCount++;
        console.error(`❌ Error processing customer ${customer.name}:`, error);
        
        logs.push({
          customer: customer.name,
          phone: customer.phone,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update notification status
    await supabase
      .from('trip_notifications')
      .update({
        status: 'sent',
        total_customers_sent: successCount + failedCount,
        success_count: successCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', tripNotificationId);

    console.log('📊 Trip notification sending completed:', {
      total: successCount + failedCount,
      success: successCount,
      failed: failedCount
    });

    return new Response(JSON.stringify({
      success: true,
      totalSent: successCount + failedCount,
      successCount,
      failedCount,
      logs
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in send-trip-notifications function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
