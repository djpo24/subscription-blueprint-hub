
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
    const { message, customerPhone, customerId } = await req.json();
    
    console.log('🤖 AI Response Request:', { message, customerPhone, customerId });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get customer information and packages
    let customerContext = '';
    let packageInfo = '';

    if (customerId) {
      // Get customer info
      const { data: customer } = await supabase
        .from('customers')
        .select('name, email, phone')
        .eq('id', customerId)
        .single();

      if (customer) {
        customerContext = `Cliente: ${customer.name} (${customer.email})`;
      }

      // Get customer's packages
      const { data: packages } = await supabase
        .from('packages')
        .select(`
          tracking_number,
          status,
          destination,
          origin,
          description,
          created_at,
          delivered_at,
          amount_to_collect,
          currency
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (packages && packages.length > 0) {
        packageInfo = packages.map(pkg => 
          `- Paquete ${pkg.tracking_number}: ${pkg.status} (${pkg.origin} → ${pkg.destination})`
        ).join('\n');
      }
    } else {
      // Try to find customer by phone
      const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, email')
        .or(`phone.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
        .limit(1);

      if (customers && customers.length > 0) {
        const customer = customers[0];
        customerContext = `Cliente: ${customer.name} (${customer.email})`;

        // Get packages for found customer
        const { data: packages } = await supabase
          .from('packages')
          .select(`
            tracking_number,
            status,
            destination,
            origin,
            description,
            created_at,
            delivered_at,
            amount_to_collect,
            currency
          `)
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (packages && packages.length > 0) {
          packageInfo = packages.map(pkg => 
            `- Paquete ${pkg.tracking_number}: ${pkg.status} (${pkg.origin} → ${pkg.destination})`
          ).join('\n');
        }
      }
    }

    // Prepare context for AI
    const systemPrompt = `Eres un asistente de atención al cliente para una empresa de envíos llamada "Ojitos Express". 

INFORMACIÓN DEL CONTEXTO:
${customerContext}

PAQUETES DEL CLIENTE:
${packageInfo || 'No se encontraron paquetes para este cliente.'}

ESTADOS DE PAQUETES:
- "pending": Pendiente de procesamiento
- "recibido": Recibido en origen
- "procesado": Procesado y listo para envío
- "en_transito": En tránsito
- "en_destino": Llegó al destino
- "entregado": Entregado al cliente

INSTRUCCIONES:
1. Responde de manera amigable y profesional en español
2. Si el cliente pregunta por el estado de un paquete, proporciona información específica
3. Si no tienes información del cliente o paquetes, ofrece ayuda para obtener el número de tracking
4. Mantén las respuestas concisas pero informativas
5. Si el cliente tiene paquetes entregados, pregunta si todo llegó en buen estado
6. Para paquetes en tránsito, tranquiliza al cliente sobre el progreso
7. Siempre termina preguntando si necesita algo más

TONO: Amigable, profesional, servicial`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log('✅ AI Response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasPackageInfo: packageInfo.length > 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in ai-whatsapp-response:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      response: "Disculpa, estoy teniendo problemas técnicos en este momento. Un agente te contactará pronto para ayudarte. 🙏"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
