
import { getCustomerInfo } from './customerService.ts';
import { buildSystemPrompt, buildConversationContext } from './promptBuilder.ts';
import { callOpenAI } from './openaiService.ts';
import { generateFallbackResponse } from './fallbackResponses.ts';
import { validatePackageDeliveryTiming, generateBusinessIntelligentResponse, generateHomeDeliveryResponse } from './businessLogic.ts';
import { buildLearningContext, enhancePromptWithLearning } from './learningSystem.ts';
import { getActiveFreightRates } from './freightRatesService.ts';
import { getUpcomingTripsByDestination, formatTripsForPrompt, shouldQueryTrips } from './tripScheduleService.ts';
import { getDestinationAddresses, formatAddressesForPrompt } from './destinationAddressService.ts';
import { getSecureConversationHistory } from './conversationHistoryService.ts';

export interface ResponseGenerationResult {
  response: string;
  wasFallback: boolean;
  isHomeDeliveryRequest: boolean;
  responseTime: number;
  tripsInfo?: {
    destination: string;
    tripsFound: number;
    nextTripDate: string | null;
  };
}

export async function generateAIResponse(
  supabase: any,
  message: string,
  customerPhone: string,
  customerId?: string,
  openAIApiKey?: string
): Promise<ResponseGenerationResult> {
  const startTime = Date.now();

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

  // 🏠 PRIORIDAD MÁXIMA: Detectar solicitudes de entrega a domicilio
  const homeDeliveryResponse = generateHomeDeliveryResponse(customerInfo, message);
  if (homeDeliveryResponse) {
    console.log('🏠 ENTREGA A DOMICILIO detectada - Transfiriendo a Josefa');
    
    const responseTime = Date.now() - startTime;
    return {
      response: homeDeliveryResponse,
      wasFallback: false,
      isHomeDeliveryRequest: true,
      responseTime
    };
  }

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
  
  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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

  return {
    response: aiResponse,
    wasFallback,
    isHomeDeliveryRequest: false,
    responseTime,
    tripsInfo: tripQuery.shouldQuery ? {
      destination: tripQuery.destination,
      tripsFound: upcomingTrips.length,
      nextTripDate: upcomingTrips.length > 0 ? upcomingTrips[0].trip_date : null
    } : undefined
  };
}
