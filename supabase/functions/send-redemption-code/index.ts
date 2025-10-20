import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { customerId, customerName, customerPhone, pointsToRedeem, kilosEarned } = await req.json();

    console.log('📱 Sending redemption code to customer:', customerName);

    // Get template settings from database
    const { data: settings, error: settingsError } = await supabase
      .from('redemption_message_settings')
      .select('message_template, use_template, template_name, template_language')
      .single();

    if (settingsError) {
      console.error('❌ Error fetching message settings:', settingsError);
      // Use default template if settings not found
    }

    const messageTemplate = settings?.message_template || `🎉 *Redención de Puntos*

Hola {{nombre_cliente}}! 👋

Has solicitado redimir *{{puntos}} puntos* por *{{kilos}} kg*.

Tu código de verificación es:

*{{codigo}}*

⏰ Este código expira en 10 minutos.

Por favor, ingresa este código en el sistema para completar tu redención.`;

    // Generate 4-digit verification code
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('point_redemptions')
      .insert({
        customer_id: customerId,
        points_redeemed: pointsToRedeem,
        kilos_earned: kilosEarned,
        verification_code: verificationCode,
        status: 'pending',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('❌ Error creating redemption:', redemptionError);
      throw redemptionError;
    }

    console.log('✅ Redemption created:', redemption.id);

    // Get WhatsApp credentials
    const metaToken = Deno.env.get('META_WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');

    if (!metaToken || !phoneNumberId) {
      console.error('❌ WhatsApp credentials not configured');
      throw new Error('WhatsApp configuration missing');
    }

    // Prepare WhatsApp message payload
    let whatsappPayload;

    if (settings?.use_template && settings?.template_name) {
      // Use WhatsApp Business Template with parameters
      console.log('📋 Using WhatsApp Business Template:', settings.template_name);
      
      whatsappPayload = {
        messaging_product: 'whatsapp',
        to: customerPhone.replace(/^\+/, ''), // Remove + for API
        type: 'template',
        template: {
          name: settings.template_name,
          language: {
            code: settings.template_language || 'es_CO'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: customerName },
                { type: 'text', text: pointsToRedeem.toString() },
                { type: 'text', text: kilosEarned.toString() },
                { type: 'text', text: verificationCode }
              ]
            }
          ]
        }
      };
    } else {
      // Fallback to plain text message
      console.log('📝 Using plain text message (template not configured)');
      
      const message = messageTemplate
        .replace(/{{nombre_cliente}}/g, customerName)
        .replace(/{{puntos}}/g, pointsToRedeem.toString())
        .replace(/{{kilos}}/g, kilosEarned.toString())
        .replace(/{{codigo}}/g, verificationCode);

      whatsappPayload = {
        messaging_product: 'whatsapp',
        to: customerPhone.replace(/^\+/, ''),
        type: 'text',
        text: { body: message }
      };
    }

    console.log('📤 WhatsApp payload:', JSON.stringify(whatsappPayload, null, 2));

    // Send message via WhatsApp Business API
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappPayload)
      }
    );

    if (!whatsappResponse.ok) {
      const errorText = await whatsappResponse.text();
      console.error('❌ WhatsApp API error:', errorText);
      throw new Error(`WhatsApp API error: ${errorText}`);
    }

    const whatsappData = await whatsappResponse.json();
    console.log('✅ WhatsApp message sent:', whatsappData);

    // Log the notification
    await supabase
      .from('notification_log')
      .insert({
        customer_id: customerId,
        message: message,
        notification_type: 'redemption_code',
        status: 'sent'
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        redemptionId: redemption.id,
        message: 'Código enviado exitosamente' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ Error in send-redemption-code:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error al enviar código de verificación' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
