
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

    // Function to call OpenAI with retry logic
    const callOpenAI = async (retryCount = 0): Promise<string> => {
      try {
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
          const errorData = await response.text();
          console.error(`OpenAI API error (${response.status}):`, errorData);
          
          // Handle rate limiting with exponential backoff
          if (response.status === 429 && retryCount < 3) {
            const waitTime = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
            console.log(`Rate limited, retrying in ${waitTime}ms (attempt ${retryCount + 1}/3)`);
            await delay(waitTime);
            return callOpenAI(retryCount + 1);
          }
          
          // Handle different error types
          if (response.status === 429) {
            throw new Error('RATE_LIMIT_EXCEEDED');
          } else if (response.status === 401) {
            throw new Error('INVALID_API_KEY');
          } else if (response.status >= 500) {
            throw new Error('OPENAI_SERVER_ERROR');
          } else {
            throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
          }
        }

        const data = await response.json();
        return data.choices[0].message.content;
        
      } catch (error) {
        if (retryCount < 2 && !error.message.includes('RATE_LIMIT_EXCEEDED')) {
          console.log(`Retrying OpenAI call due to error: ${error.message} (attempt ${retryCount + 1}/3)`);
          await delay(1000);
          return callOpenAI(retryCount + 1);
        }
        throw error;
      }
    };

    // Try to get AI response
    let aiResponse: string;
    try {
      aiResponse = await callOpenAI();
      console.log('✅ AI Response generated successfully');
    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      
      // Provide specific fallback responses based on error type
      if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        aiResponse = `Hola! Gracias por contactarnos. En este momento nuestro sistema automático está experimentando alta demanda. Un agente de Ojitos Express te contactará pronto para ayudarte con tu consulta. 

Si tienes el número de tracking de tu paquete, puedes compartirlo para que podamos revisar el estado cuando nuestro agente esté disponible. 

¡Gracias por tu paciencia! 🙏`;
      } else if (error.message.includes('INVALID_API_KEY')) {
        aiResponse = `Hola! Gracias por contactarnos. Nuestro sistema automático necesita configuración. Un agente de Ojitos Express te contactará pronto para ayudarte. 

¿En qué podemos ayudarte hoy? 😊`;
      } else {
        // Generic fallback with package info if available
        if (packageInfo) {
          aiResponse = `Hola! Gracias por contactarnos. Veo que tienes los siguientes paquetes:

${packageInfo}

Un agente de Ojitos Express te contactará pronto para ayudarte con cualquier consulta adicional. 

¿Hay algo específico sobre alguno de estos paquetes que te gustaría saber? 📦`;
        } else {
          aiResponse = `Hola! Gracias por contactarnos. Un agente de Ojitos Express te contactará pronto para ayudarte. 

Si tienes el número de tracking de tu paquete, no dudes en compartirlo para que podamos ayudarte mejor. 

¡Estamos aquí para ayudarte! 😊`;
        }
      }
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasPackageInfo: packageInfo.length > 0 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in ai-whatsapp-response:', error);
    
    // Enhanced fallback response
    const fallbackResponse = "Disculpa, estoy teniendo problemas técnicos en este momento. Un agente de Ojitos Express te contactará pronto para ayudarte. 🙏\n\nSi tienes el número de tracking de tu paquete, compártelo y nuestro agente podrá ayudarte cuando esté disponible.";
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: fallbackResponse
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
