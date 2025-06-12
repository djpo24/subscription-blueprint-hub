
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  console.log(`🔄 [FallbackResponse] Generando respuesta para cliente encontrado: ${customerInfo.customerFound}, encomiendas: ${customerInfo.packagesCount}`);
  
  if (customerInfo.customerFound) {
    if (customerInfo.packagesCount === 0) {
      return `¡Hola${customerInfo.customerFirstName ? ' ' + customerInfo.customerFirstName : ''}! 😊

He revisado minuciosamente su cuenta personal en nuestro sistema y actualmente no encuentro encomiendas registradas a su nombre.

🔍 Esto puede significar que:
- Sus encomiendas pueden estar registradas con un número de teléfono diferente
- Podrían estar bajo un nombre ligeramente diferente
- Aún no ha registrado encomiendas con nosotros

📋 Para ayudarle mejor, ¿podría proporcionarme:
- Su nombre completo como aparece en la encomienda
- Número de tracking si lo tiene
- Cualquier número adicional donde pudiera estar registrado

¡Estoy aquí para encontrar su información! 🌟`;
    }
    
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      
      // Calculate total pending for this currency - ONLY REAL DATA from THIS customer
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola${customerInfo.customerFirstName ? ' ' + customerInfo.customerFirstName : ''}! 😊

He encontrado su cuenta y confirmo que tiene un saldo pendiente de:

💰 ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

Este saldo corresponde a ${customerInfo.pendingPaymentPackages.length} encomienda${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''} entregada${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''} registrada${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''} en su cuenta personal.

¿Necesita detalles específicos de alguna encomienda o información para realizar el pago? ¡Aquí estoy para ayudarle! 🌟`;
    } else if (customerInfo.pendingDeliveryPackages.length > 0) {
      const firstPackage = customerInfo.pendingDeliveryPackages[0];
      return `¡Hola${customerInfo.customerFirstName ? ' ' + customerInfo.customerFirstName : ''}! 📦

Encontré su cuenta en nuestro sistema. Tiene ${customerInfo.pendingDeliveryPackages.length} encomienda${customerInfo.pendingDeliveryPackages.length > 1 ? 's' : ''} en proceso:

🚚 Tracking principal: ${firstPackage.tracking_number}
📍 Estado actual: ${firstPackage.status}
📍 Ruta: ${firstPackage.origin} → ${firstPackage.destination}

${customerInfo.pendingDeliveryPackages.length > 1 ? `Y ${customerInfo.pendingDeliveryPackages.length - 1} encomienda${customerInfo.pendingDeliveryPackages.length - 1 > 1 ? 's' : ''} adicional${customerInfo.pendingDeliveryPackages.length - 1 > 1 ? 'es' : ''}.` : ''}

¿Necesita información específica sobre alguna de sus encomiendas? 😊`;
    } else {
      return `¡Hola${customerInfo.customerFirstName ? ' ' + customerInfo.customerFirstName : ''}! 😊

He revisado su cuenta completa en nuestro sistema:

✅ Total de encomiendas históricas: ${customerInfo.packagesCount}
✅ Estado actual: Todas sus encomiendas están al día

No tiene encomiendas pendientes de entrega ni pagos pendientes en este momento.

¿En qué más puedo ayudarle hoy? 🌟`;
    }
  } else {
    return `¡Hola! 😊

No logro localizar una cuenta asociada a este número en nuestro sistema de encomiendas.

🔒 Por políticas de seguridad, solo puedo proporcionar información de cuentas verificadas.

Para ayudarle mejor, ¿podría compartirme:
- Su nombre completo
- Número de tracking de su encomienda
- Cualquier número adicional donde pueda estar registrado

Un miembro de nuestro equipo también le contactará pronto para verificar su información personal. 📞

¡Protegemos la privacidad de todos nuestros clientes! 🛡️`;
  }
}
