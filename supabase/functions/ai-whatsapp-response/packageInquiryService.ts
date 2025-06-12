
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

// NUEVA FUNCIÓN: Detectar consultas sobre plazos de entrega de paquetes
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

// NUEVA FUNCIÓN: Generar respuesta para consultas sobre plazos de entrega
export function generatePackageDeliveryDeadlineResponse(
  customerInfo: CustomerInfo, 
  customerMessage: string,
  upcomingTrips: any[]
): string | null {
  
  // Solo procesar si es una consulta sobre plazos de entrega
  if (!isPackageDeliveryDeadlineInquiry(customerMessage)) {
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

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;
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
• 📦 Detalles de tu paquete
• 📋 Proceso de entrega

¡No esperes hasta el último momento! ⏰

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

// Generar respuesta para consultas de envío de paquetes - MEJORADA CON MEJOR CONTEXTO
export function generatePackageShippingResponse(
  customerInfo: CustomerInfo, 
  customerMessage: string,
  destinationAddresses: any[]
): string | null {
  
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
