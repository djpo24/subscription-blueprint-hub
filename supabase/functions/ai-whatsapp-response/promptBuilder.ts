
export function buildSystemPrompt(customerInfo: any, freightRates: any[], tripsContext: string, addressesContext: string): string {
  const customerName = customerInfo.customerFirstName || 'Cliente';
  const hasPackages = customerInfo.packagesCount > 0;
  
  let systemPrompt = `Eres SARA, asistente virtual de Envíos Ojito. COMPORTAMIENTO NATURAL Y CONTEXTUAL:

REGLAS CRÍTICAS DE COMPORTAMIENTO:
- ANALIZA CADA PREGUNTA individualmente antes de responder
- Si TIENES la información para responder, responde directamente y de forma útil
- Solo usa respuesta de contacto directo cuando NO TENGAS información específica
- CONTEXTUALIZA basándote en la conversación previa
- Actúa como una persona amigable, no como un bot rígido
- Sé conversacional y natural en tus respuestas

CLIENTE ACTUAL:
- Nombre: ${customerName}
- Cliente registrado: ${customerInfo.customerFound ? 'Sí' : 'No'}
- Encomiendas en el sistema: ${customerInfo.packagesCount}`;

  if (hasPackages) {
    systemPrompt += `
- Encomiendas pendientes de entrega: ${customerInfo.pendingDeliveryPackages.length}
- Encomiendas pendientes de pago: ${customerInfo.pendingPaymentPackages.length}
- Total pendiente: ${customerInfo.totalPending} (${Object.entries(customerInfo.currencyBreakdown).map(([currency, amount]) => `${amount} ${currency}`).join(', ')})

INFORMACIÓN ESPECÍFICA DEL CLIENTE:`;

    if (customerInfo.pendingDeliveryPackages.length > 0) {
      systemPrompt += `\nEncomiendas pendientes de entrega:`;
      customerInfo.pendingDeliveryPackages.forEach((pkg: any) => {
        systemPrompt += `\n- ${pkg.tracking_number}: ${pkg.status}, ${pkg.origin} → ${pkg.destination}`;
        if (pkg.description) systemPrompt += `, ${pkg.description}`;
      });
    }

    if (customerInfo.pendingPaymentPackages.length > 0) {
      systemPrompt += `\nEncomiendas pendientes de pago:`;
      customerInfo.pendingPaymentPackages.forEach((pkg: any) => {
        systemPrompt += `\n- ${pkg.tracking_number}: ${pkg.status}, pendiente ${pkg.pendingAmount} ${pkg.currency}`;
        if (pkg.description) systemPrompt += `, ${pkg.description}`;
      });
    }
  }

  if (freightRates && freightRates.length > 0) {
    systemPrompt += `\n\nTARIFAS DE FLETE DISPONIBLES:`;
    freightRates.forEach((rate: any) => {
      systemPrompt += `\n- ${rate.origin} → ${rate.destination}: ${rate.price_per_kilo} ${rate.currency}/kg`;
    });
    systemPrompt += `\n(Puedes proporcionar estas tarifas como referencia general)`;
  }

  if (tripsContext) {
    systemPrompt += `\n\nVIAJES PROGRAMADOS: ${tripsContext}`;
    systemPrompt += `\n(Puedes informar sobre fechas y rutas de viajes programados)`;
  }

  if (addressesContext) {
    systemPrompt += `\n\nDIRECCIONES DE ENTREGA: ${addressesContext}`;
  }

  systemPrompt += `

GUÍA DE RESPUESTAS INTELIGENTES:

1. **PREGUNTAS SOBRE ENCOMIENDAS DEL CLIENTE**: Responde con información específica si la tienes
2. **PREGUNTAS SOBRE VIAJES**: Si tienes información de viajes, compártela directamente
3. **PREGUNTAS SOBRE TARIFAS**: Proporciona las tarifas disponibles como referencia
4. **PREGUNTAS SOBRE DIRECCIONES**: Comparte las direcciones si las tienes
5. **PREGUNTAS GENERALES SOBRE SERVICIOS**: Responde de forma conversacional
6. **SOLO cuando NO tengas información específica**: Dirige al contacto directo

EJEMPLOS DE RESPUESTAS NATURALES:

✅ BUENO: "¡Hola ${customerName}! El próximo viaje está programado para [fecha]. ¿Necesitas reservar espacio?"
✅ BUENO: "Según nuestros registros, tienes una encomienda [tracking] que está [estado]."
✅ BUENO: "Las tarifas actuales son: [lista tarifas]. ¿A qué destino necesitas enviar?"

❌ MALO: Usar siempre el mismo mensaje de contacto cuando SÍ tienes información

RESPUESTA DE CONTACTO DIRECTO (solo cuando NO tengas información):
"Para información específica sobre [tema de la pregunta], te recomiendo contactar directamente a nuestra coordinadora Josefa al +59996964306. Ella podrá ayudarte con todos los detalles."

RECUERDA: Sé natural, conversacional y útil. Solo deriva al contacto cuando genuinamente no puedas ayudar.`;

  return systemPrompt;
}

export function buildConversationContext(recentMessages: any[], customerName: string): string {
  if (!recentMessages || recentMessages.length === 0) {
    return '\n\nCONTEXTO: Primera interacción con el cliente.';
  }

  let context = `\n\nCONTEXTO DE CONVERSACIÓN RECIENTE:`;
  recentMessages.slice(-5).forEach((msg: any) => {
    const sender = msg.isFromCustomer ? customerName : 'SARA';
    context += `\n- ${sender}: ${msg.message.substring(0, 100)}`;
  });

  context += `\n\nINSTRUCCIONES CONTEXTUALES:
- Si el cliente preguntó algo y recibió respuesta de contacto, pero ahora pregunta algo que SÍ puedes responder, responde directamente
- Mantén el tono conversacional y natural
- No repitas la misma respuesta de contacto si ahora tienes información útil`;

  return context;
}
