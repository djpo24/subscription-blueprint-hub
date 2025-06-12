import { CustomerInfo } from './types.ts';

// Detectar consultas sobre dónde enviar paquetes
export function isPackageShippingInquiry(message: string): boolean {
  const shippingKeywords = [
    'donde enviar', 'donde puedo enviar', 'donde puede enviar',
    'donde envío', 'donde envio', 'donde mando',
    'donde puede mandar', 'donde puedo mandar',
    'enviar paquete', 'enviar encomienda', 'mandar paquete',
    'mandar encomienda', 'envío de paquete', 'envio de paquete',
    'envío de encomienda', 'envio de encomienda',
    'donde reciben', 'donde reciben paquetes', 'donde reciben encomiendas',
    'dirección para enviar', 'direccion para enviar',
    'dirección de envío', 'direccion de envio',
    'quiero enviar', 'necesito enviar', 'debo enviar',
    'que debo hacer', 'qué debo hacer', 'como envio', 'cómo envío',
    'como enviar', 'cómo enviar', 'proceso de envío', 'proceso de envio'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return shippingKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// Detectar consultas sobre plazos de entrega de paquetes
export function isPackageDeliveryDeadlineInquiry(message: string): boolean {
  const deadlineKeywords = [
    'hasta cuando', 'hasta cuándo', 'hasta que hora', 'hasta qué hora',
    'tiempo de entregar', 'tiempo para entregar', 'plazo para entregar',
    'limite para entregar', 'límite para entregar', 'hora limite', 'hora límite',
    'tengo tiempo', 'me queda tiempo', 'puedo entregar',
    'fecha limite', 'fecha límite', 'hasta que fecha', 'hasta qué fecha',
    'cuando debo entregar', 'cuándo debo entregar', 'deadline',
    'ultimo dia', 'último día', 'ultima hora', 'última hora'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return deadlineKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// Detectar consultas sobre fechas de próximos viajes
export function isNextTripInquiry(message: string): boolean {
  const tripKeywords = [
    'cuando es el próximo viaje', 'cuándo es el próximo viaje',
    'próximo viaje', 'proximo viaje', 'siguiente viaje',
    'cuando viajan', 'cuándo viajan', 'fecha del viaje',
    'próxima fecha', 'proxima fecha', 'cuando hay viaje',
    'cuándo hay viaje', 'próximos vuelos', 'proximos vuelos'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return tripKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// NUEVA FUNCIÓN: Analizar consulta completa con múltiples preguntas
export function analyzeCompleteInquiry(message: string): {
  hasShippingQuestion: boolean;
  hasDeadlineQuestion: boolean;
  hasTripDateQuestion: boolean;
  destination: string | null;
  isMultipleQuestionInquiry: boolean;
} {
  const normalizedMessage = message.toLowerCase();
  
  const hasShippingQuestion = isPackageShippingInquiry(message);
  const hasDeadlineQuestion = isPackageDeliveryDeadlineInquiry(message);
  const hasTripDateQuestion = isNextTripInquiry(message);
  const destination = extractDestinationFromMessage(message);
  
  // Es consulta múltiple si tiene más de un tipo de pregunta
  const questionCount = [hasShippingQuestion, hasDeadlineQuestion, hasTripDateQuestion].filter(Boolean).length;
  const isMultipleQuestionInquiry = questionCount > 1;
  
  console.log(`🔍 [AnalysisResult] Preguntas detectadas: Envío=${hasShippingQuestion}, Plazo=${hasDeadlineQuestion}, FechaViaje=${hasTripDateQuestion}, Destino=${destination}, Múltiple=${isMultipleQuestionInquiry}`);
  
  return {
    hasShippingQuestion,
    hasDeadlineQuestion,
    hasTripDateQuestion,
    destination,
    isMultipleQuestionInquiry
  };
}

// NUEVA FUNCIÓN: Generar respuesta integrada para consultas múltiples
export function generateIntegratedPackageResponse(
  customerInfo: CustomerInfo,
  customerMessage: string,
  upcomingTrips: any[],
  destinationAddresses: any[]
): string | null {
  
  const analysis = analyzeCompleteInquiry(customerMessage);
  
  // Solo procesar si es una consulta de envío con múltiples preguntas
  if (!analysis.isMultipleQuestionInquiry || !analysis.hasShippingQuestion) {
    return null;
  }
  
  console.log(`🎯 [IntegratedResponse] Generando respuesta integrada para destino: ${analysis.destination}`);
  
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  if (!analysis.destination) {
    return `¡Hola ${customerName}! 👋📦

Para ayudarte con todas tus preguntas sobre el envío, necesito conocer:

🎯 **¿Hacia qué destino quieres enviar tu encomienda?**
• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla, Colombia**

Una vez me indiques el destino, te proporcionaré toda la información que necesitas: dónde entregar tu paquete, cuándo es el próximo viaje y hasta cuándo tienes tiempo para entregarlo. 📋

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }
  
  // Buscar viajes HACIA el destino solicitado
  const destinationTrips = upcomingTrips.filter(trip => {
    const tripDestination = trip.destination.toLowerCase();
    const requestedDestination = analysis.destination!.toLowerCase();
    
    if (requestedDestination.includes('curazao') || requestedDestination.includes('curacao')) {
      return tripDestination.includes('curazao') || tripDestination.includes('curacao');
    } else if (requestedDestination.includes('barranquilla') || requestedDestination.includes('colombia')) {
      return tripDestination.includes('barranquilla') || tripDestination.includes('colombia');
    }
    
    return false;
  });
  
  console.log(`🚀 [TripSearch] Viajes encontrados hacia ${analysis.destination}: ${destinationTrips.length}`);
  
  if (destinationTrips.length === 0) {
    return `¡Hola ${customerName}! 👋📦

**Respuesta a tus consultas sobre envío hacia ${analysis.destination.toUpperCase()}:**

🚨 **Actualmente no hay viajes programados hacia ${analysis.destination}** en los próximos días. 

📞 **Para programar tu envío, contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

**🎯 Darwin te ayudará con:**
• 📅 Programar próximos viajes hacia ${analysis.destination}
• 📍 Confirmar dirección de entrega
• ⏰ Establecer fechas y plazos
• 📦 Reservar espacio para tu paquete

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }
  
  // Obtener el próximo viaje
  const nextTrip = destinationTrips[0];
  const tripDate = new Date(nextTrip.trip_date + 'T00:00:00');
  
  // Calcular fecha límite (un día antes del viaje)
  const deadlineDate = new Date(tripDate);
  deadlineDate.setDate(deadlineDate.getDate() - 1);
  
  // Formatear fechas en español
  const tripOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  
  const deadlineOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  
  const formattedTripDate = tripDate.toLocaleDateString('es-ES', tripOptions);
  const formattedDeadline = deadlineDate.toLocaleDateString('es-ES', deadlineOptions);
  
  // Capitalizar primera letra
  const capitalizedTripDate = formattedTripDate.charAt(0).toUpperCase() + formattedTripDate.slice(1);
  const capitalizedDeadline = formattedDeadline.charAt(0).toUpperCase() + formattedDeadline.slice(1);
  
  // Obtener dirección de origen
  const originAddress = findOriginAddressForDestination(analysis.destination, destinationAddresses);
  
  // Generar respuesta integrada que responde TODAS las preguntas en orden
  let response = `¡Hola ${customerName}! 👋📦

**Respuesta completa a tus consultas sobre envío hacia ${analysis.destination.toUpperCase()}:**

`;

  // 1. Responder dónde enviar (dirección de origen)
  if (analysis.hasShippingQuestion) {
    response += `📍 **Dirección para entregar tu paquete:**
${originAddress || 'Dirección no disponible en el sistema'}

`;
  }
  
  // 2. Responder cuándo es el próximo viaje
  if (analysis.hasTripDateQuestion) {
    response += `✈️ **Próximo viaje hacia ${analysis.destination}:**
📅 **${capitalizedTripDate}** - Ruta: ${nextTrip.origin} → ${nextTrip.destination}${nextTrip.flight_number ? ` (Vuelo: ${nextTrip.flight_number})` : ''}

`;
  }
  
  // 3. Responder hasta cuándo tiene tiempo de entregarlo
  if (analysis.hasDeadlineQuestion) {
    response += `⏰ **Plazo de entrega:**
🚨 **Tienes hasta las 6:00 PM del ${capitalizedDeadline}** para que recibamos tu paquete. Después de esta hora no aseguramos que pueda viajar en el viaje programado para el ${capitalizedTripDate}.

`;
  }
  
  response += `━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **RESERVAR ESPACIO:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

**🎯 Para confirmar:**
• ✅ Reserva de espacio en el vuelo
• 📦 Detalles de tu paquete  
• 📋 Proceso de entrega

¡Estamos listos para tu envío! ✈️💼

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

  console.log(`✅ [IntegratedResponse] Respuesta completa generada para ${analysis.destination}`);
  
  return response;
}

// Generar respuesta para consultas sobre plazos de entrega
export function generatePackageDeliveryDeadlineResponse(
  customerInfo: CustomerInfo, 
  customerMessage: string,
  upcomingTrips: any[]
): string | null {
  
  // Solo procesar si es una consulta ESPECÍFICA sobre plazos (no múltiple)
  const analysis = analyzeCompleteInquiry(customerMessage);
  if (analysis.isMultipleQuestionInquiry || !isPackageDeliveryDeadlineInquiry(customerMessage)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  // Si no hay viajes próximos programados
  if (!upcomingTrips || upcomingTrips.length === 0) {
    return `¡Hola ${customerName}! 👋⏰

🚨 **PLAZO DE ENTREGA DE PAQUETES**

📅 **Estado actual:** No hay viajes programados en los próximos días

📋 **Para programar tu envío:**

📞 **Contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

**🎯 Darwin te ayudará con:**
• 📅 Programar próximos viajes
• ⏰ Confirmar fechas y horarios  
• 📦 Reservar espacio para tu paquete

✈️ **Envío de paquete** - Conectando Barranquilla y Curazao`;
  }

  // Obtener el próximo viaje
  const nextTrip = upcomingTrips[0];
  const tripDate = new Date(nextTrip.trip_date + 'T00:00:00');
  
  // Calcular fecha límite (un día antes del viaje)
  const deadlineDate = new Date(tripDate);
  deadlineDate.setDate(deadlineDate.getDate() - 1);
  
  // Formatear la fecha límite en español
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };
  const formattedDeadline = deadlineDate.toLocaleDateString('es-ES', options);
  
  // Formatear fecha del viaje
  const formattedTripDate = tripDate.toLocaleDateString('es-ES', options);
  
  // Capitalizar primera letra del día de la semana
  const capitalizedDeadline = formattedDeadline.charAt(0).toUpperCase() + formattedDeadline.slice(1);
  const capitalizedTripDate = formattedTripDate.charAt(0).toUpperCase() + formattedTripDate.slice(1);

  return `¡Hola ${customerName}! 👋⏰

⚠️ **PLAZO DE ENTREGA DE PAQUETES**

🚨 **Tienes hasta las 6:00 PM del ${capitalizedDeadline} para que recibamos tu paquete.**

**Después de este horario no aseguramos que pueda viajar en este viaje programado para el ${capitalizedTripDate}.**

━━━━━━━━━━━━━━━━━━━━━━━━━━

✈️ **PRÓXIMO VIAJE PROGRAMADO:**
📅 **Fecha:** ${capitalizedTripDate}
🛫 **Ruta:** ${nextTrip.origin} → ${nextTrip.destination}
${nextTrip.flight_number ? `✈️ **Vuelo:** ${nextTrip.flight_number}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **RESERVAR ESPACIO:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

**🎯 Para confirmar:**
• ✅ Reserva de espacio en el vuelo
• 📅 Fechas disponibles  
• 💰 Tarifas y pagos
• 📋 Seguimiento del envío

¡No esperes hasta el último momento! ⏰

✈️ **Envío de paquete** - Conectando Barranquilla y Curazao`;
}

// Detectar destino mencionado en el mensaje - MEJORADA PARA MEJOR DETECCIÓN
export function extractDestinationFromMessage(message: string): string | null {
  const normalizedMessage = message.toLowerCase();
  
  // Detectar menciones específicas de Curazao
  if (normalizedMessage.includes('curazao') || normalizedMessage.includes('curacao') || 
      normalizedMessage.includes('curaçao') || normalizedMessage.includes('hacia curazao') ||
      normalizedMessage.includes('para curazao') || normalizedMessage.includes('a curazao') ||
      normalizedMessage.includes('en curazao') || normalizedMessage.includes('destino curazao')) {
    return 'Curazao';
  }
  
  // Detectar menciones específicas de Barranquilla/Colombia
  if (normalizedMessage.includes('barranquilla') || normalizedMessage.includes('colombia') ||
      normalizedMessage.includes('hacia barranquilla') || normalizedMessage.includes('para barranquilla') ||
      normalizedMessage.includes('a barranquilla') || normalizedMessage.includes('a colombia') ||
      normalizedMessage.includes('en barranquilla') || normalizedMessage.includes('destino barranquilla')) {
    return 'Barranquilla';
  }
  
  return null;
}

// FUNCIÓN MEJORADA: Detectar si es una respuesta a pregunta previa sobre destino
export function isDestinationResponse(message: string): boolean {
  const normalizedMessage = message.toLowerCase().trim();
  
  // Respuestas directas comunes
  const directResponses = [
    'curazao', 'curacao', 'curaçao',
    'barranquilla', 'colombia',
    'hacia curazao', 'para curazao', 'a curazao',
    'hacia barranquilla', 'para barranquilla', 'a barranquilla'
  ];
  
  return directResponses.some(response => normalizedMessage === response || normalizedMessage.includes(response));
}

// Generar respuesta para consultas de envío de paquetes - MEJORADA CON MEJOR CONTEXTO
export function generatePackageShippingResponse(
  customerInfo: CustomerInfo, 
  customerMessage: string,
  destinationAddresses: any[]
): string | null {
  
  // Solo procesar si es una consulta simple de envío (no múltiple)
  const analysis = analyzeCompleteInquiry(customerMessage);
  if (analysis.isMultipleQuestionInquiry) {
    return null; // Will be handled by integrated response
  }
  
  // Solo procesar si es una consulta de envío
  if (!isPackageShippingInquiry(customerMessage) && !isDestinationResponse(customerMessage)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';
  const extractedDestination = extractDestinationFromMessage(customerMessage);
  
  // Si detectamos una respuesta de destino específica, procesar inmediatamente
  if (isDestinationResponse(customerMessage) && extractedDestination) {
    const originAddress = findOriginAddressForDestination(extractedDestination, destinationAddresses);
    
    return `📦 **INFORMACIÓN PARA ENVÍO HACIA ${extractedDestination.toUpperCase()}** 🇨🇼

📍 **Dirección para entregar tu paquete:**
${originAddress || 'Dirección no disponible en el sistema'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **RESERVAR ESPACIO EN EL PRÓXIMO VUELO** ✈️

**👤 Contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

**🎯 Darwin te ayudará con:**
• ✅ Reserva de espacio
• 📅 Fechas disponibles  
• 💰 Tarifas y pagos
• 📋 Seguimiento del envío

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **PROCESO DE ENVÍO:**

**1️⃣** Lleva tu paquete a la dirección indicada 📍
**2️⃣** Nuestro equipo lo recibirá y procesará 👥  
**3️⃣** Será transportado hacia ${extractedDestination} ✈️
**4️⃣** Te notificaremos cuando llegue a destino 📢

⏰ **PLAZO DE ENTREGA:**
🚨 **Hasta las 6:00 PM del día anterior al viaje programado**

¡Estamos listos para ayudarte con tu envío! ✈️💼

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }
  
  // Si no se especifica destino en consulta inicial, preguntar
  if (!extractedDestination && isPackageShippingInquiry(customerMessage)) {
    return `¡Hola ${customerName}! 👋✈️

📦 **ENVÍO DE ENCOMIENDAS**

Para ayudarte con el envío, necesito conocer:

🎯 **¿Hacia qué destino quieres enviar tu encomienda?**

**🌎 Destinos disponibles:**
• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla, Colombia**

Una vez me indiques el destino, te proporcionaré toda la información necesaria para el envío. 📋

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }

  // Si se especifica destino en la consulta inicial
  if (extractedDestination) {
    const originAddress = findOriginAddressForDestination(extractedDestination, destinationAddresses);
    
    return `¡Hola ${customerName}! 👋✈️

📦 **INFORMACIÓN PARA ENVÍO HACIA ${extractedDestination.toUpperCase()}**

📍 **Dirección para entregar tu paquete:**
${originAddress || 'Dirección no disponible en el sistema'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **RESERVAR ESPACIO EN EL PRÓXIMO VUELO** ✈️

**👤 Contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

**🎯 Darwin te ayudará con:**
• ✅ Reserva de espacio
• 📅 Fechas disponibles  
• 💰 Tarifas y pagos
• 📋 Seguimiento del envío

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **PROCESO DE ENVÍO:**

**1️⃣** Lleva tu paquete a la dirección indicada 📍
**2️⃣** Nuestro equipo lo recibirá y procesará 👥  
**3️⃣** Será transportado hacia ${extractedDestination} ✈️
**4️⃣** Te notificaremos cuando llegue a destino 📢

⏰ **PLAZO DE ENTREGA:**
🚨 **Hasta las 6:00 PM del día anterior al viaje programado**

¡Estamos listos para ayudarte con tu envío! ✈️💼

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }

  return null;
}

// FUNCIÓN CORREGIDA: Encontrar dirección de origen basada en el destino
function findOriginAddressForDestination(destination: string, addresses: any[]): string | null {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  console.log(`🔍 Buscando dirección de origen para destino: ${destination}`);
  console.log(`📍 Direcciones disponibles:`, addresses.map(addr => `${addr.city}: ${addr.address}`));

  // LÓGICA CORREGIDA: Si envía hacia Curazao, debe entregar en Barranquilla (origen)
  // Si envía hacia Barranquilla, debe entregar en Curazao (origen)
  
  if (destination === 'Curazao') {
    // Buscar dirección de Barranquilla (origen para envíos a Curazao)
    const barranquillaAddress = addresses.find(addr => 
      addr.city.toLowerCase().includes('barranquilla') || 
      addr.city.toLowerCase().includes('colombia')
    );
    console.log(`🇨🇴 Dirección de Barranquilla encontrada:`, barranquillaAddress);
    return barranquillaAddress ? barranquillaAddress.address : null;
  }
  
  if (destination === 'Barranquilla') {
    // Buscar dirección de Curazao (origen para envíos a Barranquilla)
    const curazaoAddress = addresses.find(addr => 
      addr.city.toLowerCase().includes('curazao') || 
      addr.city.toLowerCase().includes('curacao') || 
      addr.city.toLowerCase().includes('curaçao')
    );
    console.log(`🇨🇼 Dirección de Curazao encontrada:`, curazaoAddress);
    return curazaoAddress ? curazaoAddress.address : null;
  }
  
  return null;
}
