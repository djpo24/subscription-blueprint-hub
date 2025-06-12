
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  if (customerInfo.customerFound) {
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      
      // Calculate total pending for this currency - ONLY REAL DATA from THIS customer
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola! 😊

Revisé su cuenta personal en nuestro sistema y confirmo que tiene un saldo pendiente de:

💰 ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

Este saldo corresponde a su encomienda registrada en su cuenta personal.

¿Necesita que confirme algún detalle específico de su cuenta? ¡Aquí estoy para ayudarle! 🌟`;
    } else if (customerInfo.pendingDeliveryPackages.length > 0) {
      const firstPackage = customerInfo.pendingDeliveryPackages[0];
      return `¡Hola! 📦

Según su cuenta en nuestro sistema, tiene ${customerInfo.pendingDeliveryPackages.length} encomienda${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''} registrada${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''}:

🚚 Su tracking: ${firstPackage.tracking_number}
📍 Estado actual: ${firstPackage.status}

¿Hay algo específico que necesite confirmar sobre su encomienda? 😊`;
    } else {
      return `¡Hola! 😊

Según su cuenta en nuestro sistema, tiene todas sus encomiendas al día.

¿En qué más puedo ayudarle con su cuenta hoy? 🌟`;
    }
  } else {
    return `¡Hola! 😊

No logro localizar una cuenta asociada a este número en nuestro sistema.

🔒 Por políticas de seguridad, solo puedo proporcionar información de cuentas verificadas.

Para ayudarle mejor, ¿podría compartirme:
- Su número de tracking personal
- El nombre con el que registró su encomienda

Un miembro de nuestro equipo también le contactará pronto para verificar su información personal. 📞

¡Protegemos la privacidad de todos nuestros clientes! 🛡️`;
  }
}
