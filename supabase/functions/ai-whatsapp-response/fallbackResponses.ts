
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  if (customerInfo.customerFound) {
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      
      // Calculate total pending for this currency
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola ${customerInfo.customerFirstName}! 😊

Tienes un pago pendiente de:
💰 ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

Por tu encomienda:
📦 ${firstPackage.tracking_number} (${firstPackage.description || 'productos varios'})

¿En qué más puedo ayudarte? 🌟`;
    } else if (customerInfo.pendingDeliveryPackages.length > 0) {
      return `¡Hola ${customerInfo.customerFirstName}! 📦

Tu encomienda está en proceso:
🚚 ${customerInfo.pendingDeliveryPackages[0].tracking_number}: ${customerInfo.pendingDeliveryPackages[0].status}

¿Necesitas más información? 😊`;
    } else {
      return `¡Hola ${customerInfo.customerFirstName}! 😊

Todas tus encomiendas están al día.

¿En qué puedo ayudarte hoy? 🌟`;
    }
  } else {
    return `¡Hola! 😊

Para ayudarte mejor, ¿podrías proporcionarme tu número de tracking o el nombre con el que registraste tu encomienda?

¡Estoy aquí para ayudarte! 📞`;
  }
}
