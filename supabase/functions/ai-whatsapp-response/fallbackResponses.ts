
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

Claro que sí, puedes pasar cuando gustes.

El valor total a pagar es de:
💰 ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

Por tu encomienda de:
📦 (${firstPackage.description || 'productos varios'})

¿Necesitas más información? ¡Con gusto te ayudo! 🌟`;
    } else if (customerInfo.pendingDeliveryPackages.length > 0) {
      return `¡Hola ${customerInfo.customerFirstName}! 📦

Tienes ${customerInfo.pendingDeliveryPackages.length} encomienda${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''} en camino:

🚚 ${customerInfo.pendingDeliveryPackages[0].tracking_number}: ${customerInfo.pendingDeliveryPackages[0].status}

¿Hay algo específico que necesites saber? 😊`;
    } else {
      return `¡Hola ${customerInfo.customerFirstName}! 😊

¡Excelente! Tienes todas tus encomiendas al día.

¿En qué más puedo ayudarte hoy? 🌟`;
    }
  } else {
    return `¡Hola! 😊

Para ayudarte mejor, necesito localizar tu información.

¿Podrías compartirme tu número de tracking o el nombre con el que registraste tus encomiendas?

¡Un agente también te contactará pronto! 📞`;
  }
}
