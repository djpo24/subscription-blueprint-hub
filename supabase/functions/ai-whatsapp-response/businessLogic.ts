
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

// Nueva función para detectar solicitudes de entrega a domicilio
export function isHomeDeliveryRequest(message: string): boolean {
  const deliveryKeywords = [
    'traer', 'llevar', 'entrega', 'domicilio', 'casa', 'enviar',
    'me la puedes traer', 'me lo puedes traer', 'pueden traer',
    'entrega a domicilio', 'llevar a casa', 'envío a casa',
    'delivery', 'entreguen', 'trae', 'lleve'
  ];

  const normalizedMessage = message.toLowerCase();
  
  return deliveryKeywords.some(keyword => normalizedMessage.includes(keyword));
}

// Nueva función para generar respuesta de entrega a domicilio
export function generateHomeDeliveryResponse(customerInfo: CustomerInfo, customerMessage: string): string | null {
  // Solo procesar si es una solicitud de entrega
  if (!isHomeDeliveryRequest(customerMessage)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';

  // Si el cliente no está registrado o no tiene encomiendas
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    return `Hola ${customerName} 👋

Para solicitar entrega a domicilio necesito verificar tus encomiendas en nuestro sistema.

Un momento por favor, estoy transfiriendo tu consulta a nuestra coordinadora Josefa quien verificará tu información y te ayudará con la entrega.

Josefa te responderá en breve para coordinar los detalles de la entrega 📦🚚`;
  }

  // Si tiene encomiendas, verificar el estado
  const deliverablePackages = customerInfo.pendingDeliveryPackages.filter(pkg => 
    pkg.status === 'en_destino' || pkg.status === 'delivered'
  );

  const pendingPaymentPackages = customerInfo.pendingPaymentPackages;

  if (deliverablePackages.length > 0 || pendingPaymentPackages.length > 0) {
    let response = `¡Hola ${customerName}! 📦

Veo que tienes encomienda${(deliverablePackages.length + pendingPaymentPackages.length) > 1 ? 's' : ''} en nuestro sistema:`;

    if (deliverablePackages.length > 0) {
      response += `\n\n✅ **Disponible${deliverablePackages.length > 1 ? 's' : ''} para entrega:**`;
      deliverablePackages.forEach(pkg => {
        response += `\n• ${pkg.tracking_number} - ${pkg.description || 'Encomienda'}`;
      });
    }

    if (pendingPaymentPackages.length > 0) {
      response += `\n\n💰 **Entregada${pendingPaymentPackages.length > 1 ? 's' : ''}, pendiente${pendingPaymentPackages.length > 1 ? 's' : ''} de pago:**`;
      pendingPaymentPackages.forEach(pkg => {
        response += `\n• ${pkg.tracking_number} - Pendiente: ${pkg.pendingAmount} ${pkg.currency}`;
      });
    }

    response += `\n\n🚚 **Para coordinar la entrega a domicilio:**
Un momento por favor, estoy transfiriendo tu solicitud a nuestra coordinadora Josefa quien coordinará todos los detalles contigo.

Josefa te contactará en breve para confirmar:
📍 Dirección de entrega
⏰ Horario disponible
💰 Detalles de pago (si aplica)

¡Gracias por tu paciencia! 😊`;

    return response;
  }

  // Si tiene encomiendas pero no están listas para entrega
  return `Hola ${customerName} 👋

Veo que tienes ${customerInfo.packagesCount} encomienda${customerInfo.packagesCount > 1 ? 's' : ''} en nuestro sistema, pero aún no ${customerInfo.packagesCount > 1 ? 'están' : 'está'} disponible${customerInfo.packagesCount > 1 ? 's' : ''} para entrega.

Un momento por favor, estoy transfiriendo tu consulta a nuestra coordinadora Josefa quien verificará el estado actual de tus encomiendas y te informará sobre las opciones de entrega.

Josefa te responderá pronto con los detalles actualizados 📦`;
}
