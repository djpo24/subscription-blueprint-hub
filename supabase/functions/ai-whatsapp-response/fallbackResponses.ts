
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  if (customerInfo.customerFound) {
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      
      // Calculate total pending for this currency - ONLY REAL DATA
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola ${customerInfo.customerFirstName}! 😊

Revisé tu cuenta en nuestro sistema y confirmo que tienes un saldo pendiente de:

💰 ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

Este saldo corresponde a tu encomienda registrada en nuestro sistema.

¿Necesitas que confirme algún detalle específico? ¡Aquí estoy para ayudarte! 🌟`;
    } else if (customerInfo.pendingDeliveryPackages.length > 0) {
      const firstPackage = customerInfo.pendingDeliveryPackages[0];
      return `¡Hola ${customerInfo.customerFirstName}! 📦

Según nuestro sistema, tienes ${customerInfo.pendingDeliveryPackages.length} encomienda${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''} registrada${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''}:

🚚 Tracking: ${firstPackage.tracking_number}
📍 Estado actual: ${firstPackage.status}

¿Hay algo específico que necesites confirmar? 😊`;
    } else {
      return `¡Hola ${customerInfo.customerFirstName}! 😊

Según nuestro sistema, tienes todas tus encomiendas al día.

¿En qué más puedo ayudarte hoy? 🌟`;
    }
  } else {
    return `¡Hola! 😊

No logro localizar tu información en nuestro sistema con este número.

Para ayudarte mejor, ¿podrías compartirme:
- Tu número de tracking
- El nombre con el que registraste la encomienda

Un miembro de nuestro equipo también te contactará pronto para verificar tu información. 📞`;
  }
}
