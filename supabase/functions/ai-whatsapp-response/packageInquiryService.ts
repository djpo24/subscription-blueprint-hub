
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
    'dirección de envío', 'direccion de envio'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return shippingKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// Detectar destino mencionado en el mensaje
export function extractDestinationFromMessage(message: string): string | null {
  const normalizedMessage = message.toLowerCase();
  
  // Detectar menciones de Curazao
  if (normalizedMessage.includes('curazao') || normalizedMessage.includes('curacao') || 
      normalizedMessage.includes('curaçao') || normalizedMessage.includes('hacia curazao') ||
      normalizedMessage.includes('para curazao') || normalizedMessage.includes('a curazao')) {
    return 'Curazao';
  }
  
  // Detectar menciones de Barranquilla/Colombia
  if (normalizedMessage.includes('barranquilla') || normalizedMessage.includes('colombia') ||
      normalizedMessage.includes('hacia barranquilla') || normalizedMessage.includes('para barranquilla') ||
      normalizedMessage.includes('a barranquilla') || normalizedMessage.includes('a colombia')) {
    return 'Barranquilla';
  }
  
  return null;
}

// Generar respuesta para consultas de envío de paquetes - MEJORADA CON ESTRUCTURA
export function generatePackageShippingResponse(
  customerInfo: CustomerInfo, 
  customerMessage: string,
  destinationAddresses: any[]
): string | null {
  
  // Solo procesar si es una consulta de envío
  if (!isPackageShippingInquiry(customerMessage)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';
  const extractedDestination = extractDestinationFromMessage(customerMessage);
  
  // Si no se especifica destino, preguntar CON ESTRUCTURA CLARA
  if (!extractedDestination) {
    return `¡Hola ${customerName}! 📦

**ENVÍO DE ENCOMIENDAS**

Para ayudarte con el envío, necesito conocer:

🎯 **¿Hacia qué destino quieres enviar tu encomienda?**

**Destinos disponibles:**
• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla, Colombia**

Una vez me indiques el destino, te proporcionaré toda la información necesaria para el envío.`;
  }

  // Buscar la dirección de origen correspondiente
  const originAddress = findOriginAddressForDestination(extractedDestination, destinationAddresses);
  
  let response = `¡Hola ${customerName}! 📦

**INFORMACIÓN PARA ENVÍO HACIA ${extractedDestination.toUpperCase()}**

📍 **Dirección para entregar tu paquete:**
${originAddress || 'Dirección no disponible en el sistema'}

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **RESERVAR ESPACIO EN EL PRÓXIMO VIAJE**

**Contacta a nuestro coordinador:**
👤 **Darwin Pedroza**  
📱 **+599 9696 4306**

**Darwin te ayudará con:**
• ✅ Reserva de espacio
• ✅ Fechas disponibles  
• ✅ Tarifas y pagos
• ✅ Seguimiento del envío

━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 **PROCESO DE ENVÍO:**

**1.** Lleva tu paquete a la dirección indicada
**2.** Nuestro equipo lo recibirá y procesará  
**3.** Será transportado hacia ${extractedDestination}
**4.** Te notificaremos cuando llegue a destino

¡Estamos listos para ayudarte con tu envío! 🚚`;

  return response;
}

// Encontrar dirección de origen basada en el destino
function findOriginAddressForDestination(destination: string, addresses: any[]): string | null {
  if (!addresses || addresses.length === 0) {
    return null;
  }

  // Lógica: si envía hacia Curazao, debe entregar en Barranquilla (origen)
  // Si envía hacia Barranquilla, debe entregar en Curazao (origen)
  
  if (destination === 'Curazao') {
    // Buscar dirección de Barranquilla (origen para envíos a Curazao)
    const barranquillaAddress = addresses.find(addr => 
      addr.city.toLowerCase().includes('barranquilla')
    );
    return barranquillaAddress ? barranquillaAddress.address : null;
  }
  
  if (destination === 'Barranquilla') {
    // Buscar dirección de Curazao (origen para envíos a Barranquilla)
    const curazaoAddress = addresses.find(addr => 
      addr.city.toLowerCase().includes('curazao') || 
      addr.city.toLowerCase().includes('curacao')
    );
    return curazaoAddress ? curazaoAddress.address : null;
  }
  
  return null;
}
