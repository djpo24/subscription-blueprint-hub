
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

    if (!tripNotificationId) {
      console.error('❌ No tripNotificationId provided');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'tripNotificationId is required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Supabase credentials not configured' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get notification details with trip information
    console.log('📋 Fetching notification details...');
    const { data: notification, error: notificationError } = await supabase
      .from('trip_notifications')
      .select(`
        *,
        outbound_trip:outbound_trip_id(trip_date, origin, destination, flight_number),
        return_trip:return_trip_id(trip_date, origin, destination, flight_number)
      `)
      .eq('id', tripNotificationId)
      .single();

    if (notificationError) {
      console.error('❌ Error fetching notification:', notificationError);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Notification not found: ' + notificationError.message 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!notification) {
      console.error('❌ Notification not found');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Notification not found' 
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (notification.status !== 'draft') {
      console.error('❌ Notification already sent:', notification.status);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Notification has already been sent' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📋 Notification details:', {
      id: notification.id,
      template_name: notification.template_name,
      template_language: notification.template_language,
      outbound: notification.outbound_trip?.trip_date,
      return: notification.return_trip?.trip_date,
      deadline: notification.deadline_date
    });

    // Validate template configuration
    if (!notification.template_name) {
      console.error('❌ No template name configured');
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Template name is required for WhatsApp notifications' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all customers
    console.log('👥 Fetching customers...');
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

    if (!customers || customers.length === 0) {
      console.log('⚠️ No customers found');
      return new Response(JSON.stringify({ 
        success: true,
        totalSent: 0,
        successCount: 0,
        failedCount: 0,
        templateUsed: notification.template_name,
        logs: [],
        message: 'No customers found to notify'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`👥 Found ${customers.length} customers to notify`);

    let successCount = 0;
    let failedCount = 0;
    const logs = [];

    // Process each customer
    for (const customer of customers) {
      try {
        const phone = customer.whatsapp_number || customer.phone;
        
        if (!phone) {
          console.log(`⚠️ Skipping customer ${customer.name} - no phone number`);
          continue;
        }

        console.log(`📱 Processing customer ${customer.name} with phone: ${phone}`);

        // Generate personalized message using the database function
        console.log('📝 Generating personalized message...');
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
          failedCount++;
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'failed',
            error: 'Error generating message: ' + messageError.message
          });
          continue;
        }

        console.log(`📝 Generated message for ${customer.name}`);

        // Create log entry BEFORE sending WhatsApp message
        console.log('📋 Creating notification log entry...');
        const { data: logEntry, error: logError } = await supabase
          .from('notification_log')
          .insert({
            package_id: null,
            customer_id: customer.id,
            notification_type: 'trip_notification',
            message: messageResult || 'Generated message',
            status: 'pending'
          })
          .select()
          .single();

        if (logError) {
          console.error('❌ Error creating notification log for', customer.name, ':', logError);
          failedCount++;
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'failed',
            error: 'Error creating log: ' + logError.message
          });
          continue;
        }

        console.log(`📋 Created notification log entry: ${logEntry.id}`);

        // Send WhatsApp message with template configuration
        console.log('📤 Sending WhatsApp message...');
        const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: logEntry.id,
            phone: phone,
            message: messageResult,
            customerId: customer.id,
            useTemplate: true,
            templateName: notification.template_name,
            templateLanguage: notification.template_language || 'es_CO',
            templateParameters: {
              customerName: customer.name,
              outboundDate: notification.outbound_trip?.trip_date || 'N/A',
              returnDate: notification.return_trip?.trip_date || 'N/A', 
              deadlineDate: notification.deadline_date || 'N/A'
            }
          }
        });

        if (whatsappError) {
          console.error(`❌ Failed to send WhatsApp to ${customer.name}:`, whatsappError);
          
          // Update notification log with error
          await supabase
            .from('notification_log')
            .update({
              status: 'failed',
              error_message: whatsappError.message
            })
            .eq('id', logEntry.id);
          
          failedCount++;
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'failed',
            error: whatsappError.message
          });
        } else if (whatsappResult?.error) {
          console.error(`❌ WhatsApp API error for ${customer.name}:`, whatsappResult.error);
          
          // Update notification log with API error
          await supabase
            .from('notification_log')
            .update({
              status: 'failed',
              error_message: whatsappResult.error
            })
            .eq('id', logEntry.id);
          
          failedCount++;
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'failed',
            error: whatsappResult.error
          });
        } else {
          console.log(`✅ Successfully sent to ${customer.name} using template ${notification.template_name}`);
          
          // Update notification log with success
          await supabase
            .from('notification_log')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', logEntry.id);
          
          successCount++;
          logs.push({
            customer: customer.name,
            phone: phone,
            status: 'sent',
            template_used: notification.template_name
          });
        }

      } catch (error) {
        console.error(`❌ Error processing customer ${customer.name}:`, error);
        failedCount++;
        logs.push({
          customer: customer.name,
          phone: customer.phone,
          status: 'failed',
          error: error.message
        });
      }
    }

    // Update notification status
    console.log('📊 Updating notification status...');
    const { error: updateError } = await supabase
      .from('trip_notifications')
      .update({
        status: 'sent',
        total_customers_sent: successCount + failedCount,
        success_count: successCount,
        failed_count: failedCount,
        sent_at: new Date().toISOString()
      })
      .eq('id', tripNotificationId);

    if (updateError) {
      console.error('❌ Error updating notification status:', updateError);
    }

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
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
