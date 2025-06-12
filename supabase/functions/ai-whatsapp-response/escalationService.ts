
export interface EscalationRequest {
  id?: string;
  customer_phone: string;
  customer_name: string;
  original_question: string;
  admin_response?: string;
  status: 'pending' | 'answered' | 'closed';
  created_at?: string;
  answered_at?: string;
}

export async function createEscalationRequest(
  supabase: any,
  customerPhone: string,
  customerName: string,
  originalQuestion: string
): Promise<string | null> {
  try {
    console.log('🔄 Creating escalation request for customer:', customerName);
    
    const { data, error } = await supabase
      .from('admin_escalations')
      .insert({
        customer_phone: customerPhone,
        customer_name: customerName,
        original_question: originalQuestion,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating escalation:', error);
      return null;
    }

    console.log('✅ Escalation created successfully:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Error in createEscalationRequest:', error);
    return null;
  }
}

export async function checkForAdminResponse(
  supabase: any,
  customerPhone: string
): Promise<string | null> {
  try {
    console.log('🔍 Checking for admin response for phone:', customerPhone);
    
    const { data, error } = await supabase
      .from('admin_escalations')
      .select('*')
      .eq('customer_phone', customerPhone)
      .eq('status', 'answered')
      .order('answered_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error checking admin response:', error);
      return null;
    }

    if (data && data.admin_response) {
      console.log('✅ Found admin response:', data.id);
      
      // Mark as closed to avoid re-sending
      await supabase
        .from('admin_escalations')
        .update({ status: 'closed' })
        .eq('id', data.id);

      return data.admin_response;
    }

    return null;
  } catch (error) {
    console.error('❌ Error in checkForAdminResponse:', error);
    return null;
  }
}

export function shouldEscalateToAdmin(message: string, aiResponse: string, customerInfo: any): boolean {
  console.log('🤔 Evaluating escalation criteria for message:', message.substring(0, 50));
  
  // Detectar si la IA está dando respuestas vagas o no informativas
  const vagueResponseIndicators = [
    'no encuentro información específica',
    'no tengo información detallada',
    'no puedo acceder a esa información',
    'contacte a nuestro equipo',
    'un miembro de nuestro equipo le contactará',
    'no está en mi base de conocimientos',
    'no tengo acceso a esa información',
    'para más detalles contacte',
    'necesitaría más información',
    'no puedo proporcionar esa información específica',
    'le recomiendo contactar',
    'deberá contactar directamente'
  ];

  const hasVagueResponse = vagueResponseIndicators.some(indicator => 
    aiResponse.toLowerCase().includes(indicator.toLowerCase())
  );

  // Detectar preguntas específicas que requieren información que el bot no tiene
  const specificQuestionPatterns = [
    /dónde está mi .+/i,
    /cuándo llega mi .+/i,
    /por qué no ha llegado/i,
    /cuándo van a entregar/i,
    /dónde puedo recoger/i,
    /quién puede ayudarme/i,
    /necesito hablar con alguien/i,
    /quiero hacer una queja/i,
    /tengo un problema con/i,
    /mi paquete está dañado/i,
    /no recibí mi encomienda/i,
    /el tracking no funciona/i
  ];

  const isSpecificQuestion = specificQuestionPatterns.some(pattern => 
    pattern.test(message)
  );

  // Detectar si el cliente no tiene paquetes y está preguntando sobre envíos específicos
  const hasNoPackageInfo = !customerInfo.customerFound || customerInfo.packagesCount === 0;
  
  const askingAboutSpecificPackage = /\b(paquete|encomienda|envío|bicicleta|caja|sobre)\b/i.test(message) 
    && /(dónde|cuándo|cómo|por qué)/i.test(message);

  // Criterios más estrictos para escalación
  const shouldEscalate = (
    hasVagueResponse || 
    (isSpecificQuestion && hasNoPackageInfo) ||
    (askingAboutSpecificPackage && hasNoPackageInfo)
  );

  console.log('📋 Escalation evaluation:', {
    hasVagueResponse,
    isSpecificQuestion,
    hasNoPackageInfo,
    askingAboutSpecificPackage,
    shouldEscalate,
    customerPackages: customerInfo.packagesCount,
    customerFound: customerInfo.customerFound
  });

  return shouldEscalate;
}

export function generateEscalationMessage(customerName: string, originalQuestion: string): string {
  return `🚨 PREGUNTA ESCALADA DE CLIENTE

👤 Cliente: ${customerName}
📞 Teléfono: Se ocultó por privacidad
❓ Pregunta: ${originalQuestion}

Esta pregunta fue escalada automáticamente porque el bot no tiene la información específica que el cliente necesita.

Para responder, simplemente envía tu mensaje y será retransmitido automáticamente al cliente.`;
}

export function generateCustomerNotificationMessage(customerName: string): string {
  return `Hola${customerName ? ' ' + customerName : ''} 😊

No tengo la información específica que necesitas en este momento. He trasladado tu consulta a un especialista de nuestro equipo de Envíos Ojito para brindarte una respuesta precisa.

📞 Te responderán muy pronto con la información exacta que necesitas.

¡Gracias por tu paciencia! 🌟`;
}
