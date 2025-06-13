
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
    /cuando.*paquete/i,
    /ya.*llegó/i,
    /llegó.*encomienda/i,
    /llegó.*paquete/i
  ];

  return packageInquiryPatterns.some(pattern => pattern.test(message));
}

// FUNCIÓN ACTUALIZADA: Respuestas directas y concisas con formato para consultas de encomiendas
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
  
  // Detectar si pregunta específicamente sobre llegada/estado
  const isArrivalInquiry = /ya.*llegó|llegó.*encomienda|llegó.*paquete|está.*lista|puedo.*recoger/i.test(message);
  
  // CASO 1: Cliente NO registrado o SIN encomiendas
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    console.log(`📭 [PackageInquiry] Cliente sin encomiendas registradas`);
    
    return `¡Hola ${customerName}! 👋

No tenemos encomiendas registradas a tu nombre actualmente. 📭

Si enviaste una encomienda, compárteme el número de tracking (ejemplo: **EO-2025-1234**) para verificar el estado.

✈️ **Envíos Ojito**`;
  }
  
  // CASO 2: Cliente CON encomiendas - Respuesta DIRECTA según la pregunta con formato
  console.log(`📦 [PackageInquiry] Cliente con ${customerInfo.packagesCount} encomienda(s) - Respuesta directa`);
  
  // Si pregunta específicamente sobre llegada/estado
  if (isArrivalInquiry && customerInfo.pendingDeliveryPackages.length > 0) {
    const pkg = customerInfo.pendingDeliveryPackages[0];
    
    if (pkg.status === 'en_destino') {
      return `¡Hola ${customerName}! 👋

Sí, tu encomienda **${pkg.tracking_number}** ya llegó a ${pkg.destination}. ✅

📦 Está lista para recoger.`;
    } else {
      return `¡Hola ${customerName}! 👋

No, tu encomienda **${pkg.tracking_number}** aún no ha llegado a ${pkg.destination}. 🛫

Te avisamos cuando llegue. ⏰`;
    }
  }
  
  // Para otras consultas generales sobre encomiendas
  if (customerInfo.pendingDeliveryPackages.length > 0) {
    const pkg = customerInfo.pendingDeliveryPackages[0];
    
    if (pkg.status === 'en_destino') {
      return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está en ${pkg.destination}. 📍

✅ Lista para recoger.`;
    } else {
      return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está en tránsito hacia ${pkg.destination}. 🛫

Te avisamos cuando llegue. ⏰`;
    }
  }
  
  // Fallback para casos no cubiertos
  return `¡Hola ${customerName}! 👋

Tienes **${customerInfo.packagesCount}** encomienda(s) en nuestro sistema. 📦

¿Qué información específica necesitas?`;
}
