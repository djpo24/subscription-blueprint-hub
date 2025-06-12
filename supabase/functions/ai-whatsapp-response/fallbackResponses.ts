
import { CustomerInfo } from './types.ts';
import { formatCurrencyWithSymbol } from './utils.ts';

export function generateFallbackResponse(customerInfo: CustomerInfo): string {
  console.log(`🤖 [RESPUESTA DE EMERGENCIA] Cliente: ${customerInfo.customerFound ? customerInfo.customerFirstName : 'Nuevo cliente'}`);
  
  // Si encontramos al cliente con información específica
  if (customerInfo.customerFound && customerInfo.packagesCount > 0) {
    
    if (customerInfo.pendingPaymentPackages.length > 0) {
      const firstPackage = customerInfo.pendingPaymentPackages[0];
      const currency = firstPackage.currency || 'COP';
      const totalPendingThisCurrency = customerInfo.currencyBreakdown[currency] || firstPackage.pendingAmount;
      
      return `¡Hola ${customerInfo.customerFirstName}! 📦

💰 **SALDO PENDIENTE**

**Monto:** ${formatCurrencyWithSymbol(totalPendingThisCurrency, currency)}

📋 **Encomienda${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}:**
• ${customerInfo.pendingPaymentPackages.map(pkg => pkg.tracking_number).join('\n• ')}

✅ **Estado:** Ya entregada${customerInfo.pendingPaymentPackages.length > 1 ? 's' : ''}, pendiente pago únicamente.

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **Para procesar el pago:**
Contacta a nuestra coordinadora **Josefa**
**+59996964306**`;
    } 
    
    if (customerInfo.pendingDeliveryPackages.length > 0) {
      const firstPackage = customerInfo.pendingDeliveryPackages[0];
      
      let statusMessage = '';
      if (firstPackage.status === 'en_destino') {
        statusMessage = '✅ **DISPONIBLE PARA RETIRO**';
      } else if (firstPackage.status === 'transito') {
        statusMessage = '🚚 **EN TRÁNSITO HACIA DESTINO**';
      } else if (firstPackage.status === 'despachado') {
        statusMessage = '📦 **DESPACHADA HACIA DESTINO**';
      } else {
        statusMessage = `📋 **ESTADO:** ${firstPackage.status.toUpperCase()}`;
      }
      
      return `¡Hola ${customerInfo.customerFirstName}! 📦

${statusMessage}

🏷️ **Tracking:** ${firstPackage.tracking_number}
📍 **Ruta:** ${firstPackage.origin} → ${firstPackage.destination}
📝 **Descripción:** ${firstPackage.description || 'Encomienda general'}

${customerInfo.pendingDeliveryPackages.length > 1 ? `\n📦 **Y ${customerInfo.pendingDeliveryPackages.length - 1} encomienda${customerInfo.pendingDeliveryPackages.length - 1 > 1 ? 's' : ''} adicional${customerInfo.pendingDeliveryPackages.length - 1 > 1 ? 'es' : ''}.**` : ''}

¿Necesitas información adicional sobre alguna de tus encomiendas?`;
    }
    
    return `¡Hola ${customerInfo.customerFirstName}! ✅

📊 **ESTADO ACTUAL:**

• **Total encomiendas:** ${customerInfo.packagesCount}
• **Estado:** Todo al día - sin pendientes

¿En qué puedo ayudarte hoy?`;
  }
  
  // Respuesta para clientes nuevos o sin información específica - ESTRUCTURADA
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  return `¡Hola ${customerName}! 👋

**Soy SARA, tu asistente virtual de Envíos Ojito**

🛍️ **SERVICIOS DISPONIBLES:**

📦 **Consultas de encomiendas**
📋 **Estados de cuenta**  
🚚 **Información de viajes**
📍 **Direcciones de oficinas**
💰 **Tarifas de envío**

━━━━━━━━━━━━━━━━━━━━━━━━━━

¿En qué puedo ayudarte específicamente?

📞 **Para servicios personalizados:**
Contacta a nuestra coordinadora **Josefa**
**+59996964306**

*Reservas de espacio, procesos especiales y más*`;
}

// Nueva función para generar respuestas más contextuales - ESTRUCTURADA
export function generateContextualResponse(customerInfo: CustomerInfo, questionContext: string): string {
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  // Analizar el contexto de la pregunta para dar una respuesta más específica
  if (questionContext.toLowerCase().includes('viaje') || questionContext.toLowerCase().includes('próximo')) {
    return `¡Hola ${customerName}! 🚚

**INFORMACIÓN DE VIAJES**

📅 **Próximos viajes programados:**
Puedo ayudarte con la información disponible.

🎯 **¿A qué destino específico necesitas viajar o enviar?**

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **Para reservas específicas:**
Contacta a nuestra coordinadora **Josefa**
**+59996964306**

*Para confirmar disponibilidad y apartar tu espacio*`;
  }
  
  if (questionContext.toLowerCase().includes('tarifa') || questionContext.toLowerCase().includes('precio') || questionContext.toLowerCase().includes('costo')) {
    return `¡Hola ${customerName}! 💰

**INFORMACIÓN DE TARIFAS**

📦 **Tarifas de envío disponibles**

🎯 **¿A qué destino necesitas enviar tu encomienda?**

Con esa información puedo darte las tarifas actuales.

━━━━━━━━━━━━━━━━━━━━━━━━━━

📞 **Para cotizaciones específicas:**
Contacta a nuestra coordinadora **Josefa**
**+59996964306**

*Según peso o características especiales*`;
  }
  
  // Respuesta general más natural y estructurada
  return generateFallbackResponse(customerInfo);
}
