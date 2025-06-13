
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
  
  // Palabras clave que indican consulta de fechas/envíos
  const tripKeywords = [
    'cuando viajan', 'cuándo viajan', 'cuando vuelan', 'cuándo vuelan',
    'fecha', 'fechas', 'envío', 'envios', 'enviar', 'próximo', 'próximos',
    'cuándo', 'cuando', 'horario', 'horarios', 'programado', 'programados',
    'salida', 'salidas', 'vuelo', 'vuelos', 'itinerario', 'viaje', 'viajes',
    'cuando sale', 'cuándo sale', 'cuando salen', 'cuándo salen'
  ];
  
  const isTripInquiry = tripKeywords.some(keyword => messageLower.includes(keyword));
  
  if (!isTripInquiry) {
    return { isTripInquiry: false, needsDestination: false, hasDestination: false };
  }
  
  // Detectar destino mencionado
  let destination: string | undefined;
  let hasDestination = false;
  
  if (messageLower.includes('curacao') || messageLower.includes('curazao')) {
    destination = 'Curazao';
    hasDestination = true;
  } else if (messageLower.includes('barranquilla') || messageLower.includes('colombia')) {
    destination = 'Barranquilla';
    hasDestination = true;
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

  return {
    isDestinationResponse: isShortDestinationResponse,
    destination,
    shouldShowTripDates: wasTripDestinationQuestion
  };
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

// FUNCIÓN NUEVA: Generar respuesta inteligente para consultas de viajes
export function generateTripScheduleResponse(
  customerInfo: CustomerInfo, 
  message: string
): string | null {
  const tripInquiry = detectTripScheduleInquiry(message);
  
  if (!tripInquiry.isTripInquiry) {
    return null;
  }
  
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  // Si necesita destino, preguntar de forma estructurada
  if (tripInquiry.needsDestination) {
    return `¡Hola ${customerName}! 👋

Para mostrarte las fechas de los próximos viajes, necesito saber el destino. 🎯

📍 **¿Hacia dónde quieres enviar?**

• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla**

Escribe el destino y te muestro todas las fechas disponibles. ✈️`;
  }
  
  // Si ya tiene destino, usar el contexto de viajes que se cargará automáticamente
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

  // EXCLUIR consultas que claramente son sobre viajes/fechas
  const tripExclusionPatterns = [
    /cuando.*viajan/i,
    /cuándo.*viajan/i,
    /cuando.*vuelan/i,
    /cuándo.*vuelan/i,
    /fechas.*viaje/i,
    /próximo.*viaje/i,
    /cuando.*sale/i,
    /cuándo.*sale/i
  ];

  // Si es una consulta de viajes, NO es una consulta de encomienda
  const isTripQuery = tripExclusionPatterns.some(pattern => pattern.test(message));
  if (isTripQuery) {
    return false;
  }

  return packageInquiryPatterns.some(pattern => pattern.test(message));
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
