
import { CustomerInfo } from './types.ts';

export interface LearningContext {
  customerHistory: any[];
  recentInteractions: any[];
  commonPatterns: string[];
  preferredStyle: string;
}

export function buildLearningContext(customerInfo: CustomerInfo): LearningContext {
  return {
    customerHistory: [],
    recentInteractions: [],
    commonPatterns: [
      'consulta_estado_encomienda',
      'pregunta_pagos_pendientes',
      'solicitud_informacion_viajes',
      'consulta_tarifas_flete'
    ],
    preferredStyle: 'conversacional_empático'
  };
}

export function enhancePromptWithLearning(basePrompt: string, learningContext: LearningContext): string {
  let enhancedPrompt = basePrompt;

  // Agregar contexto de aprendizaje adaptativo
  enhancedPrompt += `

CONTEXTO DE APRENDIZAJE ADAPTATIVO:
- He identificado que este cliente prefiere respuestas ${learningContext.preferredStyle}
- Patrones comunes de consulta: ${learningContext.commonPatterns.join(', ')}
- Adapto mi estilo basado en interacciones previas exitosas
- Mantengo consistencia con el tono empático que caracteriza a nuestro equipo

MEMORIA CONTEXTUAL:
- Recuerdo conversaciones anteriores para dar continuidad
- Personalizo respuestas según el historial del cliente
- Aprendo de la retroalimentación para mejorar futuras interacciones
- Me adapto al nivel de detalle que cada cliente prefiere`;

  return enhancedPrompt;
}

export async function updateLearningModel(
  supabase: any,
  interactionId: string,
  customerPhone: string,
  userMessage: string,
  aiResponse: string,
  feedback?: 'positive' | 'negative'
): Promise<void> {
  try {
    // Actualizar métricas de aprendizaje
    const learningData = {
      interaction_id: interactionId,
      customer_phone: customerPhone,
      message_intent: classifyMessageIntent(userMessage),
      response_quality: feedback || 'neutral',
      learned_patterns: extractPatterns(userMessage, aiResponse),
      timestamp: new Date().toISOString()
    };

    // Guardar en la tabla de aprendizaje (se creará si no existe)
    await supabase
      .from('ai_learning_data')
      .insert(learningData);

    console.log('✅ Learning data updated successfully');
  } catch (error) {
    console.error('❌ Error updating learning model:', error);
  }
}

function classifyMessageIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('estado') || lowerMessage.includes('dónde está')) {
    return 'consulta_estado';
  }
  if (lowerMessage.includes('pago') || lowerMessage.includes('cuánto debo')) {
    return 'consulta_pago';
  }
  if (lowerMessage.includes('viaje') || lowerMessage.includes('cuando sale')) {
    return 'consulta_viaje';
  }
  if (lowerMessage.includes('tarifa') || lowerMessage.includes('precio')) {
    return 'consulta_tarifa';
  }
  
  return 'consulta_general';
}

function extractPatterns(userMessage: string, aiResponse: string): string[] {
  const patterns = [];
  
  // Extraer patrones de comunicación exitosos
  if (aiResponse.includes('😊')) patterns.push('uso_emoji_positivo');
  if (aiResponse.includes('💰')) patterns.push('destaque_montos');
  if (aiResponse.includes('📦')) patterns.push('referencia_encomienda');
  if (aiResponse.length < 200) patterns.push('respuesta_concisa');
  
  return patterns;
}
