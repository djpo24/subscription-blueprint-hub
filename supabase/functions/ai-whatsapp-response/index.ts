
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
    const startTime = Date.now();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get comprehensive customer information
    let customerInfo: any = {
      customerFound: false,
      customerName: '',
      packagesCount: 0,
      packages: [],
      pendingDeliveryPackages: [],
      pendingPaymentPackages: [],
      totalPending: 0,
      totalFreight: 0
    };

    let actualCustomerId = customerId;

    // If no customerId provided, try to find customer by phone
    if (!actualCustomerId) {
      const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, email')
        .or(`phone.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
        .limit(1);

      if (customers && customers.length > 0) {
        actualCustomerId = customers[0].id;
        customerInfo.customerFound = true;
        customerInfo.customerName = customers[0].name;
      }
    } else {
      // Get customer info by ID
      const { data: customer } = await supabase
        .from('customers')
        .select('name, email, phone')
        .eq('id', actualCustomerId)
        .single();

      if (customer) {
        customerInfo.customerFound = true;
        customerInfo.customerName = customer.name;
      }
    }

    // If customer found, get comprehensive package and payment information
    if (actualCustomerId && customerInfo.customerFound) {
      // Get all customer packages
      const { data: packages } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          status,
          destination,
          origin,
          description,
          created_at,
          delivered_at,
          amount_to_collect,
          freight,
          currency
        `)
        .eq('customer_id', actualCustomerId)
        .order('created_at', { ascending: false });

      if (packages && packages.length > 0) {
        customerInfo.packagesCount = packages.length;
        customerInfo.packages = packages;

        // Calculate total freight
        customerInfo.totalFreight = packages.reduce((sum, p) => sum + (p.freight || 0), 0);

        // Find pending delivery packages (not delivered yet)
        customerInfo.pendingDeliveryPackages = packages.filter(p => 
          p.status !== 'delivered' && p.status !== 'cancelled'
        );

        // Find packages that are delivered but have pending payments
        const deliveredPackages = packages.filter(p => 
          (p.status === 'delivered' || p.status === 'en_destino') && 
          p.amount_to_collect && 
          p.amount_to_collect > 0
        );

        if (deliveredPackages.length > 0) {
          // Get payments for these packages
          const { data: payments } = await supabase
            .from('customer_payments')
            .select('*')
            .in('package_id', deliveredPackages.map(p => p.id));

          // Calculate pending amounts
          customerInfo.pendingPaymentPackages = deliveredPackages.map(pkg => {
            const packagePayments = payments?.filter(p => p.package_id === pkg.id) || [];
            const totalPaid = packagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const pendingAmount = (pkg.amount_to_collect || 0) - totalPaid;
            
            return {
              ...pkg,
              totalPaid,
              pendingAmount
            };
          }).filter(p => p.pendingAmount > 0);

          customerInfo.totalPending = customerInfo.pendingPaymentPackages.reduce(
            (sum, p) => sum + p.pendingAmount, 0
          );
        }
      }
    }

    // Create a more detailed system prompt based on customer information
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    let systemPrompt = `Eres SARA, asistente virtual de Ojitos Express. Responde como una persona real, amigable y profesional. NUNCA menciones que eres un bot o IA.

INFORMACIÓN DEL CLIENTE:`;

    if (customerInfo.customerFound) {
      systemPrompt += `
- Cliente: ${customerInfo.customerName}
- Total de encomiendas: ${customerInfo.packagesCount}
- Flete total histórico: ${formatCurrency(customerInfo.totalFreight)}`;

      if (customerInfo.pendingDeliveryPackages.length > 0) {
        systemPrompt += `

ENCOMIENDAS PENDIENTES DE ENTREGA (${customerInfo.pendingDeliveryPackages.length}):`;
        customerInfo.pendingDeliveryPackages.forEach(pkg => {
          systemPrompt += `
- ${pkg.tracking_number}: ${pkg.status} (${pkg.origin} → ${pkg.destination})
  Descripción: ${pkg.description || 'Sin descripción'}
  Flete: ${formatCurrency(pkg.freight || 0)}`;
        });
      }

      if (customerInfo.pendingPaymentPackages.length > 0) {
        systemPrompt += `

ENCOMIENDAS CON PAGOS PENDIENTES (${customerInfo.pendingPaymentPackages.length}):`;
        customerInfo.pendingPaymentPackages.forEach(pkg => {
          systemPrompt += `
- ${pkg.tracking_number}: ${pkg.status}
  Descripción: ${pkg.description || 'Sin descripción'}
  Total a cobrar: ${formatCurrency(pkg.amount_to_collect || 0)}
  Ya pagado: ${formatCurrency(pkg.totalPaid || 0)}
  PENDIENTE: ${formatCurrency(pkg.pendingAmount)}`;
        });
        systemPrompt += `

TOTAL PENDIENTE DE PAGO: ${formatCurrency(customerInfo.totalPending)}`;
      }

      if (customerInfo.pendingDeliveryPackages.length === 0 && customerInfo.pendingPaymentPackages.length === 0) {
        systemPrompt += `

✅ ¡Excelente! No tienes encomiendas pendientes de entrega ni pagos pendientes.`;
      }
    } else {
      systemPrompt += `
- Cliente no identificado en el sistema
- No se encontraron encomiendas asociadas a este número`;
    }

    systemPrompt += `

INSTRUCCIONES DE RESPUESTA:
1. Responde de manera natural y conversacional, como una persona real
2. Si preguntan por costos, estados o información específica, proporciona los datos exactos de arriba
3. Si preguntan "cuánto es", "cuánto debo", "saldo", etc., indica claramente los montos pendientes
4. Si no hay información específica, ofrece ayuda para obtener el número de tracking
5. Si hay múltiples encomiendas, menciona las más relevantes (pendientes)
6. Usa emojis moderadamente para ser más amigable
7. Mantén respuestas concisas pero completas
8. Si el cliente no está en el sistema, sé amable y ofrece ayuda para localizarlo

EJEMPLOS DE RESPUESTAS NATURALES:
- "Hola [Nombre]! Vi que tienes una encomienda pendiente..."
- "¡Por supuesto! Te cuento sobre tu encomienda..."
- "¡Hola! Revisé tu información y..."

NUNCA digas: "Soy un bot", "sistema automático", "IA", etc.`;

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
            model: 'gpt-4.1-2025-04-14',
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
    let wasFallback = false;
    
    try {
      aiResponse = await callOpenAI();
      console.log('✅ AI Response generated successfully');
    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      wasFallback = true;
      
      // Provide intelligent fallback responses based on customer data
      if (customerInfo.customerFound) {
        if (customerInfo.pendingPaymentPackages.length > 0) {
          aiResponse = `¡Hola ${customerInfo.customerName}! 🌟 Revisé tu información y tienes un saldo pendiente de ${formatCurrency(customerInfo.totalPending)} por ${customerInfo.pendingPaymentPackages.length} encomienda${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}.

${customerInfo.pendingPaymentPackages.map(pkg => 
  `📦 ${pkg.tracking_number}: ${formatCurrency(pkg.pendingAmount)} pendiente`
).join('\n')}

¿Te gustaría que te ayude con el proceso de pago? 💰`;
        } else if (customerInfo.pendingDeliveryPackages.length > 0) {
          aiResponse = `¡Hola ${customerInfo.customerName}! 📦 Vi que tienes ${customerInfo.pendingDeliveryPackages.length} encomienda${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''} en camino:

${customerInfo.pendingDeliveryPackages.map(pkg => 
  `🚚 ${pkg.tracking_number}: ${pkg.status}`
).join('\n')}

Un agente te contactará pronto con más detalles. ¿Hay algo específico que necesites saber? 😊`;
        } else {
          aiResponse = `¡Hola ${customerInfo.customerName}! 😊 Revisé tu información y tienes todas tus encomiendas al día. ¡Excelente!

¿En qué más puedo ayudarte hoy? 🌟`;
        }
      } else {
        aiResponse = `¡Hola! 😊 Para ayudarte mejor, necesito localizar tu información en nuestro sistema.

¿Podrías compartirme tu número de tracking o el nombre completo con el que registraste tus encomiendas?

Un agente también te contactará pronto para asistirte. 📞`;
      }
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Store the interaction in the database for learning purposes
    try {
      const { error: insertError } = await supabase
        .from('ai_chat_interactions')
        .insert({
          customer_id: actualCustomerId || null,
          customer_phone: customerPhone,
          user_message: message,
          ai_response: aiResponse,
          context_info: customerInfo,
          response_time_ms: responseTime,
          was_fallback: wasFallback
        });

      if (insertError) {
        console.error('❌ Error storing interaction:', insertError);
      } else {
        console.log('✅ Interaction stored for learning');
      }
    } catch (storeError) {
      console.error('❌ Error storing interaction:', storeError);
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      hasPackageInfo: customerInfo.packagesCount > 0,
      isFromFallback: wasFallback,
      customerInfo: {
        found: customerInfo.customerFound,
        name: customerInfo.customerName,
        pendingAmount: customerInfo.totalPending,
        pendingPackages: customerInfo.pendingPaymentPackages.length,
        transitPackages: customerInfo.pendingDeliveryPackages.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in ai-whatsapp-response:', error);
    
    // Enhanced fallback response
    const fallbackResponse = "¡Hola! Estoy teniendo problemas técnicos en este momento, pero un agente de Ojitos Express te contactará pronto para ayudarte. 🙏\n\nSi tienes el número de tracking de tu encomienda, compártelo y nuestro agente podrá ayudarte cuando esté disponible. 📦";
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: fallbackResponse,
      isFromFallback: true
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
