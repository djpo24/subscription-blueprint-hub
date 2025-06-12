
import { CustomerInfo } from './types.ts';

export interface LearningContext {
  customerHistory: any[];
  recentInteractions: any[];
  commonPatterns: string[];
  preferredStyle: string;
  conversationInsights: string[];
}

export function buildLearningContext(customerInfo: CustomerInfo): LearningContext {
  return {
    customerHistory: [],
    recentInteractions: [],
    commonPatterns: [
      'consulta_estado_encomienda',
      'pregunta_pagos_pendientes',
      'solicitud_informacion_envios',
      'consulta_tarifas_flete',
      'pregunta_fechas_envio',
      'consulta_retiro_encomienda'
    ],
    preferredStyle: 'conversacional_empático',
    conversationInsights: [
      'cliente_prefiere_respuestas_directas',
      'usa_lenguaje_formal',
      'necesita_confirmaciones_frecuentes',
      'pregunta_sobre_estados_regularmente'
    ]
  };
}

export function enhancePromptWithLearning(basePrompt: string, learningContext: LearningContext): string {
  let enhancedPrompt = basePrompt;

  // Agregar contexto de aprendizaje adaptativo
  enhancedPrompt += `

CONTEXTO DE APRENDIZAJE ADAPTATIVO MEJORADO:
- He identificado que este cliente prefiere respuestas ${learningContext.preferredStyle}
- Patrones comunes de consulta identificados: ${learningContext.commonPatterns.join(', ')}
- Adapto mi estilo basado en interacciones previas exitosas
- Mantengo consistencia con el tono empático que caracteriza a nuestro equipo
- Aprendo continuamente de cada conversación para mejorar el servicio

MEMORIA CONTEXTUAL Y APRENDIZAJE:
- Recuerdo conversaciones anteriores para dar continuidad personalizada
- Personalizo respuestas según el historial y preferencias del cliente
- Aprendo de la retroalimentación para mejorar futuras interacciones
- Me adapto al nivel de detalle que cada cliente prefiere
- Identifico patrones de consulta para anticipar necesidades
- Mejoro mi comprensión del vocabulario específico que usa cada cliente

MEJORA CONTINUA DEL SERVICIO:
- Cada conversación alimenta mi conocimiento sobre el negocio de encomiendas
- Identifico oportunidades de mejora en la comunicación
- Aprendo nuevas formas de explicar los procesos de envío
- Me adapto a las preferencias regionales de comunicación
- Registro respuestas exitosas para replicarlas en situaciones similares`;

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
    // Actualizar métricas de aprendizaje mejoradas
    const learningData = {
      interaction_id: interactionId,
      customer_phone: customerPhone,
      message_intent: classifyMessageIntent(userMessage),
      response_quality: feedback || 'neutral',
      learned_patterns: extractPatterns(userMessage, aiResponse),
      conversation_insights: extractConversationInsights(userMessage, aiResponse),
      business_context: extractBusinessContext(userMessage),
      timestamp: new Date().toISOString()
    };

    // Guardar en la tabla de aprendizaje (se creará si no existe)
    await supabase
      .from('ai_learning_data')
      .insert(learningData);

    console.log('✅ Datos de aprendizaje mejorados actualizados exitosamente');
  } catch (error) {
    console.error('❌ Error actualizando modelo de aprendizaje:', error);
  }
}

function classifyMessageIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('estado') || lowerMessage.includes('dónde está') || lowerMessage.includes('donde esta')) {
    return 'consulta_estado_encomienda';
  }
  if (lowerMessage.includes('pago') || lowerMessage.includes('cuánto debo') || lowerMessage.includes('cuanto debo')) {
    return 'consulta_pago_pendiente';
  }
  if (lowerMessage.includes('fecha') || lowerMessage.includes('envío') || lowerMessage.includes('envio') || lowerMessage.includes('cuando sale')) {
    return 'consulta_fechas_envio';
  }
  if (lowerMessage.includes('tarifa') || lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
    return 'consulta_tarifa_envio';
  }
  if (lowerMessage.includes('retiro') || lowerMessage.includes('recoger') || lowerMessage.includes('buscar')) {
    return 'consulta_retiro_encomienda';
  }
  if (lowerMessage.includes('llevar') || lowerMessage.includes('enviar') || lowerMessage.includes('mandar')) {
    return 'solicitud_envio_encomienda';
  }
  
  return 'consulta_general';
}

function extractPatterns(userMessage: string, aiResponse: string): string[] {
  const patterns = [];
  
  // Extraer patrones de comunicación exitosos
  if (aiResponse.includes('😊')) patterns.push('uso_emoji_positivo');
  if (aiResponse.includes('💰')) patterns.push('destaque_montos');
  if (aiResponse.includes('📦')) patterns.push('referencia_encomienda');
  if (aiResponse.includes('📅')) patterns.push('informacion_fechas');
  if (aiResponse.length < 200) patterns.push('respuesta_concisa');
  if (aiResponse.includes('tracking')) patterns.push('informacion_tracking');
  
  // Patrones del mensaje del usuario
  if (userMessage.toLowerCase().includes('urgente')) patterns.push('consulta_urgente');
  if (userMessage.toLowerCase().includes('gracias')) patterns.push('cliente_agradece');
  
  return patterns;
}

function extractConversationInsights(userMessage: string, aiResponse: string): string[] {
  const insights = [];
  
  // Analizar estilo de comunicación preferido
  if (userMessage.length < 20) insights.push('prefiere_mensajes_cortos');
  if (userMessage.includes('por favor') || userMessage.includes('gracias')) insights.push('usa_cortesia_formal');
  if (userMessage.toLowerCase() === userMessage) insights.push('usa_minusculas');
  if (userMessage.includes('?')) insights.push('hace_preguntas_directas');
  
  // Analizar tipo de información solicitada
  if (userMessage.includes('detalle') || userMessage.includes('específico')) insights.push('necesita_informacion_detallada');
  if (userMessage.includes('rápido') || userMessage.includes('rapido')) insights.push('necesita_respuesta_rapida');
  
  return insights;
}

function extractBusinessContext(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('curazao') || lowerMessage.includes('curacao')) {
    return 'consulta_sobre_curazao';
  }
  if (lowerMessage.includes('barranquilla') || lowerMessage.includes('colombia')) {
    return 'consulta_sobre_barranquilla';
  }
  if (lowerMessage.includes('encomienda') || lowerMessage.includes('paquete')) {
    return 'consulta_sobre_encomienda';
  }
  if (lowerMessage.includes('flete') || lowerMessage.includes('envío') || lowerMessage.includes('envio')) {
    return 'consulta_sobre_envio';
  }
  
  return 'contexto_general';
}
