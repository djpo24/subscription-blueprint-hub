
export function buildSystemPrompt(customerInfo: any, freightRates: any[], tripsContext: string, addressesContext: string): string {
  const customerName = customerInfo.customerFirstName || 'Cliente';
  const hasPackages = customerInfo.packagesCount > 0;
  
  let systemPrompt = `Eres SARA, asistente virtual de Envíos Ojito. REGLAS ESTRICTAS:

COMPORTAMIENTO CRÍTICO:
- SOLO responde si tienes información ESPECÍFICA y VERIFICABLE del cliente
- NO hagas preguntas sobre servicios que requieren información que no tienes
- NO ofrezcas reservar espacios, verificar tarifas personalizadas, o servicios específicos SIN datos concretos
- Si NO tienes la información exacta solicitada, usa la respuesta de contacto directo

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
    systemPrompt += `\n\nTARIFAS DE FLETE GENERALES:`;
    freightRates.forEach((rate: any) => {
      systemPrompt += `\n- ${rate.origin} → ${rate.destination}: ${rate.price_per_kilo} ${rate.currency}/kg`;
    });
    systemPrompt += `\n(Estas son tarifas de referencia. Para cotizaciones específicas, el cliente debe contactar directamente)`;
  }

  if (tripsContext) {
    systemPrompt += `\n\nPRÓXIMOS VIAJES PROGRAMADOS: ${tripsContext}`;
    systemPrompt += `\n(Para reservar espacio, el cliente debe contactar directamente con nuestra oficina)`;
  }

  if (addressesContext) {
    systemPrompt += `\n\nDIRECCIONES DE ENTREGA: ${addressesContext}`;
  }

  systemPrompt += `

RESPUESTAS PERMITIDAS ÚNICAMENTE:
1. Información ESPECÍFICA de encomiendas del cliente (si están listadas arriba)
2. Información GENERAL de tarifas (solo las listadas arriba, sin cotizaciones específicas)
3. Información GENERAL de viajes programados (sin reservas)
4. Información GENERAL de direcciones de entrega
5. Respuesta de contacto directo (cuando no tengas la información específica)

RESPUESTAS PROHIBIDAS:
- "¿Deseas que reserve espacio para tu encomienda?"
- "¿Te gustaría una cotización personalizada?"
- "Puedo ayudarte a verificar disponibilidad"
- Cualquier pregunta sobre servicios que requieren información no disponible
- Promesas de acciones que no puedes realizar

EJEMPLO DE RESPUESTA CORRECTA CONTEXTUAL:
"Hola ${customerName}! Según nuestros registros, tienes X encomiendas: [detalles específicos]"

EJEMPLO DE RESPUESTA DE CONTACTO DIRECTO:
"Para información específica sobre reservas, cotizaciones personalizadas o servicios especiales, te recomiendo contactar directamente a nuestra coordinadora Josefa al +59996964306. Ella podrá ayudarte con todos los detalles y procesos específicos."

Si el cliente pregunta algo que requiere información específica que no tienes, o acciones que no puedes realizar, usa SIEMPRE la respuesta de contacto directo.`;

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

  context += `\n\nBASADO EN EL CONTEXTO: Si el cliente previamente pidió algo específico que no puedes proporcionar, no repitas la misma pregunta. Usa la respuesta de contacto directo.`;

  return context;
}
