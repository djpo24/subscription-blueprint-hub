import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Starting retry failed messages...');
    
    const { campaignId, messageIds } = await req.json();

    if (!campaignId || !messageIds || messageIds.length === 0) {
      throw new Error('Campaign ID y messageIds son requeridos');
    }

    console.log('📋 Retrying messages:', { campaignId, count: messageIds.length });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener los mensajes fallidos
    const { data: failedMessages, error: fetchError } = await supabaseClient
      .from('marketing_message_log')
      .select('*')
      .in('id', messageIds)
      .eq('status', 'failed');

    if (fetchError) {
      console.error('❌ Error fetching failed messages:', fetchError);
      throw new Error('Error al obtener mensajes fallidos');
    }

    if (!failedMessages || failedMessages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No hay mensajes para reintentar',
          successCount: 0,
          failedCount: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📱 Found ${failedMessages.length} messages to retry`);

    let successCount = 0;
    let failedCount = 0;

    // Reintentar envío de cada mensaje
    for (const message of failedMessages) {
      try {
        console.log(`📨 Retrying message to ${message.customer_name} (${message.customer_phone})`);

        // Actualizar estado a pending antes de reintentar
        await supabaseClient
          .from('marketing_message_log')
          .update({
            status: 'pending',
            error_message: null
          })
          .eq('id', message.id);

        // Enviar mensaje por WhatsApp
        const { data: whatsappResponse, error: whatsappError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: message.id,
            phone: message.customer_phone,
            message: message.message_content,
            useTemplate: message.template_name ? true : false,
            templateName: message.template_name || undefined,
            templateLanguage: message.template_language || undefined,
            customerId: null
          }
        });

        if (whatsappError || (whatsappResponse && whatsappResponse.error)) {
          console.error(`❌ WhatsApp error for ${message.customer_name}:`, whatsappError || whatsappResponse.error);
          
          // Actualizar log como fallido nuevamente
          await supabaseClient
            .from('marketing_message_log')
            .update({
              status: 'failed',
              error_message: whatsappError?.message || whatsappResponse?.error || 'Error en reintento'
            })
            .eq('id', message.id);
          
          failedCount++;
          continue;
        }

        // Actualizar log como exitoso
        await supabaseClient
          .from('marketing_message_log')
          .update({
            status: 'sent',
            whatsapp_message_id: whatsappResponse?.whatsappMessageId,
            sent_at: new Date().toISOString(),
            error_message: null
          })
          .eq('id', message.id);

        successCount++;
        console.log(`✅ Message resent successfully to ${message.customer_name}`);

      } catch (error) {
        console.error(`❌ Error processing message for ${message.customer_name}:`, error);
        
        await supabaseClient
          .from('marketing_message_log')
          .update({
            status: 'failed',
            error_message: error.message || 'Error en reintento'
          })
          .eq('id', message.id);
        
        failedCount++;
      }
    }

    // Actualizar estadísticas de la campaña
    const { data: campaign, error: campaignFetchError } = await supabaseClient
      .from('marketing_campaigns')
      .select('success_count, failed_count')
      .eq('id', campaignId)
      .single();

    if (!campaignFetchError && campaign) {
      await supabaseClient
        .from('marketing_campaigns')
        .update({
          success_count: campaign.success_count + successCount,
          failed_count: campaign.failed_count - successCount + (failedCount - messageIds.length)
        })
        .eq('id', campaignId);
    }

    console.log(`✅ Retry completed: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        successCount,
        failedCount,
        message: `Reintento completado: ${successCount} exitosos, ${failedCount} fallidos`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in retry-failed-messages:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
