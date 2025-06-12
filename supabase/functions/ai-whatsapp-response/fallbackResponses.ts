
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  console.log(`🔄 [FALLBACK RADICAL] Cliente encontrado: ${customerInfo.customerFound}, encomiendas: ${customerInfo.packagesCount}`);
  
  // RESPUESTA RADICAL: Solo dar información si es específica y verificable
  if (customerInfo.customerFound && customerInfo.packagesCount > 0) {
    
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola ${customerInfo.customerFirstName}! 📦

💰 SALDO PENDIENTE: ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

📋 Encomienda${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}: ${customerInfo.pendingPaymentPackages.map(pkg => pkg.tracking_number).join(', ')}

✅ Ya entregada${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}, pendiente pago únicamente.

¿Necesitas información específica de alguna encomienda?`;
    } 
    
    if (customerInfo.pendingDeliveryPackages.length > 0) {
      const firstPackage = customerInfo.pendingDeliveryPackages[0];
      
      let statusMessage = '';
      if (firstPackage.status === 'en_destino') {
        statusMessage = '✅ DISPONIBLE PARA RETIRO';
      } else if (firstPackage.status === 'transito') {
        statusMessage = '🚚 EN TRÁNSITO HACIA DESTINO';
      } else if (firstPackage.status === 'despachado') {
        statusMessage = '📦 DESPACHADA HACIA DESTINO';
      } else {
        statusMessage = `📋 ESTADO: ${firstPackage.status.toUpperCase()}`;
      }
      
      return `¡Hola ${customerInfo.customerFirstName}! 📦

${statusMessage}

🏷️ Tracking: ${firstPackage.tracking_number}
📍 Ruta: ${firstPackage.origin} → ${firstPackage.destination}
📝 Descripción: ${firstPackage.description || 'Encomienda general'}

${customerInfo.pendingDeliveryPackages.length > 1 ? `\n📦 Y ${customerInfo.pendingDeliveryPackages.length - 1} encomienda${customerInfo.pendingDeliveryPackages.length - 1 > 1 ? 's' : ''} adicional${customerInfo.pendingDeliveryPackages.length - 1 > 1 ? 'es' : ''}.` : ''}

¿Necesitas información específica?`;
    }
    
    return `¡Hola ${customerInfo.customerFirstName}! ✅

📊 ESTADO ACTUAL:
• Total encomiendas: ${customerInfo.packagesCount}
• Todo al día - sin pendientes

¿En qué puedo ayudarte hoy?`;
  }
  
  // ESCALACIÓN AUTOMÁTICA para clientes no encontrados
  console.log('🚨 CLIENTE NO ENCONTRADO - DEBE ESCALAR AUTOMÁTICAMENTE');
  
  return `ESCALATE_IMMEDIATELY`;
}
