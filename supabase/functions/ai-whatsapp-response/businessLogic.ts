
import { CustomerInfo } from './types.ts';
import { PackageFlowService } from './packageFlowService.ts';

export function validatePackageDeliveryTiming(customerInfo: CustomerInfo): { isValid: boolean; message?: string } {
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    return { isValid: true };
  }

  const now = new Date();
  const hoursSinceLastUpdate = 24; // Ejemplo: validar si ha pasado mucho tiempo

  return { isValid: true };
}

export function generateBusinessIntelligentResponse(customerInfo: CustomerInfo): string | null {
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    return null;
  }

  // Si tiene encomiendas pendientes de pago, mencionar esto como contexto adicional
  if (customerInfo.pendingPaymentPackages.length > 0) {
    const totalPending = customerInfo.totalPending;
    return `El cliente tiene ${customerInfo.pendingPaymentPackages.length} encomienda(s) con saldo pendiente por un total de ${totalPending}. Incluir esta información si es relevante para la consulta.`;
  }

  return null;
}

export function generateHomeDeliveryResponse(customerInfo: CustomerInfo, message: string): string | null {
  const homeDeliveryKeywords = [
    'traer', 'llevar', 'entrega', 'domicilio', 'me la puedes traer',
    'me la pueden traer', 'pueden llevar', 'entrega a domicilio',
    'llevarla a', 'traerla a', 'entregar en', 'delivery'
  ];

  const normalizedMessage = message.toLowerCase();
  const isHomeDelivery = homeDeliveryKeywords.some(keyword => 
    normalizedMessage.includes(keyword)
  );

  if (!isHomeDelivery) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  return `¡Hola ${customerName}! 👋

**ENTREGA A DOMICILIO COORDINADA** 🚚

Para coordinar la entrega de tu encomienda a domicilio, te voy a transferir con **Josefa**, nuestra coordinadora de entregas.

📞 **Josefa te contactará para:**
• 📍 Confirmar tu dirección de entrega
• ⏰ Coordinar horario conveniente
• 💰 Confirmar costos de entrega a domicilio
• 📦 Detalles específicos de tu encomienda

**Josefa te contactará en los próximos minutos** para organizar todo el proceso de entrega.

🏠 **Envíos Ojito** - ¡Tu encomienda hasta la puerta de tu casa!`;
}

// FUNCIÓN MEJORADA: Detectar consultas sobre fechas de viajes/envíos - PRIORIDAD ALTA
export function detectTripScheduleInquiry(message: string): { 
  isTripInquiry: boolean; 
  needsDestination: boolean; 
  hasDestination: boolean;
  destination?: string;
} {
  const messageLower = message.toLowerCase().trim();
  
  // EXPANDIDO: Palabras clave que indican consulta de fechas/envíos - INCLUYE TODAS LAS VARIACIONES
  const tripKeywords = [
    // Variaciones básicas de viaje
    'cuando viajan', 'cuándo viajan', 'cuando vuelan', 'cuándo vuelan',
    'cuando van', 'cuándo van', 'cuando va', 'cuándo va',
    'cuando se van', 'cuándo se van', 'cuando van a', 'cuándo van a',
    'cuando van a viajar', 'cuándo van a viajar', 'cuando viajan a', 'cuándo viajan a',
    'cuando se van para', 'cuándo se van para', 'cuando va para', 'cuándo va para',
    'cuando va a', 'cuándo va a', 'cuando van para', 'cuándo van para',
    
    // Palabras de tiempo y programación
    'fecha', 'fechas', 'envío', 'envios', 'enviar', 'próximo', 'próximos',
    'cuándo', 'cuando', 'horario', 'horarios', 'programado', 'programados',
    'salida', 'salidas', 'vuelo', 'vuelos', 'itinerario', 'viaje', 'viajes',
    'cuando sale', 'cuándo sale', 'cuando salen', 'cuándo salen',
    
    // Variaciones específicas
    'cuando hay viaje', 'cuándo hay viaje', 'cuando hay envío', 'cuándo hay envío',
    'hay viaje', 'hay envío', 'próximo viaje', 'proximo viaje',
    'próximo envío', 'proximo envío', 'llevar', 'encomienda'
  ];
  
  const isTripInquiry = tripKeywords.some(keyword => messageLower.includes(keyword));
  
  if (!isTripInquiry) {
    return { isTripInquiry: false, needsDestination: false, hasDestination: false };
  }
  
  console.log(`🛫 [TripInquiry] Consulta de viaje detectada: "${message}"`);
  
  // Detectar destino mencionado
  let destination: string | undefined;
  let hasDestination = false;
  
  if (messageLower.includes('curacao') || messageLower.includes('curazao') ||
      messageLower.includes('hacia curazao') || messageLower.includes('para curazao') ||
      messageLower.includes('a curazao')) {
    destination = 'Curazao';
    hasDestination = true;
    console.log(`🎯 [TripInquiry] Destino detectado: ${destination}`);
  } else if (messageLower.includes('barranquilla') || messageLower.includes('colombia') ||
             messageLower.includes('hacia barranquilla') || messageLower.includes('para barranquilla') ||
             messageLower.includes('a barranquilla')) {
    destination = 'Barranquilla';
    hasDestination = true;
    console.log(`🎯 [TripInquiry] Destino detectado: ${destination}`);
  }
  
  // Si es una consulta de viajes pero no tiene destino, necesita preguntar
  const needsDestination = !hasDestination;
  
  return { 
    isTripInquiry: true, 
    needsDestination, 
    hasDestination,
    destination 
  };
}

// FUNCIÓN NUEVA: Detectar si es una respuesta de destino después de consulta de fechas
export function detectDestinationResponseAfterTripInquiry(message: string, conversationHistory: any[]): {
  isDestinationResponse: boolean;
  destination?: string;
  shouldShowTripDates: boolean;
} {
  const messageLower = message.toLowerCase().trim();
  
  // Verificar si es una respuesta corta de destino
  const isShortDestinationResponse = 
    messageLower === 'curazao' || messageLower === 'curacao' || 
    messageLower === 'barranquilla' || messageLower === 'colombia' ||
    messageLower.includes('hacia curazao') || messageLower.includes('para curazao') ||
    messageLower.includes('hacia barranquilla') || messageLower.includes('para barranquilla');

  if (!isShortDestinationResponse) {
    return { isDestinationResponse: false, shouldShowTripDates: false };
  }

  // Verificar si el mensaje anterior del bot preguntaba por destino para fechas de viajes
  const lastBotMessage = conversationHistory
    .filter(msg => !msg.isFromCustomer)
    .slice(-1)[0]?.message || '';
  
  const wasTripDestinationQuestion = 
    lastBotMessage.includes('¿Hacia qué destino quieres enviar?') ||
    lastBotMessage.includes('Para mostrarte las fechas') ||
    lastBotMessage.includes('necesito saber el destino');

  let destination: string | undefined;
  if (messageLower.includes('curazao') || messageLower.includes('curacao')) {
    destination = 'Curazao';
  } else if (messageLower.includes('barranquilla') || messageLower.includes('colombia')) {
    destination = 'Barranquilla';
  }

  console.log(`🔄 [DestinationResponse] ${isShortDestinationResponse ? 'Sí' : 'No'} es respuesta de destino, ${wasTripDestinationQuestion ? 'Sí' : 'No'} había pregunta previa`);

  return {
    isDestinationResponse: isShortDestinationResponse,
    destination,
    shouldShowTripDates: wasTripDestinationQuestion
  };
}

// FUNCIÓN NUEVA: Analizar contexto de conversación para respuestas inteligentes
export function analyzeConversationContext(message: string, conversationHistory: any[]): {
  isContextualResponse: boolean;
  contextType?: string;
  suggestedResponse?: string;
} {
  const messageLower = message.toLowerCase().trim();
  
  // Detectar "quiero enviar la próxima fecha" o variaciones
  const wantsToSendNextDate = 
    messageLower.includes('quiero enviar') && 
    (messageLower.includes('próxima fecha') || messageLower.includes('proxima fecha') ||
     messageLower.includes('próximo') || messageLower.includes('proximo'));

  if (!wantsToSendNextDate) {
    return { isContextualResponse: false };
  }

  // Analizar últimos 5 mensajes para detectar contexto de fechas de viajes
  const recentMessages = conversationHistory.slice(-5);
  const botMessages = recentMessages.filter(msg => !msg.isFromCustomer);
  
  // Verificar si se habló de fechas de viajes recientemente
  const hasTripDateContext = botMessages.some(msg => 
    msg.message.includes('próximos viajes') || 
    msg.message.includes('fechas de los próximos viajes') ||
    msg.message.includes('¿Hacia qué destino') ||
    msg.message.includes('necesito saber el destino')
  );

  // Detectar destino mencionado en mensajes previos
  let detectedDestination: string | undefined;
  const lastTripMessage = botMessages.find(msg => 
    msg.message.includes('CURAZAO') || msg.message.includes('BARRANQUILLA')
  );
  
  if (lastTripMessage) {
    if (lastTripMessage.message.includes('CURAZAO')) {
      detectedDestination = 'Curazao';
    } else if (lastTripMessage.message.includes('BARRANQUILLA')) {
      detectedDestination = 'Barranquilla';
    }
  }

  if (hasTripDateContext && detectedDestination) {
    return {
      isContextualResponse: true,
      contextType: 'trip_booking_after_dates',
      suggestedResponse: `Perfecto! Quieres enviar tu encomienda hacia ${detectedDestination}. 

📦 **¿Qué necesitas para enviar?**

• 📍 **Dirección de entrega en ${detectedDestination}**
• 📝 **Datos del destinatario**
• ⚖️ **Peso aproximado del paquete**
• 💰 **Confirmar tarifas de envío**

📞 **Para reservar tu espacio:** Contacta a **Darwin Pedroza** al **+573127271746**

¿Tienes toda la información lista para proceder con el envío? 📋`
    };
  }

  return { isContextualResponse: false };
}

// FUNCIÓN NUEVA: Generar respuesta con fechas después de respuesta de destino
export function generateTripDatesAfterDestinationResponse(
  customerInfo: CustomerInfo,
  message: string,
  upcomingTrips: any[]
): string | null {
  
  const customerName = customerInfo.customerFirstName || 'Cliente';
  const messageLower = message.toLowerCase().trim();
  
  let destination: string;
  if (messageLower.includes('curazao') || messageLower.includes('curacao')) {
    destination = 'Curazao';
  } else if (messageLower.includes('barranquilla') || messageLower.includes('colombia')) {
    destination = 'Barranquilla';
  } else {
    return null;
  }

  console.log(`📅 [TripDates] Generando fechas para destino: ${destination}`);

  // Buscar viajes HACIA el destino solicitado
  const destinationTrips = upcomingTrips.filter(trip => {
    const tripDestination = trip.destination.toLowerCase();
    
    if (destination === 'Curazao') {
      return tripDestination.includes('curazao') || tripDestination.includes('curacao');
    } else if (destination === 'Barranquilla') {
      return tripDestination.includes('barranquilla') || tripDestination.includes('colombia');
    }
    
    return false;
  });

  if (destinationTrips.length === 0) {
    return `¡Hola ${customerName}! 👋✈️

📅 **Viajes hacia ${destination.toUpperCase()}:**

🚨 **No hay viajes programados hacia ${destination}** en los próximos 30 días.

📞 **Contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

Darwin te informará sobre las próximas fechas disponibles para ${destination}.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }

  // Mostrar los próximos viajes hacia el destino específico
  let response = `¡Hola ${customerName}! 👋✈️

📅 **Próximos viajes hacia ${destination.toUpperCase()}:**

`;

  destinationTrips.slice(0, 3).forEach((trip, index) => {
    const tripDate = new Date(trip.trip_date + 'T00:00:00');
    const formattedDate = tripDate.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    
    response += `${index + 1}. 📅 **${capitalizedDate}**\n`;
    response += `   🛫 **Salida desde:** ${trip.origin}\n`;
    response += `   🛬 **Destino:** ${trip.destination}\n`;
    if (trip.flight_number) {
      response += `   ✈️ **Vuelo:** ${trip.flight_number}\n`;
    }
    response += `\n`;
  });

  response += `━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 **¿Para cuándo deseas enviar tu encomienda?**

📞 **Reservar espacio:** Contacta a **Darwin Pedroza** al **+573127271746**

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

  return response;
}

// FUNCIÓN PRINCIPAL: Generar respuesta inteligente para consultas de viajes (EVITA DUPLICADOS)
export function generateTripScheduleResponse(
  customerInfo: CustomerInfo, 
  message: string
): string | null {
  const tripInquiry = detectTripScheduleInquiry(message);
  
  if (!tripInquiry.isTripInquiry) {
    return null;
  }
  
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  // CLAVE: Si necesita destino, preguntar de forma estructurada y TERMINAR AQUÍ
  if (tripInquiry.needsDestination) {
    console.log(`❓ [TripSchedule] Cliente pregunta sin destino - Solicitando clarificación`);
    
    return `¡Hola ${customerName}! 👋

Para mostrarte las fechas de los próximos viajes, necesito saber el destino. 🎯

📍 **¿Hacia dónde quieres enviar?**

• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla**

Escribe el destino y te muestro todas las fechas disponibles. ✈️`;
  }
  
  // Si ya tiene destino, NO manejar aquí - dejar que el prompt principal maneje con contexto
  console.log(`🎯 [TripSchedule] Cliente ya especificó destino: ${tripInquiry.destination} - Delegando a prompt principal`);
  return null; // Dejar que el prompt principal maneje la respuesta con el contexto de viajes
}

// NUEVA FUNCIÓN: Detectar consultas sobre encomiendas específicas en origen - PRIORIDAD MENOR
export function detectPackageStatusInquiry(message: string): boolean {
  const packageInquiryPatterns = [
    /\b(EO-\d{4}-\d+)\b/i, // Formato de tracking number
    /encomienda.*está/i,
    /paquete.*está/i,
    /mi encomienda/i,
    /mi paquete/i,
    /estado.*encomienda/i,
    /estado.*paquete/i,
    /dónde.*encomienda/i,
    /dónde.*paquete/i,
    /cuándo.*encomienda/i,
    /cuándo.*paquete/i,
    /donde.*encomienda/i,
    /donde.*paquete/i,
    /cuando.*encomienda/i,
    /cuando.*paquete/i,
    /ya.*llegó/i,
    /llegó.*encomienda/i,
    /llegó.*paquete/i,
    /qué.*hora/i,
    /a.*hora/i
  ];

  // MEJORADO: EXCLUIR consultas que claramente son sobre viajes/fechas
  const tripExclusionPatterns = [
    /cuando.*viajan/i,
    /cuándo.*viajan/i,
    /cuando.*vuelan/i,
    /cuándo.*vuelan/i,
    /cuando.*van/i,
    /cuándo.*van/i,
    /cuando.*va/i,
    /cuándo.*va/i,
    /fechas.*viaje/i,
    /próximo.*viaje/i,
    /cuando.*sale/i,
    /cuándo.*sale/i,
    /quiero.*enviar.*próxima/i,
    /quiero.*enviar.*proximo/i,
    /hay.*viaje/i,
    /hay.*envío/i
  ];

  // Si es una consulta de viajes, NO es una consulta de encomienda
  const isTripQuery = tripExclusionPatterns.some(pattern => pattern.test(message));
  if (isTripQuery) {
    console.log(`🚫 [PackageDetection] Excluida como consulta de viaje: "${message}"`);
    return false;
  }

  const isPackageQuery = packageInquiryPatterns.some(pattern => pattern.test(message));
  if (isPackageQuery) {
    console.log(`📦 [PackageDetection] Consulta de encomienda detectada: "${message}"`);
  }

  return isPackageQuery;
}

// FUNCIÓN MEJORADA: Respuestas directas usando el nuevo servicio de flujo
export function generatePackageOriginClarificationResponse(
  customerInfo: CustomerInfo, 
  message: string,
  packageDetails?: any
): string | null {
  
  if (!detectPackageStatusInquiry(message)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  console.log(`🔍 [PackageInquiry] Analizando consulta DIRECTA de encomienda para ${customerName}: packagesCount=${customerInfo.packagesCount}`);
  
  // CASO 1: Cliente NO registrado o SIN encomiendas
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    console.log(`📭 [PackageInquiry] Cliente sin encomiendas registradas`);
    
    return `¡Hola ${customerName}! 👋

No tenemos encomiendas registradas a tu nombre actualmente. 📭

Si enviaste una encomienda, compárteme el número de tracking (ejemplo: **EO-2025-1234**) para verificar el estado.

✈️ **Envíos Ojito**`;
  }
  
  // CASO 2: Cliente CON encomiendas - Usar el nuevo servicio de flujo
  console.log(`📦 [PackageInquiry] Cliente con ${customerInfo.packagesCount} encomienda(s) - Usando servicio de flujo`);
  
  if (customerInfo.pendingDeliveryPackages.length > 0) {
    const pkg = customerInfo.pendingDeliveryPackages[0];
    
    // Intentar generar respuesta contextual usando el servicio de flujo
    const contextualResponse = PackageFlowService.generateContextualResponse(
      customerInfo, 
      message, 
      pkg
    );
    
    if (contextualResponse) {
      return contextualResponse;
    }
    
    // Fallback a respuesta básica si el servicio no puede manejar la consulta
    if (pkg.status === 'en_destino') {
      return `¡Hola ${customerName}! 👋

Sí, tu encomienda **${pkg.tracking_number}** ya llegó a ${pkg.destination}. ✅

📦 **Está lista para recoger.**`;
    } else {
      return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está en tránsito hacia ${pkg.destination}. 🛫

⏰ **Te avisamos cuando llegue.**`;
    }
  }
  
  // Fallback para casos no cubiertos
  return `¡Hola ${customerName}! 👋

Tienes **${customerInfo.packagesCount}** encomienda(s) en nuestro sistema. 📦

¿Qué información específica necesitas?`;
}
