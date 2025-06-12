
import { CustomerInfo } from './types.ts';

export function validatePackageDeliveryTiming(customerInfo: CustomerInfo): { isValid: boolean; message?: string } {
  // Validar si hay encomiendas pendientes de entrega con timing crítico
  const criticalPackages = customerInfo.pendingDeliveryPackages.filter(pkg => {
    const isAtDestination = pkg.status === 'en_destino';
    return isAtDestination;
  });

  if (criticalPackages.length > 0) {
    return {
      isValid: false,
      message: `⚠️ URGENTE: Tienes ${criticalPackages.length} encomienda${criticalPackages.length > 1 ? 's' : ''} disponible${criticalPackages.length > 1 ? 's' : ''} para retiro inmediato.`
    };
  }

  return { isValid: true };
}

export function generateBusinessIntelligentResponse(customerInfo: CustomerInfo): string | null {
  if (!customerInfo.customerFound) {
    return null;
  }

  // Generar insights específicos del cliente
  const insights: string[] = [];

  if (customerInfo.pendingPaymentPackages.length > 0) {
    const totalPending = Object.values(customerInfo.currencyBreakdown).reduce((sum, amount) => sum + amount, 0);
    insights.push(`Cliente con saldo pendiente: ${totalPending} (${customerInfo.pendingPaymentPackages.length} encomiendas)`);
  }

  if (customerInfo.pendingDeliveryPackages.length > 0) {
    const atDestination = customerInfo.pendingDeliveryPackages.filter(pkg => pkg.status === 'en_destino').length;
    if (atDestination > 0) {
      insights.push(`${atDestination} encomienda(s) disponible(s) para retiro`);
    }
  }

  return insights.length > 0 ? insights.join('. ') : null;
}

// Función para detectar solicitudes de entrega a domicilio
export function isHomeDeliveryRequest(message: string): boolean {
  const deliveryKeywords = [
    'traer', 'llevar', 'entrega', 'domicilio', 'casa', 'enviar',
    'me la puedes traer', 'me lo puedes traer', 'pueden traer',
    'entrega a domicilio', 'llevar a casa', 'envío a casa',
    'delivery', 'entreguen', 'trae', 'lleve', 'envío a domicilio'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return deliveryKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// Función simplificada para respuesta de entrega a domicilio
export function generateHomeDeliveryResponse(customerInfo: CustomerInfo, customerMessage: string): string | null {
  // Solo procesar si es una solicitud de entrega
  if (!isHomeDeliveryRequest(customerMessage)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';

  // Respuesta directa sin ofrecer servicios - solo dirigir a Josefa
  return `Hola ${customerName} 👋

Para solicitudes de entrega a domicilio, por favor contacta directamente a nuestra coordinadora Josefa al +59996964306.

Ella podrá ayudarte con todos los detalles de este servicio.

¡Gracias! 😊`;
}
