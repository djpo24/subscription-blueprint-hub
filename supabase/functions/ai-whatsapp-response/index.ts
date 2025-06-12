
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCustomerInfo } from './customerService.ts';
import { buildSystemPrompt, buildConversationContext } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { generateFallbackResponse } from './fallbackResponses.ts';
import { validatePackageDeliveryTiming, generateBusinessIntelligentResponse, generateHomeDeliveryResponse, generatePackageOriginClarificationResponse } from './businessLogic.ts';
import { generatePackageShippingResponse, generatePackageDeliveryDeadlineResponse, generateIntegratedPackageResponse, generateTripDateResponse } from './packageInquiryService.ts';
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

    // Get destination addresses for shipping inquiries
    const destinationAddresses = await getDestinationAddresses(supabase);

    // Get upcoming trips for all inquiries
    const allUpcomingTrips = await getUpcomingTripsByDestination(supabase);

    // 🎯 NUEVA PRIORIDAD MÁXIMA: Detectar consultas sobre encomiendas específicas que necesitan clarificación
    const packageClarificationResponse = generatePackageOriginClarificationResponse(customerInfo, message);
    if (packageClarificationResponse) {
      console.log('❓ CONSULTA DE ENCOMIENDA ESPECÍFICA detectada - Solicitando clarificación');
      
      const responseTime = Date.now() - startTime;

      // Store interaction
      let clarificationInteractionId: string | null = null;
      try {
        const { data: clarificationInteractionData, error: insertError } = await supabase
          .from('ai_chat_interactions')
          .insert({
            customer_id: actualCustomerId || null,
            customer_phone: customerPhone,
            user_message: message,
            ai_response: packageClarificationResponse,
            context_info: {
              customerFound: customerInfo.customerFound,
              packagesCount: customerInfo.packagesCount,
              wasEscalated: false,
              isPackageClarificationRequest: true,
              botAlwaysResponds: true
            },
            response_time_ms: responseTime,
            was_fallback: false
          })
          .select()
          .single();

        if (!insertError && clarificationInteractionData) {
          clarificationInteractionId = clarificationInteractionData.id;
          await updateLearningModel(supabase, clarificationInteractionId, customerPhone, message, packageClarificationResponse);
        }
      } catch (storeError) {
        console.error('❌ Error storing interaction:', storeError);
      }

      const result: AIResponseResult = {
        response: packageClarificationResponse,
        hasPackageInfo: customerInfo.packagesCount > 0,
        isFromFallback: false,
        customerInfo: {
          found: customerInfo.customerFound,
          name: customerInfo.customerFirstName,
          pendingAmount: customerInfo.totalPending,
          pendingPackages: customerInfo.pendingPaymentPackages.length,
          transitPackages: customerInfo.pendingDeliveryPackages.length
        },
        interactionId: clarificationInteractionId,
        wasEscalated: false
      };

      console.log('❓ RESPUESTA DE CLARIFICACIÓN ENVIADA - Bot pidiendo información específica');
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 🎯 SEGUNDA PRIORIDAD: Detectar consultas integradas con múltiples preguntas
    const integratedResponse = generateIntegratedPackageResponse(customerInfo, message, allUpcomingTrips, destinationAddresses);
    if (integratedResponse) {
      console.log('🎯 CONSULTA MÚLTIPLE INTEGRADA detectada - Proporcionando respuesta completa');
      
      const responseTime = Date.now() - startTime;

      // Store interaction
      let integratedInteractionId: string | null = null;
      try {
        const { data: integratedInteractionData, error: insertError } = await supabase
          .from('ai_chat_interactions')
          .insert({
            customer_id: actualCustomerId || null,
            customer_phone: customerPhone,
            user_message: message,
            ai_response: integratedResponse,
            context_info: {
              customerFound: customerInfo.customerFound,
              packagesCount: customerInfo.packagesCount,
              wasEscalated: false,
              isIntegratedMultipleInquiry: true,
              botAlwaysResponds: true
            },
            response_time_ms: responseTime,
            was_fallback: false
          })
          .select()
          .single();

        if (!insertError && integratedInteractionData) {
          integratedInteractionId = integratedInteractionData.id;
          await updateLearningModel(supabase, integratedInteractionId, customerPhone, message, integratedResponse);
        }
      } catch (storeError) {
        console.error('❌ Error storing interaction:', storeError);
      }

      const result: AIResponseResult = {
        response: integratedResponse,
        hasPackageInfo: customerInfo.packagesCount > 0,
        isFromFallback: false,
        customerInfo: {
          found: customerInfo.customerFound,
          name: customerInfo.customerFirstName,
          pendingAmount: customerInfo.totalPending,
          pendingPackages: customerInfo.pendingPaymentPackages.length,
          transitPackages: customerInfo.pendingDeliveryPackages.length
        },
        interactionId: integratedInteractionId,
        wasEscalated: false
      };

      console.log('🎯 RESPUESTA INTEGRADA ENVIADA - Todas las preguntas respondidas correctamente');
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 📅 TERCERA PRIORIDAD: Detectar consultas específicas sobre fechas de viajes
    const tripDateResponse = generateTripDateResponse(customerInfo, message, allUpcomingTrips);
    if (tripDateResponse) {
      console.log('📅 CONSULTA DE FECHAS DE VIAJES detectada - Proporcionando fechas reales de próximos viajes');
      
      const responseTime = Date.now() - startTime;

      // Store interaction
      let tripDateInteractionId: string | null = null;
      try {
        const { data: tripDateInteractionData, error: insertError } = await supabase
          .from('ai_chat_interactions')
          .insert({
            customer_id: actualCustomerId || null,
            customer_phone: customerPhone,
            user_message: message,
            ai_response: tripDateResponse,
            context_info: {
              customerFound: customerInfo.customerFound,
              packagesCount: customerInfo.packagesCount,
              wasEscalated: false,
              isTripDateInquiry: true,
              botAlwaysResponds: true
            },
            response_time_ms: responseTime,
            was_fallback: false
          })
          .select()
          .single();

        if (!insertError && tripDateInteractionData) {
          tripDateInteractionId = tripDateInteractionData.id;
          await updateLearningModel(supabase, tripDateInteractionId, customerPhone, message, tripDateResponse);
        }
      } catch (storeError) {
        console.error('❌ Error storing interaction:', storeError);
      }

      const result: AIResponseResult = {
        response: tripDateResponse,
        hasPackageInfo: customerInfo.packagesCount > 0,
        isFromFallback: false,
        customerInfo: {
          found: customerInfo.customerFound,
          name: customerInfo.customerFirstName,
          pendingAmount: customerInfo.totalPending,
          pendingPackages: customerInfo.pendingPaymentPackages.length,
          transitPackages: customerInfo.pendingDeliveryPackages.length
        },
        interactionId: tripDateInteractionId,
        wasEscalated: false
      };

      console.log('📅 RESPUESTA DE FECHAS DE VIAJES ENVIADA - Información real de próximos viajes proporcionada');
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 🚨 CUARTA PRIORIDAD: Detectar consultas sobre plazos de entrega de paquetes (solo si no es múltiple)
    const packageDeadlineResponse = generatePackageDeliveryDeadlineResponse(customerInfo, message, allUpcomingTrips);
    if (packageDeadlineResponse) {
      console.log('⏰ CONSULTA DE PLAZO DE ENTREGA detectada - Proporcionando información de deadline');
      
      const responseTime = Date.now() - startTime;

      // Store interaction
      let deadlineInteractionId: string | null = null;
      try {
        const { data: deadlineInteractionData, error: insertError } = await supabase
          .from('ai_chat_interactions')
          .insert({
            customer_id: actualCustomerId || null,
            customer_phone: customerPhone,
            user_message: message,
            ai_response: packageDeadlineResponse,
            context_info: {
              customerFound: customerInfo.customerFound,
              packagesCount: customerInfo.packagesCount,
              wasEscalated: false,
              isPackageDeadlineInquiry: true,
              botAlwaysResponds: true
            },
            response_time_ms: responseTime,
            was_fallback: false
          })
          .select()
          .single();

        if (!insertError && deadlineInteractionData) {
          deadlineInteractionId = deadlineInteractionData.id;
          await updateLearningModel(supabase, deadlineInteractionId, customerPhone, message, packageDeadlineResponse);
        }
      } catch (storeError) {
        console.error('❌ Error storing interaction:', storeError);
      }

      const result: AIResponseResult = {
        response: packageDeadlineResponse,
        hasPackageInfo: customerInfo.packagesCount > 0,
        isFromFallback: false,
        customerInfo: {
          found: customerInfo.customerFound,
          name: customerInfo.customerFirstName,
          pendingAmount: customerInfo.totalPending,
          pendingPackages: customerInfo.pendingPaymentPackages.length,
          transitPackages: customerInfo.pendingDeliveryPackages.length
        },
        interactionId: deadlineInteractionId,
        wasEscalated: false
      };

      console.log('⏰ RESPUESTA DE PLAZO DE ENTREGA ENVIADA - Información completa proporcionada');
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 📦 QUINTA PRIORIDAD: Detectar consultas sobre dónde enviar paquetes (solo si no es múltiple)
    const packageShippingResponse = generatePackageShippingResponse(customerInfo, message, destinationAddresses);
    if (packageShippingResponse) {
      console.log('📦 CONSULTA/RESPUESTA DE ENVÍO detectada - Proporcionando información contextual');
      
      const responseTime = Date.now() - startTime;

      // Store interaction
      let packageShippingInteractionId: string | null = null;
      try {
        const { data: packageShippingInteractionData, error: insertError } = await supabase
          .from('ai_chat_interactions')
          .insert({
            customer_id: actualCustomerId || null,
            customer_phone: customerPhone,
            user_message: message,
            ai_response: packageShippingResponse,
            context_info: {
              customerFound: customerInfo.customerFound,
              packagesCount: customerInfo.packagesCount,
              wasEscalated: false,
              isPackageShippingInquiry: true,
              botAlwaysResponds: true
            },
            response_time_ms: responseTime,
            was_fallback: false
          })
          .select()
          .single();

        if (!insertError && packageShippingInteractionData) {
          packageShippingInteractionId = packageShippingInteractionData.id;
          await updateLearningModel(supabase, packageShippingInteractionId, customerPhone, message, packageShippingResponse);
        }
      } catch (storeError) {
        console.error('❌ Error storing interaction:', storeError);
      }

      const result: AIResponseResult = {
        response: packageShippingResponse,
        hasPackageInfo: customerInfo.packagesCount > 0,
        isFromFallback: false,
        customerInfo: {
          found: customerInfo.customerFound,
          name: customerInfo.customerFirstName,
          pendingAmount: customerInfo.totalPending,
          pendingPackages: customerInfo.pendingPaymentPackages.length,
          transitPackages: customerInfo.pendingDeliveryPackages.length
        },
        interactionId: packageShippingInteractionId,
        wasEscalated: false
      };

      console.log('📦 RESPUESTA DE ENVÍO ENVIADA - Información contextual proporcionada');
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 🏠 SEXTA PRIORIDAD: Detectar solicitudes de entrega a domicilio
    const homeDeliveryResponse = generateHomeDeliveryResponse(customerInfo, message);
    if (homeDeliveryResponse) {
      console.log('🏠 ENTREGA A DOMICILIO detectada - Transfiriendo a Josefa');
      
      const responseTime = Date.now() - startTime;

      // Store interaction
      let homeDeliveryInteractionId: string | null = null;
      try {
        const { data: homeDeliveryInteractionData, error: insertError } = await supabase
          .from('ai_chat_interactions')
          .insert({
            customer_id: actualCustomerId || null,
            customer_phone: customerPhone,
            user_message: message,
            ai_response: homeDeliveryResponse,
            context_info: {
              customerFound: customerInfo.customerFound,
              packagesCount: customerInfo.packagesCount,
              wasEscalated: false,
              isHomeDeliveryRequest: true,
              botAlwaysResponds: true
            },
            response_time_ms: responseTime,
            was_fallback: false
          })
          .select()
          .single();

        if (!insertError && homeDeliveryInteractionData) {
          homeDeliveryInteractionId = homeDeliveryInteractionData.id;
          await updateLearningModel(supabase, homeDeliveryInteractionId, customerPhone, message, homeDeliveryResponse);
        }
      } catch (storeError) {
        console.error('❌ Error storing interaction:', storeError);
      }

      const result: AIResponseResult = {
        response: homeDeliveryResponse,
        hasPackageInfo: customerInfo.packagesCount > 0,
        isFromFallback: false,
        customerInfo: {
          found: customerInfo.customerFound,
          name: customerInfo.customerFirstName,
          pendingAmount: customerInfo.totalPending,
          pendingPackages: customerInfo.pendingPaymentPackages.length,
          transitPackages: customerInfo.pendingDeliveryPackages.length
        },
        interactionId: homeDeliveryInteractionId,
        wasEscalated: false
      };

      console.log('🏠 RESPUESTA DE ENTREGA A DOMICILIO ENVIADA - Josefa coordinará');
      
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get additional context data
    const freightRates = await getActiveFreightRates(supabase);
    
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

      if (!insertError && interactionData) {
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
