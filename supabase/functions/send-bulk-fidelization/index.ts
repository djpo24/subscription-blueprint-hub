import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MessagePreview {
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageType: 'redeemable' | 'motivational';
  messageContent: string;
  pointsAvailable: number;
}

interface Settings {
  redeemable_use_template: boolean;
  redeemable_template_name?: string;
  redeemable_template_language?: string;
  motivational_use_template: boolean;
  motivational_template_name?: string;
  motivational_template_language?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, settings }: { messages: MessagePreview[], settings: Settings } = await req.json();
    
    console.log('🚀 Iniciando envío masivo de fidelización');
    console.log(`📊 Total de mensajes a enviar: ${messages.length}`);
    
    // Separar clientes por tipo de mensaje
    const redeemableMessages = messages.filter(m => m.messageType === 'redeemable');
    const motivationalMessages = messages.filter(m => m.messageType === 'motivational');
    
    console.log(`✅ Clientes con ≥1000 puntos (canjeables): ${redeemableMessages.length}`);
    console.log(`📈 Clientes con <1000 puntos (motivacionales): ${motivationalMessages.length}`);
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');

    if (!whatsappToken || !phoneNumberId) {
      throw new Error('WhatsApp credentials not configured');
    }

    let successCount = 0;
    let failedCount = 0;

    for (const message of messages) {
      try {
        const phone = message.customerPhone.replace(/\D/g, '');
        
        console.log(`\n📤 Procesando mensaje ${successCount + failedCount + 1}/${messages.length}`);
        console.log(`👤 Cliente: ${message.customerName} (${phone})`);
        console.log(`🏆 Puntos: ${message.pointsAvailable}`);
        console.log(`📋 Tipo: ${message.messageType}`);
        
        let useTemplate = false;
        let templateName = '';
        let templateLanguage = 'es_CO';

        if (message.messageType === 'redeemable') {
          useTemplate = settings.redeemable_use_template && !!settings.redeemable_template_name;
          templateName = settings.redeemable_template_name || '';
          templateLanguage = settings.redeemable_template_language || 'es_CO';
          console.log(`🎁 Mensaje tipo: CANJEABLE (≥1000 puntos)`);
          console.log(`📋 Usar template: ${useTemplate}, nombre: ${templateName}`);
        } else {
          useTemplate = settings.motivational_use_template && !!settings.motivational_template_name;
          templateName = settings.motivational_template_name || '';
          templateLanguage = settings.motivational_template_language || 'es_CO';
          console.log(`📈 Mensaje tipo: MOTIVACIONAL (<1000 puntos)`);
          console.log(`📋 Usar template: ${useTemplate}, nombre: ${templateName}`);
        }

        let whatsappResponse;
        let whatsappPayload;

        if (useTemplate && templateName) {
          // Send using WhatsApp Business Template
          console.log(`📋 Usando template: ${templateName} para ${message.customerName}`);
          
          // Preparar parámetros según el tipo de mensaje
          let templateParameters;
          
          if (message.messageType === 'redeemable') {
            // Template "canjea" - para clientes con ≥1000 puntos
            // Parámetros: nombre_cliente, puntos_disponibles, kilos_disponibles
            const kilos = Math.floor(message.pointsAvailable / 1000);
            templateParameters = [
              { type: 'text', text: message.customerName },
              { type: 'text', text: message.pointsAvailable.toString() },
              { type: 'text', text: kilos.toString() }
            ];
            console.log(`🎁 Parámetros canjeable: nombre="${message.customerName}", puntos=${message.pointsAvailable}, kilos=${kilos}`);
          } else {
            // Template "pendiente_canje" - para clientes con <1000 puntos
            // Parámetros: nombre_cliente, puntos_disponibles, puntos_faltantes
            const puntosFaltantes = Math.max(0, 1000 - message.pointsAvailable);
            templateParameters = [
              { type: 'text', text: message.customerName },
              { type: 'text', text: message.pointsAvailable.toString() },
              { type: 'text', text: puntosFaltantes.toString() }
            ];
            console.log(`📈 Parámetros motivacional: nombre="${message.customerName}", puntos=${message.pointsAvailable}, faltantes=${puntosFaltantes}`);
          }
          
          whatsappPayload = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'template',
            template: {
              name: templateName,
              language: {
                code: templateLanguage
              },
              components: [
                {
                  type: 'body',
                  parameters: templateParameters
                }
              ]
            }
          };

          console.log(`✅ Template payload configurado:`, JSON.stringify(whatsappPayload, null, 2));
        } else {
          // Send using plain text message (fallback)
          console.log(`💬 Usando mensaje de texto para ${message.customerName}`);
          
          whatsappPayload = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message.messageContent }
          };
        }

        // Enviar mensaje a WhatsApp
        whatsappResponse = await fetch(
          `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${whatsappToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(whatsappPayload),
          }
        );

        const whatsappData = await whatsappResponse.json();
        
        console.log(`📱 Respuesta de WhatsApp:`, whatsappData);

        if (whatsappResponse.ok) {
          console.log(`✅ Mensaje enviado exitosamente a ${message.customerName}`);
          
          // Log successful message
          await supabase.from('bulk_fidelization_log').insert({
            customer_id: message.customerId,
            customer_name: message.customerName,
            customer_phone: message.customerPhone,
            message_type: message.messageType,
            message_content: message.messageContent,
            points_available: message.pointsAvailable,
            status: 'sent',
            whatsapp_message_id: whatsappData.messages?.[0]?.id,
            sent_at: new Date().toISOString()
          });

          successCount++;
        } else {
          console.error(`❌ Error en respuesta de WhatsApp:`, whatsappData);
          throw new Error(whatsappData.error?.message || 'Failed to send WhatsApp message');
        }
      } catch (error) {
        console.error(`❌ Error enviando a ${message.customerName}:`, error);
        
        // Log failed message
        await supabase.from('bulk_fidelization_log').insert({
          customer_id: message.customerId,
          customer_name: message.customerName,
          customer_phone: message.customerPhone,
          message_type: message.messageType,
          message_content: message.messageContent,
          points_available: message.pointsAvailable,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });

        failedCount++;
      }
    }

    console.log('\n🎉 Envío masivo completado');
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`❌ Fallidos: ${failedCount}`);
    console.log(`📊 Total: ${messages.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        successCount, 
        failedCount,
        totalMessages: messages.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-bulk-fidelization:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
