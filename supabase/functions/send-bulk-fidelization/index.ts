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
        
        let useTemplate = false;
        let templateName = '';
        let templateLanguage = 'es_CO';

        if (message.messageType === 'redeemable') {
          useTemplate = settings.redeemable_use_template;
          templateName = settings.redeemable_template_name || '';
          templateLanguage = settings.redeemable_template_language || 'es_CO';
        } else {
          useTemplate = settings.motivational_use_template;
          templateName = settings.motivational_template_name || '';
          templateLanguage = settings.motivational_template_language || 'es_CO';
        }

        let whatsappResponse;

        if (useTemplate && templateName) {
          // Send using WhatsApp Business Template
          const templatePayload = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: templateLanguage },
              components: [{
                type: 'body',
                parameters: [
                  { type: 'text', text: message.customerName },
                  { type: 'text', text: message.pointsAvailable.toString() },
                  { 
                    type: 'text', 
                    text: message.messageType === 'redeemable' 
                      ? Math.floor(message.pointsAvailable / 1000).toString()
                      : Math.max(0, 1000 - message.pointsAvailable).toString()
                  }
                ]
              }]
            }
          };

          whatsappResponse = await fetch(
            `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(templatePayload),
            }
          );
        } else {
          // Send using plain text message
          const textPayload = {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: message.messageContent }
          };

          whatsappResponse = await fetch(
            `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(textPayload),
            }
          );
        }

        const whatsappData = await whatsappResponse.json();

        if (whatsappResponse.ok) {
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
          throw new Error(whatsappData.error?.message || 'Failed to send WhatsApp message');
        }
      } catch (error) {
        console.error(`Error sending to ${message.customerName}:`, error);
        
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
