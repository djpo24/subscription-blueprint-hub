import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCustomerInfo } from './customerService.ts';
import { buildSystemPrompt, buildConversationContext } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { generateFallbackResponse } from './fallbackResponses.ts';
import { validatePackageDeliveryTiming, generateBusinessIntelligentResponse } from './businessLogic.ts';
import { buildLearningContext, enhancePromptWithLearning, updateLearningModel } from './learningSystem.ts';
import { getActiveFreightRates } from './freightRatesService.ts';
import { getUpcomingTripsByDestination, formatTripsForPrompt, shouldQueryTrips } from './tripScheduleService.ts';
import { getDestinationAddresses, formatAddressesForPrompt } from './destinationAddressService.ts';
import { AIResponseResult } from './types.ts';

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
    
    console.log('🤖 BOT RESPONDE SIEMPRE - Sistema activado:', { 
      message: message?.substring(0, 50) + '...', 
      customerPhone: customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      customerId: customerId || 'not_provided'
    });
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

    // Get customer information
    const { customerInfo, actualCustomerId } = await getCustomerInfo(
      supabase, 
      customerPhone, 
      customerId
    );

    console.log('🤖 INFORMACIÓN DEL CLIENTE:', {
      customerFound: customerInfo.customerFound,
      packagesCount: customerInfo.packagesCount,
      botSiempreResponde: true
    });

    // Get additional context data
    const freightRates = await getActiveFreightRates(supabase);
    const destinationAddresses = await getDestinationAddresses(supabase);
    
    const tripQuery = shouldQueryTrips(message);
    let upcomingTrips: any[] = [];
    let tripsContext = '';
    
    if (tripQuery.shouldQuery) {
      upcomingTrips = await getUpcomingTripsByDestination(supabase, tripQuery.destination);
      tripsContext = formatTripsForPrompt(upcomingTrips, tripQuery.destination);
    }

    const recentMessages = await getSecureConversationHistory(supabase, customerPhone, actualCustomerId);
    const validationResult = validatePackageDeliveryTiming(customerInfo);
    const learningContext = buildLearningContext(customerInfo);
    const addressesContext = formatAddressesForPrompt(destinationAddresses);

    // Crear prompt para el bot
    const basePrompt = buildSystemPrompt(customerInfo, freightRates, tripsContext, addressesContext);
    const conversationContext = buildConversationContext(recentMessages, customerInfo.customerFirstName);
    const enhancedPrompt = enhancePromptWithLearning(basePrompt + conversationContext, learningContext);

    const businessInsight = generateBusinessIntelligentResponse(customerInfo);
    const contextualMessage = businessInsight ? `${message}\n\nContexto específico del cliente: ${businessInsight}` : message;

    let aiResponse: string;
    let wasFallback = false;
    let interactionId: string | null = null;
    
    try {
      console.log('🤖 Generando respuesta con OpenAI...');
      aiResponse = await callOpenAI(enhancedPrompt, contextualMessage, openAIApiKey);
      
      if (!validationResult.isValid) {
        aiResponse = `${validationResult.message}\n\n${aiResponse}`;
      }

      console.log('✅ Respuesta de OpenAI generada exitosamente');
      
    } catch (error) {
      console.error('❌ Error OpenAI - Usando respuesta de emergencia:', error.message);
      
      // Si OpenAI falla, usar respuesta de emergencia pero NUNCA escalar
      aiResponse = generateFallbackResponse(customerInfo);
      wasFallback = true;
      
      console.log('🤖 Respuesta de emergencia generada - BOT SIEMPRE RESPONDE');
    }

    const responseTime = Date.now() - startTime;

    // Store interaction
    try {
      const { data: interactionData, error: insertError } = await supabase
        .from('ai_chat_interactions')
        .insert({
          customer_id: actualCustomerId || null,
          customer_phone: customerPhone,
          user_message: message,
          ai_response: aiResponse,
          context_info: {
            customerFound: customerInfo.customerFound,
            packagesCount: customerInfo.packagesCount,
            wasEscalated: false, // NUNCA escalado
            botAlwaysResponds: true,
            escalationDisabled: true
          },
          response_time_ms: responseTime,
          was_fallback: wasFallback
        })
        .select()
        .single();

      if (!insertError) {
        interactionId = interactionData.id;
        await updateLearningModel(supabase, interactionId, customerPhone, message, aiResponse);
      }
    } catch (storeError) {
      console.error('❌ Error storing interaction:', storeError);
    }

    const result: AIResponseResult = {
      response: aiResponse,
      hasPackageInfo: customerInfo.packagesCount > 0,
      isFromFallback: wasFallback,
      customerInfo: {
        found: customerInfo.customerFound,
        name: customerInfo.customerFirstName,
        pendingAmount: customerInfo.totalPending,
        pendingPackages: customerInfo.pendingPaymentPackages.length,
        transitPackages: customerInfo.pendingDeliveryPackages.length
      },
      interactionId: interactionId,
      tripsInfo: tripQuery.shouldQuery ? {
        destination: tripQuery.destination,
        tripsFound: upcomingTrips.length,
        nextTripDate: upcomingTrips.length > 0 ? upcomingTrips[0].trip_date : null
      } : undefined,
      wasEscalated: false // NUNCA escalado
    };

    console.log('🤖 RESPUESTA ENTREGADA - BOT SIEMPRE ACTIVO:', {
      wasEscalated: false,
      botAlwaysResponds: true,
      responseTime: responseTime + 'ms',
      escalationSystemDisabled: true
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error crítico - Generando respuesta de emergencia:', error);
    
    const emergencyResponse = `¡Hola! 👋

Soy SARA, tu asistente virtual de Envíos Ojito. Estoy experimentando una dificultad técnica momentánea, pero puedo ayudarte con lo siguiente:

📦 **Consultas generales sobre encomiendas**
💰 **Información de servicios y tarifas**
🚚 **Horarios y rutas disponibles**
📍 **Ubicaciones de nuestras oficinas**

Por favor, intenta tu consulta nuevamente en unos momentos o contáctanos directamente.

¡Estoy aquí para ayudarte! 😊`;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: emergencyResponse,
      isFromFallback: true,
      wasEscalated: false // NUNCA escalado
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getSecureConversationHistory(supabase: any, customerPhone: string, customerId?: string) {
  try {
    // 🔒 ONLY get messages for this specific customer phone number - increased limit
    const { data: incomingMessages, error: incomingError } = await supabase
      .from('incoming_messages')
      .select('message_content, timestamp')
      .eq('from_phone', customerPhone) // Strict filter by phone
      .order('timestamp', { ascending: false })
      .limit(50); // Increased limit to 50

    if (incomingError) {
      console.error('Error fetching incoming messages for this customer:', incomingError);
    }

    // 🔒 ONLY get sent messages for this specific customer phone number - increased limit
    const { data: sentMessages, error: sentError } = await supabase
      .from('sent_messages')
      .select('message, sent_at')
      .eq('phone', customerPhone) // Strict filter by phone
      .order('sent_at', { ascending: false })
      .limit(50); // Increased limit to 50

    if (sentError) {
      console.error('Error fetching sent messages for this customer:', sentError);
    }

    // Combine and sort by timestamp - all messages are already filtered by customer phone
    const allMessages: Array<{
      message: string;
      isFromCustomer: boolean;
      timestamp: string;
    }> = [];

    if (incomingMessages) {
      incomingMessages.forEach(msg => {
        if (msg.message_content) {
          allMessages.push({
            message: msg.message_content,
            isFromCustomer: true,
            timestamp: msg.timestamp
          });
        }
      });
    }

    if (sentMessages) {
      sentMessages.forEach(msg => {
        if (msg.message) {
          allMessages.push({
            message: msg.message,
            isFromCustomer: false,
            timestamp: msg.sent_at
          });
        }
      });
    }

    // Sort by timestamp (most recent first) and return last 20 messages for THIS customer only
    const customerMessages = allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20) // Increased from 8 to 20 messages
      .reverse(); // Reverse to get chronological order for context

    console.log(`🔐 Retrieved ${customerMessages.length} secure messages for customer phone: ${customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`);
    
    return customerMessages;

  } catch (error) {
    console.error('Error building secure conversation context:', error);
    return [];
  }
}
