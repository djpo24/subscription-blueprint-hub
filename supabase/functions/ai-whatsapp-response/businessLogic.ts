
import { CustomerInfo } from './types.ts';

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
  
  return `¡Hola ${customerName}! 👋🚚

**ENTREGA A DOMICILIO COORDINADA**

Para coordinar la entrega de tu encomienda a domicilio, te voy a transferir con **Josefa**, nuestra coordinadora de entregas.

📞 **Josefa te contactará para:**
• 📍 Confirmar tu dirección de entrega
• ⏰ Coordinar horario conveniente
• 💰 Confirmar costos de entrega a domicilio
• 📦 Detalles específicos de tu encomienda

**Josefa te contactará en los próximos minutos** para organizar todo el proceso de entrega.

🏠 **Envíos Ojito** - ¡Tu encomienda hasta la puerta de tu casa!`;
}

// NUEVA FUNCIÓN: Detectar consultas sobre encomiendas específicas en origen
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
    /cuando.*paquete/i
  ];

  return packageInquiryPatterns.some(pattern => pattern.test(message));
}

// FUNCIÓN COMPLETAMENTE REESCRITA: Análisis inteligente de consultas de encomiendas
export function generatePackageOriginClarificationResponse(
  customerInfo: CustomerInfo, 
  message: string,
  packageDetails?: any
): string | null {
  
  if (!detectPackageStatusInquiry(message)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  console.log(`🔍 [PackageInquiry] Analizando consulta de encomienda para ${customerName}: packagesCount=${customerInfo.packagesCount}`);
  
  // Extraer número de tracking si está presente
  const trackingMatch = message.match(/\b(EO-\d{4}-\d+)\b/i);
  const trackingNumber = trackingMatch ? trackingMatch[1] : null;
  
  // CASO 1: Cliente NO registrado o SIN encomiendas
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    console.log(`📭 [PackageInquiry] Cliente sin encomiendas registradas`);
    
    if (trackingNumber) {
      return `¡Hola ${customerName}! 👋📦

Veo que consultas por la encomienda **${trackingNumber}**.

📋 **Para verificar el estado actual**, necesito que me confirmes:

🔍 **¿Eres el remitente o el destinatario de esta encomienda?**

Una vez me confirmes esto, podré darte información específica y actualizada sobre tu encomienda.

✈️ **Envíos Ojito** - Información precisa cuando la necesitas`;
    } else {
      return `¡Hola ${customerName}! 👋📦

Para ayudarte con información sobre tu encomienda, necesito algunos datos:

🔍 **Por favor compárteme:**
• 📋 **Número de tracking** (ejemplo: EO-2025-1234)
• 🆔 **¿Eres el remitente o destinatario?**

Con esta información podré darte detalles exactos sobre el estado y ubicación de tu encomienda.

✈️ **Envíos Ojito** - Información precisa cuando la necesitas`;
    }
  }
  
  // CASO 2: Cliente CON encomiendas registradas
  console.log(`📦 [PackageInquiry] Cliente con ${customerInfo.packagesCount} encomienda(s) registrada(s)`);
  
  let response = `¡Hola ${customerName}! 👋📦\n\n`;
  
  // Si menciona un tracking específico
  if (trackingNumber) {
    response += `Veo que consultas por la encomienda **${trackingNumber}**.\n\n`;
    response += `📋 **Tienes ${customerInfo.packagesCount} encomienda(s) en nuestro sistema.**\n\n`;
  } else {
    response += `📋 **Tienes ${customerInfo.packagesCount} encomienda(s) en nuestro sistema.**\n\n`;
  }
  
  // Mostrar información específica de las encomiendas
  if (customerInfo.pendingDeliveryPackages.length > 0) {
    response += `📦 **Encomiendas en destino (listas para recoger):**\n`;
    customerInfo.pendingDeliveryPackages.slice(0, 3).forEach((pkg: any) => {
      response += `• **${pkg.tracking_number}** - ${pkg.status}\n`;
      response += `  📍 Destino: ${pkg.destination}\n`;
      if (pkg.description) {
        response += `  📝 ${pkg.description}\n`;
      }
    });
    response += `\n`;
  }
  
  if (customerInfo.pendingPaymentPackages.length > 0) {
    response += `💰 **Encomiendas con saldo pendiente:**\n`;
    customerInfo.pendingPaymentPackages.slice(0, 3).forEach((pkg: any) => {
      const formattedAmount = pkg.currency === 'AWG' 
        ? `ƒ${pkg.pendingAmount} florines`
        : `$${pkg.pendingAmount.toLocaleString('es-CO')} pesos`;
      response += `• **${pkg.tracking_number}** - Pendiente: ${formattedAmount}\n`;
      response += `  📍 Destino: ${pkg.destination}\n`;
    });
    response += `\n`;
  }
  
  response += `🤔 **¿Qué información específica necesitas?**\n\n`;
  response += `• 🛫 **¿Cuándo sale el viaje?** (fecha de departure)\n`;
  response += `• 🛬 **¿Cuándo llega a destino?** (fecha de arrival)\n`;
  response += `• 📍 **¿Dónde puedo recogerla cuando llegue?** (dirección en destino)\n`;
  response += `• ⏰ **¿Hasta cuándo tengo tiempo para que salga en el próximo viaje?**\n`;
  response += `• 📊 **¿Cuál es el estado actual?**\n\n`;
  response += `Una vez me digas qué necesitas saber, te daré la información exacta y actualizada. 😊\n\n`;
  response += `✈️ **Envíos Ojito** - Información precisa cuando la necesitas`;

  return response;
}
