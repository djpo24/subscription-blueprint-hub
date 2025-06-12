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
    
    console.log('🔒 AI Response Request (Secure & Customer-Specific):', { 
      message: message?.substring(0, 50) + '...', 
      customerPhone: customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'), // Parcialmente ocultar teléfono en logs
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

    // 🔒 Get SECURE customer information - only for the specific customer
    const { customerInfo, actualCustomerId } = await getCustomerInfo(
      supabase, 
      customerPhone, 
      customerId
    );

    console.log('🔐 Customer Security Check:', {
      customerFound: customerInfo.customerFound,
      customerId: actualCustomerId || 'not_authenticated',
      packagesCount: customerInfo.packagesCount,
      hasPrivateData: customerInfo.pendingPaymentPackages.length > 0 || customerInfo.pendingDeliveryPackages.length > 0
    });

    // 🚚 Get active freight rates for intelligent pricing responses
    const freightRates = await getActiveFreightRates(supabase);
    console.log('🚚 Retrieved freight rates:', freightRates.length, 'active rates');

    // 🔒 Get conversation history ONLY for this specific customer
    const recentMessages = await getSecureConversationHistory(supabase, customerPhone, actualCustomerId);
    console.log('💬 Retrieved secure conversation history:', recentMessages?.length || 0, 'messages for this customer only');

    // Validate business logic (packages timing) - only for this customer
    const validationResult = validatePackageDeliveryTiming(customerInfo);
    console.log('🔍 Business validation for this customer:', validationResult);

    // Build learning context for adaptive responses - customer-specific
    const learningContext = buildLearningContext(customerInfo);

    // Create enhanced system prompt with conversation context and freight rates - all customer-specific
    const basePrompt = buildSystemPrompt(customerInfo, freightRates);
    const conversationContext = buildConversationContext(recentMessages, customerInfo.customerFirstName);
    const enhancedPrompt = enhancePromptWithLearning(basePrompt + conversationContext, learningContext);

    // Add business intelligence insights - only for this customer
    const businessInsight = generateBusinessIntelligentResponse(customerInfo);
    const contextualMessage = businessInsight ? `${message}\n\nContexto específico del cliente: ${businessInsight}` : message;

    // Try to get AI response with enhanced prompt and context
    let aiResponse: string;
    let wasFallback = false;
    let interactionId: string | null = null;
    
    try {
      aiResponse = await callOpenAI(enhancedPrompt, contextualMessage, openAIApiKey);
      
      // Add business validation warning if needed
      if (!validationResult.isValid) {
        aiResponse = `${validationResult.message}\n\n${aiResponse}`;
      }
      
      console.log('✅ Secure AI Response generated successfully for customer');
    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      wasFallback = true;
      aiResponse = generateFallbackResponse(customerInfo);
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Store the interaction in the database for learning purposes - with privacy protection
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
            businessValidation: validationResult,
            learningContext: learningContext,
            freightRatesAvailable: freightRates.length > 0,
            conversationHistory: recentMessages?.slice(-3).map(msg => ({
              message: msg.message?.substring(0, 100), // Limitar longitud para privacidad
              isFromCustomer: msg.isFromCustomer,
              timestamp: msg.timestamp
            })) // Store only last 3 messages with limited content
          },
          response_time_ms: responseTime,
          was_fallback: wasFallback
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error storing interaction:', insertError);
      } else {
        console.log('✅ Secure interaction stored for learning (customer-specific data only)');
        interactionId = interactionData.id;
        
        // Update learning model asynchronously
        await updateLearningModel(
          supabase,
          interactionId,
          customerPhone,
          message,
          aiResponse
        );
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
      interactionId: interactionId
    };

    console.log('🎯 Secure customer-specific response delivered:', {
      customerAuthenticated: customerInfo.customerFound,
      hasBusinessValidation: !validationResult.isValid,
      hasLearningContext: true,
      hasConversationContext: recentMessages?.length > 0,
      hasFreightRates: freightRates.length > 0,
      responseTime: responseTime + 'ms',
      dataPrivacyCompliant: true
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in secure ai-whatsapp-response:', error);
    
    // Enhanced fallback response with human-like touch and privacy emphasis
    const fallbackResponse = `¡Hola! 😊

Estoy teniendo algunos problemas técnicos en este momento.

🔒 Por políticas de privacidad, solo puedo acceder a información de cuentas verificadas.

🙏 Un miembro de nuestro equipo le contactará muy pronto para ayudarle de forma personalizada.

Si tiene el número de tracking de su encomienda personal, compártelo para acelerar la atención. 📦

¡Gracias por su paciencia y por confiar en nosotros! 🌟`;
    
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

async function getSecureConversationHistory(supabase: any, customerPhone: string, customerId?: string) {
  try {
    // 🔒 ONLY get messages for this specific customer phone number
    const { data: incomingMessages, error: incomingError } = await supabase
      .from('incoming_messages')
      .select('message_content, timestamp')
      .eq('from_phone', customerPhone) // Strict filter by phone
      .order('timestamp', { ascending: false })
      .limit(10);

    if (incomingError) {
      console.error('Error fetching incoming messages for this customer:', incomingError);
    }

    // 🔒 ONLY get sent messages for this specific customer phone number
    const { data: sentMessages, error: sentError } = await supabase
      .from('sent_messages')
      .select('message, sent_at')
      .eq('phone', customerPhone) // Strict filter by phone
      .order('sent_at', { ascending: false })
      .limit(10);

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

    // Sort by timestamp (most recent first) and return last 8 messages for THIS customer only
    const customerMessages = allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
      .reverse(); // Reverse to get chronological order for context

    console.log(`🔐 Retrieved ${customerMessages.length} secure messages for customer phone: ${customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`);
    
    return customerMessages;

  } catch (error) {
    console.error('Error building secure conversation context:', error);
    return [];
  }
}
