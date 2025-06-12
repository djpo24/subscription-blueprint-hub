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
  
  // NUEVA LÓGICA: Excluir consultas que claramente preguntan por fechas de viajes
  const tripDateKeywords = [
    'cuando viajan', 'cuándo viajan', 'cuando hay viaje', 'cuándo hay viaje',
    'próximo viaje', 'proximo viaje', 'siguiente viaje',
    'fecha del viaje', 'fecha de viaje', 'fechas de viaje',
    'cuando sale', 'cuándo sale', 'cuando salen', 'cuándo salen'
  ];
  
  // Si la consulta es claramente sobre fechas de viajes, NO es consulta de envío
  const isAboutTripDates = tripDateKeywords.some(keyword => normalizedMessage.includes(keyword));
  if (isAboutTripDates) {
    return false;
  }
  
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

// FUNCIÓN MEJORADA: Detectar consultas sobre fechas de próximos viajes con mayor precisión
export function isNextTripInquiry(message: string): boolean {
  const tripKeywords = [
    'cuando es el próximo viaje', 'cuándo es el próximo viaje',
    'próximo viaje', 'proximo viaje', 'siguiente viaje',
    'cuando viajan', 'cuándo viajan', 'fecha del viaje',
    'próxima fecha', 'proxima fecha', 'cuando hay viaje',
    'cuándo hay viaje', 'próximos vuelos', 'proximos vuelos',
    'cuando sale', 'cuándo sale', 'cuando salen', 'cuándo salen',
    'fechas de viaje', 'fecha de viaje', 'horario de viajes',
    'programación de viajes', 'programacion de viajes',
    'itinerario de viajes', 'calendario de viajes'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return tripKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// FUNCIÓN MEJORADA: Analizar consulta completa con múltiples preguntas
export function analyzeCompleteInquiry(message: string): {
  hasShippingQuestion: boolean;
  hasDeadlineQuestion: boolean;
  hasTripDateQuestion: boolean;
  destination: string | null;
  isMultipleQuestionInquiry: boolean;
  questionCount: number;
} {
  const normalizedMessage = message.toLowerCase();
  
  const hasShippingQuestion = isPackageShippingInquiry(message);
  const hasDeadlineQuestion = isPackageDeliveryDeadlineInquiry(message);
  const hasTripDateQuestion = isNextTripInquiry(message);
  const destination = extractDestinationFromMessage(message);
  
  // Contar preguntas específicas detectadas
  const questionCount = [hasShippingQuestion, hasDeadlineQuestion, hasTripDateQuestion].filter(Boolean).length;
  
  // Es consulta múltiple si tiene más de un tipo de pregunta O si el mensaje es muy largo con múltiples interrogantes
  const hasMultipleQuestionMarkers = (message.match(/\?/g) || []).length > 1;
  const isLongMessage = message.length > 80;
  const isMultipleQuestionInquiry = questionCount > 1 || (hasMultipleQuestionMarkers && isLongMessage);
  
  console.log(`🔍 [AnalysisResult] Preguntas detectadas: Envío=${hasShippingQuestion}, Plazo=${hasDeadlineQuestion}, FechaViaje=${hasTripDateQuestion}, Destino=${destination}, Múltiple=${isMultipleQuestionInquiry}, Count=${questionCount}`);
  
  return {
    hasShippingQuestion,
    hasDeadlineQuestion,
    hasTripDateQuestion,
    destination,
    isMultipleQuestionInquiry,
    questionCount
  };
}

// FUNCIÓN NUEVA: Generar respuesta específica para consultas de fechas de viajes
export function generateTripDateResponse(
  customerInfo: CustomerInfo,
  customerMessage: string,
  upcomingTrips: any[]
): string | null {
  
  const analysis = analyzeCompleteInquiry(customerMessage);
  
  // Solo procesar si es una consulta específica sobre fechas de viajes (no múltiple)
  if (analysis.isMultipleQuestionInquiry || !analysis.hasTripDateQuestion) {
    return null;
  }

  console.log(`📅 [TripDateResponse] Generando respuesta de fechas de viajes para destino: ${analysis.destination}`);

  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  // Si no se especifica destino, mostrar todos los próximos viajes
  if (!analysis.destination) {
    if (!upcomingTrips || upcomingTrips.length === 0) {
      return `¡Hola ${customerName}! 👋✈️

📅 **Próximos viajes programados:**

🚨 **No hay viajes programados** en los próximos días.

📞 **Para programar viajes, contacta a:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

Darwin te informará sobre las próximas fechas disponibles.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
    }

    // Mostrar todos los próximos viajes
    let response = `¡Hola ${customerName}! 👋✈️

📅 **Próximos viajes programados:**

`;

    upcomingTrips.slice(0, 5).forEach((trip, index) => {
      const tripDate = new Date(trip.trip_date + 'T00:00:00');
      const formattedDate = tripDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
      const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      
      response += `${index + 1}. 📅 **${capitalizedDate}**\n`;
      response += `   🛫 **${trip.origin}** → **${trip.destination}**\n`;
      if (trip.flight_number) {
        response += `   ✈️ **Vuelo:** ${trip.flight_number}\n`;
      }
      response += `\n`;
    });

    response += `📞 **Reservar espacio:** Contacta a **Darwin Pedroza** al **+573127271746**

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

    return response;
  }
  
  // Buscar viajes HACIA el destino solicitado
  const destinationTrips = upcomingTrips.filter(trip => {
    const tripDestination = trip.destination.toLowerCase();
    const requestedDestination = analysis.destination!.toLowerCase();
    
    if (requestedDestination.includes('colombia') || requestedDestination.includes('barranquilla')) {
      return tripDestination.includes('barranquilla') || tripDestination.includes('colombia');
    } else if (requestedDestination.includes('curazao') || requestedDestination.includes('curacao')) {
      return tripDestination.includes('curazao') || tripDestination.includes('curacao');
    }
    
    return false;
  });
  
  console.log(`🚀 [TripSearch] Viajes encontrados hacia ${analysis.destination}: ${destinationTrips.length}`);
  
  if (destinationTrips.length === 0) {
    return `¡Hola ${customerName}! 👋✈️

📅 **Viajes hacia ${analysis.destination.toUpperCase()}:**

🚨 **No hay viajes programados hacia ${analysis.destination}** en los próximos días.

📞 **Contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

Darwin te informará sobre las próximas fechas disponibles para ${analysis.destination}.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }
  
  // Mostrar los próximos viajes hacia el destino específico
  let response = `¡Hola ${customerName}! 👋✈️

📅 **Próximos viajes hacia ${analysis.destination.toUpperCase()}:**

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
    response += `   🛫 **Destino:** ${trip.destination}\n`;
    if (trip.flight_number) {
      response += `   ✈️ **Vuelo:** ${trip.flight_number}\n`;
    }
    response += `\n`;
  });

  response += `📞 **Reservar espacio:** Contacta a **Darwin Pedroza** al **+573127271746**

¿Necesitas información sobre el proceso de envío?

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

  return response;
}

// FUNCIÓN MEJORADA: Generar respuesta integrada SOLO para consultas verdaderamente múltiples
export function generateIntegratedPackageResponse(
  customerInfo: CustomerInfo,
  customerMessage: string,
  upcomingTrips: any[],
  destinationAddresses: any[]
): string | null {
  
  const analysis = analyzeCompleteInquiry(customerMessage);
  
  // SOLO procesar si es una consulta verdaderamente múltiple (más de 2 tipos de preguntas)
  if (!analysis.isMultipleQuestionInquiry || analysis.questionCount < 2) {
    return null;
  }
  
  console.log(`🎯 [IntegratedResponse] Generando respuesta integrada para destino: ${analysis.destination}`);
  
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  if (!analysis.destination) {
    return `¡Hola ${customerName}! 👋📦

Para responderte todas tus preguntas sobre el envío, necesito conocer:

🎯 **¿Hacia qué destino quieres enviar tu encomienda?**
• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla, Colombia**

Una vez me indiques el destino, te proporcionaré toda la información que necesitas. 📋

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

// FUNCIÓN MEJORADA: Generar respuesta para consultas sobre plazos de entrega CON FECHAS EXACTAS
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

📞 **Contacta a nuestro coordinador:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

Darwin te ayudará con las fechas disponibles para programar tu envío.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
  }

  // Obtener el próximo viaje
  const nextTrip = upcomingTrips[0];
  const tripDate = new Date(nextTrip.trip_date + 'T00:00:00');
  
  // Calcular fecha límite (un día antes del viaje)
  const deadlineDate = new Date(tripDate);
  deadlineDate.setDate(deadlineDate.getDate() - 1);
  
  // Formatear la fecha límite en español con día de la semana
  const deadlineOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const formattedDeadline = deadlineDate.toLocaleDateString('es-ES', deadlineOptions);
  
  // Formatear fecha del viaje
  const tripOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const formattedTripDate = tripDate.toLocaleDateString('es-ES', tripOptions);
  
  // Capitalizar primera letra del día de la semana
  const capitalizedDeadline = formattedDeadline.charAt(0).toUpperCase() + formattedDeadline.slice(1);
  const capitalizedTripDate = formattedTripDate.charAt(0).toUpperCase() + formattedTripDate.slice(1);

  return `¡Hola ${customerName}! 👋⏰

⚠️ **PLAZO DE ENTREGA DE PAQUETES**

🚨 **Fecha límite exacta:** ${capitalizedDeadline} a las 6:00 PM

**Después de esta fecha y hora no aseguramos que pueda viajar en el próximo viaje programado.**

━━━━━━━━━━━━━━━━━━━━━━━━━━

✈️ **PRÓXIMO VIAJE:**
📅 **${capitalizedTripDate}**
🛫 **Ruta:** ${nextTrip.origin} → ${nextTrip.destination}
${nextTrip.flight_number ? `✈️ **Vuelo:** ${nextTrip.flight_number}` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **RESERVAR ESPACIO:**
🧑‍💼 **Darwin Pedroza**  
📱 **+573127271746**

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
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

// FUNCIÓN COMPLETAMENTE REESCRITA: Generar respuesta CONVERSACIONAL para consultas de envío
export function generatePackageShippingResponse(
  customerInfo: CustomerInfo, 
  customerMessage: string,
  destinationAddresses: any[]
): string | null {
  
  // Solo procesar si es una consulta simple de envío (no múltiple y no sobre fechas de viajes)
  const analysis = analyzeCompleteInquiry(customerMessage);
  if (analysis.isMultipleQuestionInquiry || analysis.hasTripDateQuestion) {
    return null; // Will be handled by integrated response or trip date response
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
    
    return `📍 **Perfecto, ${customerName}!**

Para enviar hacia **${extractedDestination.toUpperCase()}**, debes entregar tu paquete en:

**${originAddress || 'Dirección no disponible en el sistema'}**

📞 **Siguiente paso:** Contacta a **Darwin Pedroza** al **+573127271746** para reservar espacio en el próximo vuelo.

¿Necesitas saber algo más sobre el proceso de envío?

✈️ **Envíos Ojito**`;
  }
  
  // NUEVA LÓGICA: Si no se especifica destino, hacer pregunta conversacional simple
  if (!extractedDestination && isPackageShippingInquiry(customerMessage)) {
    return `¡Hola ${customerName}! 👋

🎯 **¿Hacia qué destino quieres enviar tu paquete?**

• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla**

Una vez me digas el destino, te indico dónde debes llevarlo.

✈️ **Envíos Ojito**`;
  }

  // Si se especifica destino en la consulta inicial, dar solo la dirección
  if (extractedDestination) {
    const originAddress = findOriginAddressForDestination(extractedDestination, destinationAddresses);
    
    return `📍 **Para enviar hacia ${extractedDestination.toUpperCase()}:**

Lleva tu paquete a:
**${originAddress || 'Dirección no disponible en el sistema'}**

📞 **Reserva espacio:** Contacta a **Darwin Pedroza** al **+573127271746**

¿Necesitas saber algo más?

✈️ **Envíos Ojito**`;
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
