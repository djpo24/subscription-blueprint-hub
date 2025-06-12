
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  console.log(`🤖 [RESPUESTA AUTOMÁTICA] Cliente: ${customerInfo.customerFound ? customerInfo.customerFirstName : 'Nuevo cliente'}`);
  
  // Si encontramos al cliente con información específica
  if (customerInfo.customerFound && customerInfo.packagesCount > 0) {
    
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola ${customerInfo.customerFirstName}! 📦

💰 SALDO PENDIENTE: ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

📋 Encomienda${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}: ${customerInfo.pendingPaymentPackages.map(pkg => pkg.tracking_number).join(', ')}

✅ Ya entregada${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}, pendiente pago únicamente.

Para procesar el pago o información específica, contacta a nuestra coordinadora Josefa al +59996964306.`;
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

Para coordinaciones específicas, contacta a Josefa al +59996964306.`;
    }
    
    return `¡Hola ${customerInfo.customerFirstName}! ✅

📊 ESTADO ACTUAL:
• Total encomiendas: ${customerInfo.packagesCount}
• Todo al día - sin pendientes

Para nuevas consultas o servicios, contacta a nuestra coordinadora Josefa al +59996964306.`;
  }
  
  // Respuesta para clientes nuevos o sin información específica - CON CONTACTO DIRECTO
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  return `¡Hola ${customerName}! 👋

Soy SARA, tu asistente virtual de Envíos Ojito. Puedo ayudarte con:

📦 **Consultas de encomiendas existentes**
📋 **Estados de cuenta**
🚚 **Información general de viajes**
📍 **Direcciones de oficinas**

Para servicios específicos como:
• Reservas de espacio
• Cotizaciones personalizadas  
• Programación de envíos
• Coordinaciones especiales

📞 **Contacta directamente a nuestra coordinadora Josefa:**
**+59996964306**

Ella podrá ayudarte con todos los detalles y procesos específicos que necesites. 😊`;
}
