
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
      message: `⚠️ **URGENTE:** Tienes ${criticalPackages.length} encomienda${criticalPackages.length > 1 ? 's' : ''} disponible${criticalPackages.length > 1 ? 's' : ''} para retiro inmediato.`
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

// Nueva función para generar respuesta de entrega a domicilio - MEJORADA CON ESTRUCTURA
export function generateHomeDeliveryResponse(customerInfo: CustomerInfo, customerMessage: string): string | null {
  // Solo procesar si es una solicitud de entrega
  if (!isHomeDeliveryRequest(customerMessage)) {
    return null;
  }

  const customerName = customerInfo.customerFirstName || 'Cliente';

  // Si el cliente no está registrado o no tiene encomiendas
  if (!customerInfo.customerFound || customerInfo.packagesCount === 0) {
    return `¡Hola ${customerName}! 👋

🏠 **ENTREGA A DOMICILIO**

Para solicitar entrega a domicilio necesito verificar tus encomiendas en nuestro sistema.

🤝 **TRANSFERENCIA A COORDINADORA**

Estoy transfiriendo tu consulta a nuestra coordinadora **Josefa** quien:
• Verificará tu información  
• Te ayudará con la entrega
• Coordinará todos los detalles

**Josefa te responderá en breve** 📦🚚`;
  }

  // Si tiene encomiendas, verificar el estado
  const deliverablePackages = customerInfo.pendingDeliveryPackages.filter(pkg => 
    pkg.status === 'en_destino' || pkg.status === 'delivered'
  );

  const pendingPaymentPackages = customerInfo.pendingPaymentPackages;

  if (deliverablePackages.length > 0 || pendingPaymentPackages.length > 0) {
    let response = `¡Hola ${customerName}! 📦

🏠 **SOLICITUD DE ENTREGA A DOMICILIO**

📋 **TUS ENCOMIENDAS:**`;

    if (deliverablePackages.length > 0) {
      response += `\n\n✅ **Disponible${deliverablePackages.length > 1 ? 's' : ''} para entrega:**`;
      deliverablePackages.forEach(pkg => {
        response += `\n• **${pkg.tracking_number}** - ${pkg.description || 'Encomienda'}`;
      });
    }

    if (pendingPaymentPackages.length > 0) {
      response += `\n\n💰 **Entregada${pendingPaymentPackages.length > 1 ? 's' : ''}, pendiente${pendingPaymentPackages.length > 1 ? 's' : ''} de pago:**`;
      pendingPaymentPackages.forEach(pkg => {
        // Usar el formato correcto para mostrar pendientes
        const formattedAmount = pkg.currency === 'AWG' 
          ? `ƒ${pkg.pendingAmount} florines`
          : `$${pkg.pendingAmount.toLocaleString('es-CO')} pesos`;
        
        response += `\n• **${pkg.tracking_number}** - Pendiente: **${formattedAmount}**`;
      });
    }

    response += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━

🤝 **COORDINACIÓN DE ENTREGA**

Estoy transfiriendo tu solicitud a nuestra coordinadora **Josefa** quien coordinará:

📍 **Dirección de entrega**
⏰ **Horario disponible**  
💰 **Detalles de pago** (si aplica)

**Josefa te contactará en breve** para confirmar todos los detalles.

¡Gracias por tu paciencia! 😊`;

    return response;
  }

  // Si tiene encomiendas pero no están listas para entrega
  return `¡Hola ${customerName}! 👋

🏠 **ENTREGA A DOMICILIO**

📦 **ESTADO DE TUS ENCOMIENDAS:**
• Tienes **${customerInfo.packagesCount}** encomienda${customerInfo.packagesCount > 1 ? 's' : ''} en nuestro sistema
• Aún no ${customerInfo.packagesCount > 1 ? 'están' : 'está'} disponible${customerInfo.packagesCount > 1 ? 's' : ''} para entrega

🤝 **VERIFICACIÓN DE ESTADO**

Estoy transfiriendo tu consulta a nuestra coordinadora **Josefa** quien:
• Verificará el estado actual de tus encomiendas
• Te informará sobre las opciones de entrega
• Te mantendrá actualizado sobre el progreso

**Josefa te responderá pronto** con los detalles actualizados 📦`;
}
