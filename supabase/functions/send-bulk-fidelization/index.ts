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

        // Preparar parámetros del template (igual que en notificaciones de viajes)
        let templateParameters = null;
        
        if (useTemplate && templateName) {
          console.log(`📋 Preparando templateParameters para ${templateName}`);
          
          if (message.messageType === 'redeemable') {
            // Template "canjea" - para clientes con ≥1000 puntos
            const kilos = Math.floor(message.pointsAvailable / 1000);
            templateParameters = {
              customerName: message.customerName,
              pointsAvailable: message.pointsAvailable.toString(),
              kilosAvailable: kilos.toString()
            };
            console.log(`🎁 Parámetros: nombre="${message.customerName}", puntos=${message.pointsAvailable}, kilos=${kilos}`);
          } else {
            // Template "pendiente_canje" - para clientes con <1000 puntos
            const puntosFaltantes = Math.max(0, 1000 - message.pointsAvailable);
            templateParameters = {
              customerName: message.customerName,
              pointsAvailable: message.pointsAvailable.toString(),
              pointsMissing: puntosFaltantes.toString()
            };
            console.log(`📈 Parámetros: nombre="${message.customerName}", puntos=${message.pointsAvailable}, faltantes=${puntosFaltantes}`);
          }
        }

        // Enviar usando el mismo endpoint que notificaciones de viajes
        console.log(`📞 Llamando a send-whatsapp-notification...`);
        
        const whatsappResponse = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: null,
            phone: message.customerPhone,
            message: message.messageContent,
            useTemplate: useTemplate,
            templateName: templateName,
            templateLanguage: templateLanguage,
            templateParameters: templateParameters,
            customerId: message.customerId
          }
        });

        console.log(`📱 Respuesta completa:`, JSON.stringify(whatsappResponse, null, 2));

        // Verificar si hubo error en la invocación
        if (whatsappResponse.error) {
          console.error(`❌ Error en invocación:`, whatsappResponse.error);
          throw new Error(`Error al invocar función: ${whatsappResponse.error.message}`);
        }

        // Verificar respuesta de la función
        const whatsappResult = whatsappResponse.data;
        
        if (!whatsappResult) {
          console.error(`❌ Sin datos en respuesta`);
          throw new Error('No se recibieron datos de la función');
        }

        if (whatsappResult.error) {
          console.error(`❌ Error en resultado:`, whatsappResult.error);
          throw new Error(whatsappResult.error);
        }

        if (whatsappResult.success) {
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
            whatsapp_message_id: whatsappResult.messageId,
            sent_at: new Date().toISOString()
          });

          successCount++;
        } else {
          console.error(`❌ Respuesta inesperada:`, whatsappResult);
          throw new Error('Respuesta inesperada de send-whatsapp-notification');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error enviando a ${message.customerName}:`, errorMessage);
        console.error('Stack trace:', error);
        
        // Log failed message con el error detallado
        await supabase.from('bulk_fidelization_log').insert({
          customer_id: message.customerId,
          customer_name: message.customerName,
          customer_phone: message.customerPhone,
          message_type: message.messageType,
          message_content: message.messageContent,
          points_available: message.pointsAvailable,
          status: 'failed',
          error_message: errorMessage
        });

        failedCount++;
      }
      
      // Pequeña pausa entre mensajes para evitar rate limits
      if (successCount + failedCount < messages.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
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
