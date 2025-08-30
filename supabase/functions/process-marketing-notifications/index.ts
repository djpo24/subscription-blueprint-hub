
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
    
    console.log('🔄 Processing marketing notifications:', { mode, campaign_name, trip_start_date, trip_end_date });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    if (mode === 'prepare') {
      console.log('📋 PREPARE MODE: Generating marketing notifications...');
      
      if (!campaign_name || !trip_start_date || !trip_end_date || !message_template) {
        throw new Error('campaign_name, trip_start_date, trip_end_date, and message_template are required');
      }

      // 1. Get ALL customers from the system
      console.log('🔍 Fetching all customers...');
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp_number')
        .order('name');

      if (customersError) {
        console.error('❌ Error fetching customers:', customersError);
        throw new Error('Error fetching customers: ' + customersError.message);
      }

      console.log(`📊 Found ${customers?.length || 0} customers in the system`);

      if (!customers || customers.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          prepared: 0,
          skipped: 0,
          message: 'No customers found in system'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let prepared = 0;
      let skipped = 0;

      // 2. Generate personalized messages for EACH customer
      for (const customer of customers) {
        const phone = customer.whatsapp_number || customer.phone;
        
        if (!phone) {
          console.log(`⚠️ Skipping customer ${customer.name} - no phone number`);
          skipped++;
          continue;
        }

        console.log(`📝 Processing customer: ${customer.name} (${phone})`);

        try {
          // 3. Generate personalized message using database function
          const { data: messageResult, error: messageError } = await supabase
            .rpc('generate_marketing_message_with_rates', {
              customer_name_param: customer.name,
              template_param: message_template,
              start_date: trip_start_date,
              end_date: trip_end_date
            });

          if (messageError) {
            console.error('❌ Error generating message for', customer.name, ':', messageError);
            // Use fallback message
            const fallbackMessage = `¡Hola ${customer.name}! Tenemos próximos viajes programados desde ${trip_start_date} hasta ${trip_end_date}. ¡Contáctanos para más información!`;
            
            // 4. Save to marketing_message_log with 'prepared' status
            const { error: logError } = await supabase
              .from('marketing_message_log')
              .insert({
                customer_name: customer.name,
                customer_phone: phone,
                message_content: fallbackMessage,
                status: 'prepared',
                campaign_name: campaign_name,
                created_at: new Date().toISOString()
              });

            if (logError) {
              console.error('❌ Error saving fallback message log:', logError);
              continue;
            }

            prepared++;
            console.log(`✅ Prepared fallback message for ${customer.name}`);
            continue;
          }

          const generatedMessage = messageResult || `¡Hola ${customer.name}! Tenemos próximos viajes programados. ¡Contáctanos para más información!`;
          
          console.log(`✅ Generated message for ${customer.name}: ${generatedMessage.substring(0, 100)}...`);

          // 4. Save to marketing_message_log with 'prepared' status
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
          skipped++;
          continue;
        }
      }

      console.log(`✅ Preparation completed: ${prepared} prepared, ${skipped} skipped`);

      return new Response(JSON.stringify({
        success: true,
        prepared,
        skipped,
        message: `Se prepararon ${prepared} notificaciones para envío${skipped > 0 ? ` (${skipped} clientes sin teléfono)` : ''}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'execute') {
      console.log('🚀 EXECUTE MODE: Sending prepared marketing notifications...');
      
      // Get all prepared notifications
      const { data: preparedNotifications, error: fetchError } = await supabase
        .from('marketing_message_log')
        .select('*')
        .eq('status', 'prepared')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching prepared notifications:', fetchError);
        throw new Error('Error fetching prepared notifications: ' + fetchError.message);
      }

      console.log(`📊 Found ${preparedNotifications?.length || 0} prepared notifications to send`);

      if (!preparedNotifications || preparedNotifications.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          executed: 0,
          failed: 0,
          message: 'No hay notificaciones preparadas para enviar'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let executed = 0;
      let failed = 0;

      // Send each prepared notification
      for (const notification of preparedNotifications) {
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

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Execution completed: ${executed} sent, ${failed} failed`);

      return new Response(JSON.stringify({
        success: true,
        executed,
        failed,
        message: `Se enviaron ${executed} notificaciones exitosamente. ${failed} fallaron.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (mode === 'retry_failed') {
      console.log('🔄 RETRY MODE: Retrying failed marketing notifications...');
      
      // Get all failed notifications
      const { data: failedNotifications, error: fetchError } = await supabase
        .from('marketing_message_log')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching failed notifications:', fetchError);
        throw new Error('Error fetching failed notifications: ' + fetchError.message);
      }

      console.log(`📊 Found ${failedNotifications?.length || 0} failed notifications to retry`);

      if (!failedNotifications || failedNotifications.length === 0) {
        return new Response(JSON.stringify({
          success: true,
          retried: 0,
          failed: 0,
          message: 'No hay notificaciones fallidas para reintentar'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      let retried = 0;
      let stillFailed = 0;

      // Retry each failed notification
      for (const notification of failedNotifications) {
        try {
          console.log(`🔄 Retrying WhatsApp message to ${notification.customer_name}...`);

          const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              phone: notification.customer_phone,
              message: notification.message_content,
              useTemplate: false
            }
          });

          if (whatsappError || !whatsappResult?.success) {
            console.error(`❌ Retry failed for ${notification.customer_name}:`, whatsappError || whatsappResult?.error);
            stillFailed++;
          } else {
            console.log(`✅ Retry successful for ${notification.customer_name}`);
            
            // Update status to sent
            await supabase
              .from('marketing_message_log')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                whatsapp_message_id: whatsappResult.whatsappMessageId || null,
                error_message: null
              })
              .eq('id', notification.id);
            
            retried++;
          }

        } catch (error) {
          console.error(`❌ Error retrying ${notification.customer_name}:`, error);
          stillFailed++;
        }

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log(`✅ Retry completed: ${retried} successful, ${stillFailed} still failed`);

      return new Response(JSON.stringify({
        success: true,
        retried,
        failed: stillFailed,
        message: `Se reenviaron ${retried} notificaciones exitosamente. ${stillFailed} siguen fallidas.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid mode. Use: prepare, execute, or retry_failed');
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
