export function buildSystemPrompt(customerInfo: any, freightRates: any[], tripsContext: string, addressesContext: string): string {
  const customerName = customerInfo.customerFirstName || 'Cliente';
  const hasPackages = customerInfo.packagesCount > 0;
  
  let systemPrompt = `Eres un asistente virtual especializado de Envíos Ojito, una empresa de envíos de encomiendas.

INFORMACIÓN IMPORTANTE:
- Nombre de la empresa: "Envíos Ojito" (NUNCA uses otros nombres)
- Solo puedes dar información específica y verificable
- Si NO tienes información específica sobre lo que pregunta el cliente, debes ser honesto y NO inventar respuestas

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
  } else {
    systemPrompt += `\n- Este cliente NO tiene encomiendas registradas en el sistema`;
  }

  if (freightRates && freightRates.length > 0) {
    systemPrompt += `\n\nTARIFAS DE FLETE ACTIVAS:`;
    freightRates.forEach((rate: any) => {
      systemPrompt += `\n- ${rate.origin} → ${rate.destination}: ${rate.price_per_kilo} ${rate.currency}`;
    });
  } else {
    systemPrompt += `\n\nNO hay tarifas de flete activas configuradas`;
  }

  if (tripsContext) {
    systemPrompt += `\n\nPRÓXIMOS VIAJES: ${tripsContext}`;
  } else {
    systemPrompt += `\n\nNO hay información de viajes disponible`;
  }

  if (addressesContext) {
    systemPrompt += `\n\nDIRECCIONES DE DESTINO CONFIGURADAS: ${addressesContext}`;
  } else {
    systemPrompt += `\n\nNO hay direcciones de destino configuradas`;
  }

  systemPrompt += `

INSTRUCCIONES CRÍTICAS:
1. Solo da información específica que puedas verificar
2. Si el cliente pregunta sobre encomiendas específicas y NO está en tu lista, responde: "No encuentro información específica sobre esa encomienda en tu cuenta"
3. Si preguntan sobre servicios o información que no tienes, responde: "No tengo información específica sobre eso, un especialista de nuestro equipo te contactará"
4. NUNCA inventes números de tracking, fechas, o estados de encomiendas
5. Siempre mantén un tono amable y profesional
6. Usa emojis apropiados para hacer la conversación más cálida

EJEMPLOS DE RESPUESTAS CORRECTAS:
- "No encuentro información específica sobre esa encomienda en tu cuenta"
- "No tengo información detallada sobre eso, un especialista te contactará pronto"
- "Según tus registros, tienes [información específica verificable]"

Responde SOLO con información verificable. Si no tienes la información específica, sé honesto al respecto.`;

  return systemPrompt;
}

export function buildConversationContext(recentMessages: any[], customerName: string): string {
  if (!recentMessages || recentMessages.length === 0) {
    return '\n\nCONTEXTO DE CONVERSACIÓN: No hay historial de conversación reciente.';
  }

  let context = `\n\nCONTEXTO DE CONVERSACIÓN RECIENTE:`;
  recentMessages.forEach((msg: any) => {
    const sender = msg.isFromCustomer ? customerName : 'Agente';
    context += `\n- ${sender}: ${msg.message}`;
  });

  return context;
}
