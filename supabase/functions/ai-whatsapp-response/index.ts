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
import { 
  createEscalationRequest, 
  checkForAdminResponse, 
  shouldEscalateToAdmin, 
  generateCustomerNotificationMessage 
} from './escalationService.ts';
import { notifyAdminOfEscalation } from './adminNotificationService.ts';
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
    
    console.log('🔥 SISTEMA RADICAL ACTIVADO:', { 
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

    // 🔍 Verificar si hay una respuesta del administrador pendiente
    const adminResponse = await checkForAdminResponse(supabase, customerPhone);
    if (adminResponse) {
      console.log('✅ Respuesta del admin encontrada, enviando al cliente');
      
      const result: AIResponseResult = {
        response: adminResponse,
        hasPackageInfo: false,
        isFromFallback: false,
        customerInfo: {
          found: false,
          name: '',
          pendingAmount: 0,
          pendingPackages: 0,
          transitPackages: 0
        },
        interactionId: null,
        isAdminResponse: true
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get customer information
    const { customerInfo, actualCustomerId } = await getCustomerInfo(
      supabase, 
      customerPhone, 
      customerId
    );

    console.log('🔐 ANÁLISIS RADICAL DEL CLIENTE:', {
      customerFound: customerInfo.customerFound,
      packagesCount: customerInfo.packagesCount,
      hasSpecificData: customerInfo.pendingPaymentPackages.length > 0 || customerInfo.pendingDeliveryPackages.length > 0
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

    // DECISIÓN RADICAL: Si no hay información específica, escalar inmediatamente
    const hasSpecificInfo = customerInfo.customerFound && customerInfo.packagesCount > 0;
    
    if (!hasSpecificInfo) {
      console.log('🚨 ESCALACIÓN INMEDIATA - SIN INFORMACIÓN ESPECÍFICA');
      
      const customerName = customerInfo.customerFirstName || 'Cliente';
      const escalationId = await createEscalationRequest(
        supabase,
        customerPhone,
        customerName,
        message
      );

      if (escalationId) {
        const notificationSent = await notifyAdminOfEscalation(
          supabase,
          escalationId,
          customerName,
          message
        );

        if (notificationSent) {
          const customerNotification = generateCustomerNotificationMessage(customerName);
          
          const result: AIResponseResult = {
            response: customerNotification,
            hasPackageInfo: false,
            isFromFallback: false,
            customerInfo: {
              found: false,
              name: customerName,
              pendingAmount: 0,
              pendingPackages: 0,
              transitPackages: 0
            },
            interactionId: null,
            wasEscalated: true
          };

          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Crear prompt radical solo con información específica
    const basePrompt = buildSystemPrompt(customerInfo, freightRates, tripsContext, addressesContext);
    const conversationContext = buildConversationContext(recentMessages, customerInfo.customerFirstName);
    const enhancedPrompt = enhancePromptWithLearning(basePrompt + conversationContext, learningContext);

    const businessInsight = generateBusinessIntelligentResponse(customerInfo);
    const contextualMessage = businessInsight ? `${message}\n\nContexto específico del cliente: ${businessInsight}` : message;

    let aiResponse: string;
    let wasFallback = false;
    let interactionId: string | null = null;
    let wasEscalated = false;
    
    try {
      aiResponse = await callOpenAI(enhancedPrompt, contextualMessage, openAIApiKey);
      
      if (!validationResult.isValid) {
        aiResponse = `${validationResult.message}\n\n${aiResponse}`;
      }

      // EVALUACIÓN RADICAL: Verificar si debe escalar
      if (shouldEscalateToAdmin(message, aiResponse, customerInfo)) {
        console.log('🚨 ESCALACIÓN AUTOMÁTICA ACTIVADA - IA NO TIENE INFORMACIÓN ESPECÍFICA');
        
        const customerName = customerInfo.customerFirstName || 'Cliente';
        const escalationId = await createEscalationRequest(
          supabase,
          customerPhone,
          customerName,
          message
        );

        if (escalationId) {
          const notificationSent = await notifyAdminOfEscalation(
            supabase,
            escalationId,
            customerName,
            message
          );

          if (notificationSent) {
            aiResponse = generateCustomerNotificationMessage(customerName);
            wasEscalated = true;
            console.log('✅ ESCALACIÓN AUTOMÁTICA EXITOSA');
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error OpenAI - ESCALACIÓN DE EMERGENCIA:', error.message);
      
      // ESCALACIÓN DE EMERGENCIA cuando OpenAI falla
      const customerName = customerInfo.customerFirstName || 'Cliente';
      const escalationId = await createEscalationRequest(
        supabase,
        customerPhone,
        customerName,
        `ERROR TÉCNICO - Mensaje original: ${message}`
      );

      if (escalationId) {
        await notifyAdminOfEscalation(supabase, escalationId, customerName, message);
        aiResponse = generateCustomerNotificationMessage(customerName);
        wasEscalated = true;
        wasFallback = true;
      } else {
        aiResponse = generateFallbackResponse(customerInfo);
        wasFallback = true;
      }
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
            wasEscalated: wasEscalated,
            radicalModeActive: true,
            hasSpecificInfo: hasSpecificInfo
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
      wasEscalated: wasEscalated
    };

    console.log('🔥 RESPUESTA RADICAL ENTREGADA:', {
      wasEscalated: wasEscalated,
      hasSpecificInfo: hasSpecificInfo,
      responseTime: responseTime + 'ms',
      radicalModeActive: true
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error crítico en sistema radical:', error);
    
    const emergencyResponse = `🚨 Error técnico crítico detectado.

Un especialista de Envíos Ojito le contactará inmediatamente para resolver su consulta.

Disculpe las molestias. 🙏`;
    
    return new Response(JSON.stringify({ 
      error: error.message,
      response: emergencyResponse,
      isFromFallback: true,
      wasEscalated: true
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
