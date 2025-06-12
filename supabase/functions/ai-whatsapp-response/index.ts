
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCustomerInfo } from './customerService.ts';
import { buildSystemPrompt } from './promptBuilder.ts';
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
    
    console.log('🤖 AI Response Request (Enhanced):', { message, customerPhone, customerId });
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

    // Validate business logic (packages timing)
    const validationResult = validatePackageDeliveryTiming(customerInfo);
    console.log('🔍 Business validation:', validationResult);

    // Build learning context for adaptive responses
    const learningContext = buildLearningContext(customerInfo);

    // Create enhanced system prompt with learning
    const basePrompt = buildSystemPrompt(customerInfo);
    const enhancedPrompt = enhancePromptWithLearning(basePrompt, learningContext);

    // Add business intelligence insights only if timing validation failed
    const businessInsight = !validationResult.isValid ? generateBusinessIntelligentResponse(customerInfo) : '';
    const contextualMessage = businessInsight ? `${message}\n\nContexto adicional: ${businessInsight}` : message;

    // Try to get AI response with enhanced prompt
    let aiResponse: string;
    let wasFallback = false;
    let interactionId: string | null = null;
    
    try {
      aiResponse = await callOpenAI(enhancedPrompt, contextualMessage, openAIApiKey);
      
      // Add business validation warning ONLY if timing is invalid AND it's relevant to the message
      if (!validationResult.isValid && (
        message.toLowerCase().includes('viaje') ||
        message.toLowerCase().includes('fecha') ||
        message.toLowerCase().includes('envio') ||
        message.toLowerCase().includes('encomienda')
      )) {
        aiResponse = `${validationResult.message}\n\n${aiResponse}`;
      }
      
      console.log('✅ Enhanced AI Response generated successfully');
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
            learningContext: learningContext
          },
          response_time_ms: responseTime,
          was_fallback: wasFallback
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error storing interaction:', insertError);
      } else {
        console.log('✅ Enhanced interaction stored for learning');
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

    console.log('🎯 Enhanced response delivered:', {
      hasBusinessValidation: !validationResult.isValid,
      hasLearningContext: true,
      responseTime: responseTime + 'ms'
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in enhanced ai-whatsapp-response:', error);
    
    // Simple fallback response without predetermined content
    const fallbackResponse = `Disculpa, estoy teniendo dificultades técnicas en este momento. Un miembro de nuestro equipo te contactará pronto para ayudarte.`;
    
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
