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

    // Check rate limiting: 10 minutes between requests
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const { data: recentCodes, error: recentError } = await supabase
      .from('point_redemptions')
      .select('created_at')
      .eq('customer_id', customerId)
      .gte('created_at', tenMinutesAgo.toISOString())
      .limit(1);

    if (recentError) {
      console.error('❌ Error checking recent codes:', recentError);
    }

    if (recentCodes && recentCodes.length > 0) {
      const waitMinutes = Math.ceil((new Date(recentCodes[0].created_at).getTime() + 10 * 60 * 1000 - Date.now()) / 60000);
      throw new Error(`Debe esperar ${waitMinutes} minutos antes de solicitar otro código`);
    }

    // Check daily limit: maximum 3 codes per day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const { data: todayCodes, error: dailyError } = await supabase
      .from('point_redemptions')
      .select('id')
      .eq('customer_id', customerId)
      .gte('created_at', todayStart.toISOString());

    if (dailyError) {
      console.error('❌ Error checking daily limit:', dailyError);
    }

    if (todayCodes && todayCodes.length >= 3) {
      throw new Error('Has alcanzado el límite de 3 códigos por día. Intenta mañana.');
    }

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

    // Prepare message for logging (used only in fallback mode)
    let plainTextMessage: string | undefined;
    
    if (!settings?.use_template) {
      plainTextMessage = messageTemplate.replace(/{{codigo}}/g, verificationCode);
    }

    console.log('📤 Sending via send-whatsapp-notification function');
    
    // Send WhatsApp message using the send-whatsapp-notification function
    const { data: whatsappResult, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
      body: {
        notificationId: redemption.id,
        phone: customerPhone,
        message: plainTextMessage || `Código de verificación: ${verificationCode}`,
        customerId: customerId,
        useTemplate: settings?.use_template || false,
        templateName: settings?.template_name,
        templateLanguage: settings?.template_language || 'es_CO',
        templateParameters: {
          verificationCode: verificationCode
        }
      }
    });

    if (whatsappError) {
      console.error('❌ WhatsApp function error:', whatsappError);
      throw new Error(`WhatsApp error: ${whatsappError.message}`);
    }

    if (whatsappResult?.error) {
      console.error('❌ WhatsApp API error:', whatsappResult.error);
      throw new Error(`WhatsApp API error: ${whatsappResult.error}`);
    }

    console.log('✅ WhatsApp message sent:', whatsappResult);

    // Log the notification (only if plain text was used)
    if (!settings?.use_template && plainTextMessage) {
      await supabase
        .from('notification_log')
        .insert({
          customer_id: customerId,
          message: plainTextMessage,
          notification_type: 'redemption_code',
          status: 'sent'
        });
    }

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
