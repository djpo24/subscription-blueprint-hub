
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
    console.log('🚀 Starting marketing campaign...');
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener configuración de marketing
    const { data: settings, error: settingsError } = await supabaseClient
      .from('marketing_settings')
      .select('*')
      .limit(1)
      .single();

    if (settingsError || !settings) {
      console.error('❌ Error fetching marketing settings:', settingsError);
      throw new Error('Configuración de marketing no encontrada');
    }

    console.log('⚙️ Marketing settings loaded:', {
      frequency: settings.message_frequency_days,
      window: settings.trip_window_days,
      autoEnabled: settings.auto_send_enabled
    });

    // Verificar si el envío automático está habilitado
    if (!settings.auto_send_enabled) {
      console.log('⏸️ Auto-send is disabled, but proceeding with manual campaign');
    }

    // Calcular fechas para obtener viajes
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + settings.trip_window_days);

    console.log('📅 Date range for trips:', {
      start: today.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });

    // Obtener viajes en el rango de fechas usando la función de la base de datos
    const { data: trips, error: tripsError } = await supabaseClient
      .rpc('get_trips_for_marketing_period', {
        start_date: today.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      });

    if (tripsError) {
      console.error('❌ Error fetching trips:', tripsError);
      throw new Error('Error al obtener viajes programados');
    }

    console.log('✈️ Found trips:', trips?.length || 0);

    if (!trips || trips.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No hay viajes programados para enviar',
          totalSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener contactos activos de marketing
    const { data: contacts, error: contactsError } = await supabaseClient
      .from('marketing_contacts')
      .select('*')
      .eq('is_active', true);

    if (contactsError) {
      console.error('❌ Error fetching contacts:', contactsError);
      throw new Error('Error al obtener contactos de marketing');
    }

    console.log('📞 Found active contacts:', contacts?.length || 0);

    if (!contacts || contacts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No hay contactos activos para enviar',
          totalSent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear campaña
    const campaignName = `Campaña automática - ${today.toLocaleDateString('es-CO')}`;
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('marketing_campaigns')
      .insert({
        campaign_name: campaignName,
        trip_start_date: today.toISOString().split('T')[0],
        trip_end_date: endDate.toISOString().split('T')[0],
        total_messages_sent: contacts.length,
        success_count: 0,
        failed_count: 0
      })
      .select()
      .single();

    if (campaignError || !campaign) {
      console.error('❌ Error creating campaign:', campaignError);
      throw new Error('Error al crear la campaña');
    }

    console.log('📊 Campaign created:', campaign.id);

    let successCount = 0;
    let failedCount = 0;

    // Enviar mensajes a cada contacto
    for (const contact of contacts) {
      try {
        console.log(`📱 Sending message to ${contact.customer_name} (${contact.phone_number})`);

        // Generar mensaje usando la nueva función que incluye precios
        const { data: messageContent, error: messageError } = await supabaseClient
          .rpc('generate_marketing_message_with_rates', {
            customer_name_param: contact.customer_name,
            template_param: settings.message_template,
            start_date: today.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0]
          });

        if (messageError || !messageContent) {
          console.error(`❌ Error generating message for ${contact.customer_name}:`, messageError);
          failedCount++;
          continue;
        }

        // Crear registro en el log de mensajes de marketing
        const { data: messageLog, error: logError } = await supabaseClient
          .from('marketing_message_log')
          .insert({
            campaign_id: campaign.id,
            customer_phone: contact.phone_number,
            customer_name: contact.customer_name,
            message_content: messageContent,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) {
          console.error(`❌ Error creating message log for ${contact.customer_name}:`, logError);
          failedCount++;
          continue;
        }

        // Enviar mensaje por WhatsApp
        const { data: whatsappResponse, error: whatsappError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: messageLog.id,
            phone: contact.phone_number,
            message: messageContent,
            useTemplate: true,
            templateName: 'customer_service_followup',
            templateLanguage: 'es_CO',
            customerId: null
          }
        });

        if (whatsappError || (whatsappResponse && whatsappResponse.error)) {
          console.error(`❌ WhatsApp error for ${contact.customer_name}:`, whatsappError || whatsappResponse.error);
          
          // Actualizar log como fallido
          await supabaseClient
            .from('marketing_message_log')
            .update({
              status: 'failed',
              error_message: whatsappError?.message || whatsappResponse?.error || 'Error desconocido'
            })
            .eq('id', messageLog.id);
          
          failedCount++;
          continue;
        }

        // Actualizar log como exitoso
        await supabaseClient
          .from('marketing_message_log')
          .update({
            status: 'sent',
            whatsapp_message_id: whatsappResponse?.whatsappMessageId,
            sent_at: new Date().toISOString()
          })
          .eq('id', messageLog.id);

        // Actualizar último mensaje enviado del contacto
        await supabaseClient
          .from('marketing_contacts')
          .update({
            last_message_sent_at: new Date().toISOString()
          })
          .eq('id', contact.id);

        successCount++;
        console.log(`✅ Message sent successfully to ${contact.customer_name}`);

      } catch (error) {
        console.error(`❌ Error processing contact ${contact.customer_name}:`, error);
        failedCount++;
      }
    }

    // Actualizar estadísticas de la campaña
    await supabaseClient
      .from('marketing_campaigns')
      .update({
        success_count: successCount,
        failed_count: failedCount
      })
      .eq('id', campaign.id);

    // Actualizar configuración con la última campaña enviada
    await supabaseClient
      .from('marketing_settings')
      .update({
        last_campaign_sent_at: new Date().toISOString()
      })
      .eq('id', settings.id);

    console.log(`✅ Campaign completed: ${successCount} sent, ${failedCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true,
        campaignId: campaign.id,
        totalSent: successCount,
        totalFailed: failedCount,
        message: `Campaña enviada: ${successCount} mensajes exitosos, ${failedCount} fallidos`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in send-marketing-campaign:', error)
    
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
