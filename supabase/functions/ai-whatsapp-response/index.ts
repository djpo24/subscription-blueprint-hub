import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCustomerInfo } from './customerService.ts';
import { buildSystemPrompt, buildConversationContext } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { generateFallbackResponse } from './fallbackResponses.ts';
import { validatePackageDeliveryTiming, generateBusinessIntelligentResponse, generateHomeDeliveryResponse, generatePackageOriginClarificationResponse, generateTripScheduleResponse, detectDestinationResponseAfterTripInquiry, generateTripDatesAfterDestinationResponse, analyzeConversationContext } from './businessLogic.ts';
import { generatePackageShippingResponse, generatePackageDeliveryDeadlineResponse, generateIntegratedPackageResponse, generateTripDateResponse } from './packageInquiryService.ts';
import { buildLearningContext, enhancePromptWithLearning, updateLearningModel } from './learningSystem.ts';
import { getActiveFreightRates } from './freightRatesService.ts';
import { getUpcomingTripsByDestination, formatTripsForPrompt, shouldQueryTrips } from './tripScheduleService.ts';
import { getDestinationAddresses, formatAddressesForPrompt } from './destinationAddressService.ts';
import { verifyAndImproveResponse } from './responseVerificationService.ts';
import { getCurrentDateContext, getNextBusinessDay, formatPickupDateResponse } from './dateContextService.ts';
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
    
    console.log('🤖 BOT ANTI-DUPLICADO CON VERIFICACIÓN Y FECHA ACTUAL - Sistema activado:', { 
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
      verificationEnabled: true,
      dateContextEnabled: true,
      antiDuplicateSystem: true
    });

    // Get current date context - CRÍTICO PARA FECHAS FUTURAS
    const currentDateContext = getCurrentDateContext();
    console.log('📅 Contexto de fecha actual agregado al sistema');

    // Get destination addresses for shipping inquiries
    const destinationAddresses = await getDestinationAddresses(supabase);

    // Get upcoming trips for all inquiries
    const allUpcomingTrips = await getUpcomingTripsByDestination(supabase);

    // Get conversation history for context
    const recentMessages = await getSecureConversationHistory(supabase, customerPhone, actualCustomerId);

    // 🔥 SISTEMA ANTI-DUPLICADO: Cada consulta debe procesarse UNA SOLA VEZ en orden de prioridad

    // 🎯 PRIMERA PRIORIDAD: Analizar contexto de conversación para respuestas inteligentes
    const contextualAnalysis = analyzeConversationContext(message, recentMessages);
    if (contextualAnalysis.isContextualResponse && contextualAnalysis.suggestedResponse) {
      console.log('🧠 [PRIORITY-1] RESPUESTA CONTEXTUAL INTELIGENTE detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        contextualAnalysis.suggestedResponse,
        customerInfo,
        startTime,
        'contextual_intelligent_response'
      );
    }

    // 🎯 SEGUNDA PRIORIDAD: Detectar respuesta de destino después de consulta de fechas de viajes
    const destinationResponseCheck = detectDestinationResponseAfterTripInquiry(message, recentMessages);
    if (destinationResponseCheck.isDestinationResponse && destinationResponseCheck.shouldShowTripDates) {
      const tripDatesResponse = generateTripDatesAfterDestinationResponse(customerInfo, message, allUpcomingTrips);
      if (tripDatesResponse) {
        console.log('📅 [PRIORITY-2] RESPUESTA DE DESTINO CON FECHAS detectada - UNA SOLA RESPUESTA');
        
        return await generateSingleResponse(
          supabase, 
          actualCustomerId, 
          customerPhone, 
          message, 
          tripDatesResponse,
          customerInfo,
          startTime,
          'destination_response_with_trip_dates'
        );
      }
    }

    // 🎯 TERCERA PRIORIDAD: Detectar consultas sobre fechas de viajes (ANTES que encomiendas)
    const tripScheduleResponse = generateTripScheduleResponse(customerInfo, message);
    if (tripScheduleResponse) {
      console.log('📅 [PRIORITY-3] CONSULTA DE FECHAS DE VIAJES detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        tripScheduleResponse,
        customerInfo,
        startTime,
        'trip_schedule_inquiry'
      );
    }

    // 🎯 CUARTA PRIORIDAD: Detectar consultas sobre encomiendas específicas - ANÁLISIS INTELIGENTE
    const packageClarificationResponse = generatePackageOriginClarificationResponse(customerInfo, message);
    if (packageClarificationResponse) {
      console.log('📦 [PRIORITY-4] CONSULTA DE ENCOMIENDA ESPECÍFICA detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        packageClarificationResponse,
        customerInfo,
        startTime,
        'intelligent_package_inquiry'
      );
    }

    // 🎯 QUINTA PRIORIDAD: Detectar consultas integradas con múltiples preguntas
    const integratedResponse = generateIntegratedPackageResponse(customerInfo, message, allUpcomingTrips, destinationAddresses);
    if (integratedResponse) {
      console.log('🎯 [PRIORITY-5] CONSULTA MÚLTIPLE INTEGRADA detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        integratedResponse,
        customerInfo,
        startTime,
        'integrated_multiple_inquiry'
      );
    }

    // 📅 SEXTA PRIORIDAD: Detectar consultas específicas sobre fechas de viajes
    const tripDateResponse = generateTripDateResponse(customerInfo, message, allUpcomingTrips);
    if (tripDateResponse) {
      console.log('📅 [PRIORITY-6] CONSULTA DE FECHAS DE VIAJES detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        tripDateResponse,
        customerInfo,
        startTime,
        'trip_date_inquiry'
      );
    }

    // 🚨 SÉPTIMA PRIORIDAD: Detectar consultas sobre plazos de entrega de paquetes (solo si no es múltiple)
    const packageDeadlineResponse = generatePackageDeliveryDeadlineResponse(customerInfo, message, allUpcomingTrips);
    if (packageDeadlineResponse) {
      console.log('⏰ [PRIORITY-7] CONSULTA DE PLAZO DE ENTREGA detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        packageDeadlineResponse,
        customerInfo,
        startTime,
        'package_deadline_inquiry'
      );
    }

    // 📦 OCTAVA PRIORIDAD: Detectar consultas sobre dónde enviar paquetes (solo si no es múltiple)
    const packageShippingResponse = generatePackageShippingResponse(customerInfo, message, destinationAddresses);
    if (packageShippingResponse) {
      console.log('📦 [PRIORITY-8] CONSULTA/RESPUESTA DE ENVÍO detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        packageShippingResponse,
        customerInfo,
        startTime,
        'package_shipping_inquiry'
      );
    }

    // 🏠 NOVENA PRIORIDAD: Detectar solicitudes de entrega a domicilio
    const homeDeliveryResponse = generateHomeDeliveryResponse(customerInfo, message);
    if (homeDeliveryResponse) {
      console.log('🏠 [PRIORITY-9] ENTREGA A DOMICILIO detectada - UNA SOLA RESPUESTA');
      
      return await generateSingleResponse(
        supabase, 
        actualCustomerId, 
        customerPhone, 
        message, 
        homeDeliveryResponse,
        customerInfo,
        startTime,
        'home_delivery_request'
      );
    }

    // 🤖 ÚLTIMA PRIORIDAD: Si ninguna regla específica aplica, usar IA general
    console.log('🤖 [PRIORITY-FINAL] Ninguna regla específica aplicó - Procesando con IA general');

    // Get additional context data
    const freightRates = await getActiveFreightRates(supabase);
    
    const tripQuery = shouldQueryTrips(message);
    let upcomingTrips: any[] = [];
    let tripsContext = '';
    
    if (tripQuery.shouldQuery) {
      upcomingTrips = await getUpcomingTripsByDestination(supabase, tripQuery.destination);
      tripsContext = formatTripsForPrompt(upcomingTrips, tripQuery.destination);
    }

    const validationResult = validatePackageDeliveryTiming(customerInfo);
    const learningContext = buildLearningContext(customerInfo);
    const addressesContext = formatAddressesForPrompt(destinationAddresses);

    // Crear prompt para el bot CON CONTEXTO DE FECHA ACTUAL
    const basePrompt = buildSystemPrompt(customerInfo, freightRates, tripsContext, addressesContext);
    const conversationContext = buildConversationContext(recentMessages, customerInfo.customerFirstName);
    
    // AGREGAR CONTEXTO DE FECHA ACTUAL AL PROMPT
    const enhancedPromptWithDate = `${basePrompt}

${currentDateContext}

${conversationContext}`;
    
    const finalPrompt = enhancePromptWithLearning(enhancedPromptWithDate, learningContext);

    const businessInsight = generateBusinessIntelligentResponse(customerInfo);
    const contextualMessage = businessInsight ? `${message}\n\nContexto específico del cliente: ${businessInsight}` : message;

    let finalResponse: string;
    let wasFallback = false;
    let wasVerified = false;
    let verificationResult: any = null;
    let interactionId: string | null = null;
    
    try {
      console.log('🤖 PASO 1: Generando respuesta inicial con OpenAI (incluye contexto de fecha actual)...');
      const initialResponse = await callOpenAI(finalPrompt, contextualMessage, openAIApiKey);
      
      console.log('🔍 PASO 2: Verificando respuesta generada...');
      verificationResult = await verifyAndImproveResponse(
        initialResponse,
        message,
        customerInfo,
        openAIApiKey
      );
      
      // Decidir qué respuesta usar
      if (verificationResult.isApproved) {
        finalResponse = initialResponse;
        console.log(`✅ VERIFICACIÓN APROBADA: Confianza ${verificationResult.confidence}% - Usando respuesta original`);
      } else {
        finalResponse = verificationResult.improvedResponse || initialResponse;
        console.log(`🔧 VERIFICACIÓN RECHAZADA: Confianza ${verificationResult.confidence}% - Usando respuesta mejorada`);
        console.log(`🚨 Problemas encontrados: ${verificationResult.issues.join(', ')}`);
      }
      
      wasVerified = true;
      
      if (!validationResult.isValid) {
        finalResponse = `${validationResult.message}\n\n${finalResponse}`;
      }

      console.log('✅ Respuesta final lista después de verificación con contexto de fecha actual');
      
    } catch (error) {
      console.error('❌ Error en generación/verificación - Usando respuesta de emergencia:', error.message);
      
      // Si OpenAI falla, usar respuesta de emergencia pero NUNCA escalar
      finalResponse = generateFallbackResponse(customerInfo);
      wasFallback = true;
      wasVerified = false;
      
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
          ai_response: finalResponse,
          context_info: {
            customerFound: customerInfo.customerFound,
            packagesCount: customerInfo.packagesCount,
            wasEscalated: false, // NUNCA escalado
            verificationEnabled: true,
            dateContextEnabled: true, // NUEVO: contexto de fecha habilitado
            antiDuplicateSystem: true, // NUEVO: sistema anti-duplicado
            verificationResult: wasVerified ? {
              approved: verificationResult?.isApproved,
              confidence: verificationResult?.confidence,
              issues: verificationResult?.issues,
              wasImproved: !verificationResult?.isApproved
            } : null,
            escalationDisabled: true
          },
          response_time_ms: responseTime,
          was_fallback: wasFallback
        })
        .select()
        .single();

      if (!insertError && interactionData) {
        interactionId = interactionData.id;
        await updateLearningModel(supabase, interactionId, customerPhone, message, finalResponse);
      }
    } catch (storeError) {
      console.error('❌ Error storing interaction:', storeError);
    }

    const result: AIResponseResult = {
      response: finalResponse,
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

    console.log('🤖 RESPUESTA ÚNICA ENTREGADA CON VERIFICACIÓN Y CONTEXTO DE FECHA:', {
      wasEscalated: false,
      wasVerified: wasVerified,
      verificationApproved: verificationResult?.isApproved,
      verificationConfidence: verificationResult?.confidence,
      responseTime: responseTime + 'ms',
      dateContextEnabled: true,
      antiDuplicateSystemEnabled: true,
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

// FUNCIÓN HELPER ANTI-DUPLICADO: Generar una sola respuesta y terminar
async function generateSingleResponse(
  supabase: any,
  actualCustomerId: string | null,
  customerPhone: string,
  message: string,
  response: string,
  customerInfo: any,
  startTime: number,
  responseType: string
): Promise<Response> {
  const responseTime = Date.now() - startTime;

  // Store interaction
  let interactionId: string | null = null;
  try {
    const { data: interactionData, error: insertError } = await supabase
      .from('ai_chat_interactions')
      .insert({
        customer_id: actualCustomerId || null,
        customer_phone: customerPhone,
        user_message: message,
        ai_response: response,
        context_info: {
          customerFound: customerInfo.customerFound,
          packagesCount: customerInfo.packagesCount,
          wasEscalated: false,
          responseType: responseType,
          verificationEnabled: true,
          verificationPassed: true,
          dateContextEnabled: true,
          antiDuplicateSystem: true
        },
        response_time_ms: responseTime,
        was_fallback: false
      })
      .select()
      .single();

    if (!insertError && interactionData) {
      interactionId = interactionData.id;
      await updateLearningModel(supabase, interactionId, customerPhone, message, response);
    }
  } catch (storeError) {
    console.error('❌ Error storing interaction:', storeError);
  }

  const result: AIResponseResult = {
    response: response,
    hasPackageInfo: customerInfo.packagesCount > 0,
    isFromFallback: false,
    customerInfo: {
      found: customerInfo.customerFound,
      name: customerInfo.customerFirstName,
      pendingAmount: customerInfo.totalPending,
      pendingPackages: customerInfo.pendingPaymentPackages.length,
      transitPackages: customerInfo.pendingDeliveryPackages.length
    },
    interactionId: interactionId,
    wasEscalated: false
  };

  console.log(`✅ [${responseType.toUpperCase()}] RESPUESTA ÚNICA ENVIADA - Sistema anti-duplicado funcionando`);
  
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ... keep existing code (getSecureConversationHistory function)
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
