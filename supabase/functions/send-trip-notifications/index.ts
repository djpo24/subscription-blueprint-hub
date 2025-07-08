
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

    // Get notification details with trip information
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
      throw new Error('Notification not found: ' + (notificationError?.message || 'Unknown error'));
    }

    if (notification.status !== 'draft') {
      throw new Error('Notification has already been sent');
    }

    console.log('📋 Notification details:', {
      id: notification.id,
      template_name: notification.template_name,
      template_language: notification.template_language,
      outbound: notification.outbound_trip?.trip_date,
      return: notification.return_trip?.trip_date,
      deadline: notification.deadline_date
    });

    // Validate that we have template configuration
    if (!notification.template_name) {
      console.error('❌ No template name configured');
      throw new Error('Template name is required for WhatsApp notifications');
    }

    // Get all customers
    const { data: customers, error: customersError } = await supabase
      .from('customers')
      .select('id, name, phone, whatsapp_number')
      .order('name');

    if (customersError) {
      console.error('❌ Error fetching customers:', customersError);
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

        console.log(`📱 Processing customer ${customer.name} with phone: ${phone}`);

        // Generate personalized message using the database function
        const { data: messageResult, error: messageError } = await supabase
          .rpc('generate_trip_notification_message', {
            customer_name_param: customer.name,
            template_param: notification.message_template,
            outbound_date: notification.outbound_trip?.trip_date,
            return_date: notification.return_trip?.trip_date,
            deadline_date: notification.deadline_date
          });

        if (messageError) {
          console.error('❌ Error generating message:', messageError);
          throw new Error('Error generating message: ' + messageError.message);
        }

        console.log(`📝 Generated message for ${customer.name}: ${messageResult?.substring(0, 100)}...`);

        // Create log entry
        const { data: logEntry, error: logError } = await supabase
          .from('trip_notification_log')
          .insert({
            trip_notification_id: tripNotificationId,
            customer_id: customer.id,
            customer_phone: phone,
            customer_name: customer.name,
            personalized_message: messageResult,
            template_name: notification.template_name,
            template_language: notification.template_language || 'es_CO',
            status: 'pending'
          })
          .select()
          .single();

        if (logError) {
          console.error('❌ Error creating log entry:', logError);
          continue;
        }

        console.log(`📋 Created log entry for ${customer.name}: ${logEntry.id}`);

        // Send WhatsApp message with template configuration
        const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: logEntry.id,
            phone: phone,
            message: messageResult,
            customerId: customer.id,
            useTemplate: true,
            templateName: notification.template_name,
            templateLanguage: notification.template_language || 'es_CO'
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
          
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'failed',
            error: whatsappError.message
          });
        } else {
          // Update log with success
          await supabase
            .from('trip_notification_log')
            .update({
              status: 'sent',
              whatsapp_message_id: whatsappResult?.whatsappMessageId,
              sent_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);
          
          successCount++;
          console.log(`✅ Successfully sent to ${customer.name} using template ${notification.template_name}`);
          
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'sent',
            template_used: notification.template_name
          });
        }

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
      template_name: notification.template_name,
      template_language: notification.template_language,
      total: successCount + failedCount,
      success: successCount,
      failed: failedCount
    });

    return new Response(JSON.stringify({
      success: true,
      totalSent: successCount + failedCount,
      successCount,
      failedCount,
      templateUsed: notification.template_name,
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
