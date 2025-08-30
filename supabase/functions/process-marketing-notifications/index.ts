
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
    const { mode, campaign_name, trip_start_date, trip_end_date, message_template } = await req.json();
    
    console.log('🔄 Processing marketing notifications:', { mode });

    if (!mode) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'mode is required' 
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
      console.log('📋 PREPARE MODE: Generating marketing notifications for each customer...');
      
      if (!campaign_name || !trip_start_date || !trip_end_date || !message_template) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'campaign_name, trip_start_date, trip_end_date, and message_template are required for prepare mode' 
        }), {
          status: 400,
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

      console.log(`📊 Found ${customers?.length || 0} customers to process`);

      let prepared = 0;
      let skipped = 0;

      // Generate personalized messages for each customer
      for (const customer of customers || []) {
        const phone = customer.whatsapp_number || customer.phone;
        
        if (!phone) {
          console.log(`⚠️ Skipping customer ${customer.name} - no phone number`);
          skipped++;
          continue;
        }

        console.log(`📝 Processing customer: ${customer.name} (${phone})`);

        try {
          // Generate personalized message using the database function
          const { data: messageResult, error: messageError } = await supabase
            .rpc('generate_marketing_message_with_rates', {
              customer_name_param: customer.name,
              template_param: message_template,
              start_date: trip_start_date,
              end_date: trip_end_date
            });

          if (messageError) {
            console.error('❌ Error generating message for', customer.name, ':', messageError);
            continue;
          }

          const generatedMessage = messageResult || `Hola ${customer.name}! Tenemos próximos viajes programados. ¡Contáctanos para más información!`;
          
          console.log(`✅ Generated message for ${customer.name} (${generatedMessage.length} chars)`);

          // Create log entry in marketing_message_log
          const { error: logError } = await supabase
            .from('marketing_message_log')
            .insert({
              customer_name: customer.name,
              customer_phone: phone,
              message_content: generatedMessage,
              status: 'prepared',
              campaign_name: campaign_name,
              created_at: new Date().toISOString()
            });

          if (logError) {
            console.error('❌ Error creating marketing message log for', customer.name, ':', logError);
            continue;
          }

          prepared++;
          console.log(`✅ Successfully prepared message for ${customer.name}`);

        } catch (error) {
          console.error(`❌ Error processing customer ${customer.name}:`, error);
          continue;
        }
      }

      console.log(`✅ Preparation completed: ${prepared} prepared, ${skipped} skipped`);

      return new Response(JSON.stringify({
        success: true,
        prepared,
        skipped
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'execute') {
      console.log('🚀 EXECUTE MODE: Sending prepared marketing notifications...');
      
      // Get prepared notifications
      const { data: preparedNotifications, error: fetchError } = await supabase
        .from('marketing_message_log')
        .select('*')
        .eq('status', 'prepared')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching prepared notifications:', fetchError);
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Error fetching prepared notifications: ' + fetchError.message 
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log(`📊 Found ${preparedNotifications?.length || 0} prepared notifications to send`);

      let executed = 0;
      let failed = 0;

      // Send each prepared notification
      for (const notification of preparedNotifications || []) {
        try {
          console.log(`📤 Sending WhatsApp message to ${notification.customer_name} (${notification.customer_phone})...`);

          const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              phone: notification.customer_phone,
              message: notification.message_content,
              useTemplate: false
            }
          });

          if (whatsappError || !whatsappResult?.success) {
            console.error(`❌ Failed to send to ${notification.customer_name}:`, whatsappError || whatsappResult?.error);
            
            // Update status to failed
            await supabase
              .from('marketing_message_log')
              .update({
                status: 'failed',
                error_message: whatsappError?.message || whatsappResult?.error || 'Unknown error'
              })
              .eq('id', notification.id);
            
            failed++;
          } else {
            console.log(`✅ Successfully sent to ${notification.customer_name}`);
            
            // Update status to sent
            await supabase
              .from('marketing_message_log')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                whatsapp_message_id: whatsappResult.whatsappMessageId || null
              })
              .eq('id', notification.id);
            
            executed++;
          }

        } catch (error) {
          console.error(`❌ Error processing ${notification.customer_name}:`, error);
          
          // Update status to failed
          await supabase
            .from('marketing_message_log')
            .update({
              status: 'failed',
              error_message: error.message || 'Unknown error occurred'
            })
            .eq('id', notification.id);
          
          failed++;
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Execution completed: ${executed} sent, ${failed} failed`);

      return new Response(JSON.stringify({
        success: true,
        executed,
        failed
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Invalid mode. Use: prepare or execute' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('❌ Error in process-marketing-notifications function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message || 'Unknown error occurred',
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
