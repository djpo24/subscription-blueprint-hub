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

    // Prepare WhatsApp message
    const message = `🎉 *Redención de Puntos*\n\n` +
      `Hola ${customerName}! 👋\n\n` +
      `Has solicitado redimir *${pointsToRedeem} puntos* por *${kilosEarned} kg*.\n\n` +
      `Tu código de verificación es:\n\n` +
      `*${verificationCode}*\n\n` +
      `⏰ Este código expira en 10 minutos.\n\n` +
      `Por favor, ingresa este código en el sistema para completar tu redención.`;

    // Send WhatsApp notification
    const metaToken = Deno.env.get('META_WHATSAPP_TOKEN');
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');

    if (!metaToken || !phoneNumberId) {
      console.error('❌ WhatsApp credentials not configured');
      throw new Error('WhatsApp configuration missing');
    }

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: customerPhone,
          type: 'text',
          text: { body: message }
        }),
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
