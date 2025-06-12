
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import { getCustomerInfo } from './customerService.ts';
import { generateAIResponse } from './responseGenerationService.ts';
import { storeInteraction } from './interactionStorageService.ts';
import { corsHeaders, handleCorsPrelight } from './corsHandler.ts';
import { AIResponseResult } from './types.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCorsPrelight();
  }

  try {
    const { message, customerPhone, customerId } = await req.json();
    
    console.log('🤖 BOT RESPONDE SIEMPRE - Sistema activado:', { 
      message: message?.substring(0, 50) + '...', 
      customerPhone: customerPhone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
      customerId: customerId || 'not_provided'
    });

    // Initialize Supabase client with enhanced error handling
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase configuration');
      throw new Error('Supabase configuration missing');
    }
    
    console.log('🔗 Initializing Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test database connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError);
      // Continue anyway, but log the issue
    } else {
      console.log('✅ Database connection successful');
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    // Get customer information for result construction
    console.log('👤 Getting customer information...');
    const { customerInfo, actualCustomerId } = await getCustomerInfo(
      supabase, 
      customerPhone, 
      customerId
    );

    // Generate AI response
    console.log('🧠 Generating AI response...');
    const responseResult = await generateAIResponse(
      supabase,
      message,
      customerPhone,
      customerId,
      openAIApiKey
    );

    // Store interaction
    console.log('💾 Storing interaction...');
    const interactionId = await storeInteraction(
      supabase,
      customerPhone,
      actualCustomerId,
      message,
      responseResult.response,
      responseResult.responseTime,
      responseResult.wasFallback,
      responseResult.isHomeDeliveryRequest,
      customerInfo
    );

    const result: AIResponseResult = {
      response: responseResult.response,
      hasPackageInfo: customerInfo.packagesCount > 0,
      isFromFallback: responseResult.wasFallback,
      customerInfo: {
        found: customerInfo.customerFound,
        name: customerInfo.customerFirstName,
        pendingAmount: customerInfo.totalPending,
        pendingPackages: customerInfo.pendingPaymentPackages.length,
        transitPackages: customerInfo.pendingDeliveryPackages.length
      },
      interactionId: interactionId,
      tripsInfo: responseResult.tripsInfo,
      wasEscalated: false // NUNCA escalado
    };

    if (responseResult.isHomeDeliveryRequest) {
      console.log('🏠 RESPUESTA DE ENTREGA A DOMICILIO ENVIADA - Josefa coordinará');
    } else {
      console.log('🤖 RESPUESTA ENTREGADA - BOT SIEMPRE ACTIVO:', {
        wasEscalated: false,
        botAlwaysResponds: true,
        responseTime: responseResult.responseTime + 'ms',
        escalationSystemDisabled: true
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error crítico - Generando respuesta de emergencia:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      name: error.name,
      message: error.message,
      cause: error.cause
    });
    
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
