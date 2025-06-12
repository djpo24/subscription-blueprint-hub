
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCustomerInfo } from './customerService.ts';
import { buildSystemPrompt, buildConversationContext } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { generateFallbackResponse } from './fallbackResponses.ts';
import { validatePackageDeliveryTiming, generateBusinessIntelligentResponse } from './businessLogic.ts';
import { buildLearningContext, enhancePromptWithLearning, updateLearningModel } from './learningSystem.ts';
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
    
    console.log('🤖 AI Response Request (Enhanced with Context):', { message, customerPhone, customerId });
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
    const { customerInfo, actualCustomerId } = await getCustomerInfo(
      supabase, 
      customerPhone, 
      customerId
    );

    // Get recent conversation history for context
    const recentMessages = await getRecentConversationHistory(supabase, customerPhone, actualCustomerId);
    console.log('💬 Retrieved conversation history:', recentMessages?.length || 0, 'messages');

    // Validate business logic (packages timing)
    const validationResult = validatePackageDeliveryTiming(customerInfo);
    console.log('🔍 Business validation:', validationResult);

    // Build learning context for adaptive responses
    const learningContext = buildLearningContext(customerInfo);

    // Create enhanced system prompt with conversation context
    const basePrompt = buildSystemPrompt(customerInfo);
    const conversationContext = buildConversationContext(recentMessages, customerInfo.customerFirstName);
    const enhancedPrompt = enhancePromptWithLearning(basePrompt + conversationContext, learningContext);

    // Add business intelligence insights
    const businessInsight = generateBusinessIntelligentResponse(customerInfo);
    const contextualMessage = businessInsight ? `${message}\n\nContexto adicional: ${businessInsight}` : message;

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
      
      console.log('✅ Enhanced AI Response with context generated successfully');
    } catch (error) {
      console.error('❌ OpenAI Error:', error.message);
      wasFallback = true;
      aiResponse = generateFallbackResponse(customerInfo);
    }

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Store the interaction in the database for learning purposes
    try {
      const { data: interactionData, error: insertError } = await supabase
        .from('ai_chat_interactions')
        .insert({
          customer_id: actualCustomerId || null,
          customer_phone: customerPhone,
          user_message: message,
          ai_response: aiResponse,
          context_info: {
            ...customerInfo,
            businessValidation: validationResult,
            learningContext: learningContext,
            conversationHistory: recentMessages?.slice(-3) // Store last 3 messages for analysis
          },
          response_time_ms: responseTime,
          was_fallback: wasFallback
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error storing interaction:', insertError);
      } else {
        console.log('✅ Enhanced interaction with context stored for learning');
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

    console.log('🎯 Enhanced response with conversation context delivered:', {
      hasBusinessValidation: !validationResult.isValid,
      hasLearningContext: true,
      hasConversationContext: recentMessages?.length > 0,
      responseTime: responseTime + 'ms'
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced ai-whatsapp-response:', error);
    
    // Enhanced fallback response with human-like touch
    const fallbackResponse = `¡Hola! 😊

Estoy teniendo algunos problemas técnicos en este momento.

🙏 Pero no te preocupes, un miembro de nuestro equipo te contactará muy pronto para ayudarte.

Si tienes el número de tracking de tu encomienda, compártelo para acelerar la atención. 📦

¡Gracias por tu paciencia! 🌟`;
    
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

async function getRecentConversationHistory(supabase: any, customerPhone: string, customerId?: string) {
  try {
    // Get recent incoming messages (from customer)
    const { data: incomingMessages, error: incomingError } = await supabase
      .from('incoming_messages')
      .select('message_content, timestamp')
      .eq('from_phone', customerPhone)
      .order('timestamp', { ascending: false })
      .limit(10);

    if (incomingError) {
      console.error('Error fetching incoming messages for context:', incomingError);
    }

    // Get recent sent messages (from SARA)
    const { data: sentMessages, error: sentError } = await supabase
      .from('sent_messages')
      .select('message, sent_at')
      .eq('phone', customerPhone)
      .order('sent_at', { ascending: false })
      .limit(10);

    if (sentError) {
      console.error('Error fetching sent messages for context:', sentError);
    }

    // Combine and sort by timestamp
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

    // Sort by timestamp (most recent first) and return last 8 messages
    return allMessages
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)
      .reverse(); // Reverse to get chronological order for context

  } catch (error) {
    console.error('Error building conversation context:', error);
    return [];
  }
}
