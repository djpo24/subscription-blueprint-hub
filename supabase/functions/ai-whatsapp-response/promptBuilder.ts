
export function buildSystemPrompt(customerInfo: any, freightRates: any[], tripsContext: string, addressesContext: string): string {
  const customerName = customerInfo.customerFirstName || 'Cliente';
  const hasPackages = customerInfo.packagesCount > 0;
  
  let systemPrompt = `Eres SARA, asistente virtual de Envíos Ojito. REGLAS ESTRICTAS:

COMPORTAMIENTO CRÍTICO:
- SOLO responde si tienes información ESPECÍFICA y VERIFICABLE del cliente
- Si NO tienes la información exacta que pide el cliente, NO respondas - esto activará escalación automática
- NUNCA inventes información, fechas, números de tracking o estados

CLIENTE ACTUAL:
- Nombre: ${customerName}
- Cliente registrado: ${customerInfo.customerFound ? 'Sí' : 'No'}
- Encomiendas en el sistema: ${customerInfo.packagesCount}`;

  if (hasPackages) {
    systemPrompt += `
- Encomiendas pendientes de entrega: ${customerInfo.pendingDeliveryPackages.length}
- Encomiendas pendientes de pago: ${customerInfo.pendingPaymentPackages.length}
- Total pendiente: ${customerInfo.totalPending} (${Object.entries(customerInfo.currencyBreakdown).map(([currency, amount]) => `${amount} ${currency}`).join(', ')})

ENCOMIENDAS ESPECÍFICAS DEL CLIENTE:`;

    if (customerInfo.pendingDeliveryPackages.length > 0) {
      systemPrompt += `\nPendientes de entrega:`;
      customerInfo.pendingDeliveryPackages.forEach((pkg: any) => {
        systemPrompt += `\n- ${pkg.tracking_number}: ${pkg.status}, ${pkg.origin} → ${pkg.destination}`;
        if (pkg.description) systemPrompt += `, ${pkg.description}`;
      });
    }

    if (customerInfo.pendingPaymentPackages.length > 0) {
      systemPrompt += `\nPendientes de pago:`;
      customerInfo.pendingPaymentPackages.forEach((pkg: any) => {
        systemPrompt += `\n- ${pkg.tracking_number}: ${pkg.status}, pendiente ${pkg.pendingAmount} ${pkg.currency}`;
        if (pkg.description) systemPrompt += `, ${pkg.description}`;
      });
    }
  }

  if (freightRates && freightRates.length > 0) {
    systemPrompt += `\n\nTARIFAS DE FLETE ACTIVAS:`;
    freightRates.forEach((rate: any) => {
      systemPrompt += `\n- ${rate.origin} → ${rate.destination}: ${rate.price_per_kilo} ${rate.currency}`;
    });
  }

  if (tripsContext) {
    systemPrompt += `\n\nPRÓXIMOS VIAJES: ${tripsContext}`;
  }

  if (addressesContext) {
    systemPrompt += `\n\nDIRECCIONES DE DESTINO: ${addressesContext}`;
  }

  systemPrompt += `

RESPUESTAS PERMITIDAS ÚNICAMENTE:
1. Información ESPECÍFICA de las encomiendas listadas arriba
2. Información ESPECÍFICA de tarifas listadas arriba
3. Información ESPECÍFICA de viajes listados arriba
4. Información ESPECÍFICA de direcciones listadas arriba

RESPUESTAS PROHIBIDAS (activarán escalación automática):
- "No encuentro información específica"
- "No tengo información detallada"
- "Un especialista te contactará"
- "Para más detalles contacte"
- Cualquier respuesta vaga o genérica
- Información que no esté en la lista específica arriba

EJEMPLO DE RESPUESTA CORRECTA:
"Hola ${customerName}! Tienes 1 encomienda pendiente: Tracking OJ001, estado: en_destino, Barranquilla → Curacao, pendiente entrega."

EJEMPLO DE RESPUESTA PROHIBIDA:
"No encuentro esa información específica" (esto debe activar escalación)

Si el cliente pregunta algo que NO está específicamente listado arriba, NO respondas nada - esto activará la escalación automática.`;

  return systemPrompt;
}

export function buildConversationContext(recentMessages: any[], customerName: string): string {
  if (!recentMessages || recentMessages.length === 0) {
    return '\n\nCONTEXTO: Primera interacción con el cliente.';
  }

  let context = `\n\nCONTEXTO DE CONVERSACIÓN:`;
  recentMessages.slice(-5).forEach((msg: any) => {
    const sender = msg.isFromCustomer ? customerName : 'SARA';
    context += `\n- ${sender}: ${msg.message.substring(0, 100)}`;
  });

  return context;
}
