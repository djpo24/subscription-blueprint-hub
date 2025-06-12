
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

export function shouldEscalateToAdmin(message: string, aiResponse: string): boolean {
  // Detectar señales de que el bot no puede responder adecuadamente
  const escalationSignals = [
    'no encuentro información',
    'no tengo información específica',
    'no puedo acceder',
    'contáctenos para más detalles',
    'un miembro de nuestro equipo',
    'no está en mi base de conocimientos',
    'no está configurada en el sistema',
    'no veo información sobre',
    'podría proporcionarme el número de tracking'
  ];

  const responseContainsEscalationSignal = escalationSignals.some(signal => 
    aiResponse.toLowerCase().includes(signal.toLowerCase())
  );

  // También verificar si es una pregunta específica que requiere intervención humana
  const complexQuestionPatterns = [
    /dónde está mi .+/i,
    /cuándo llega mi .+/i,
    /por qué no ha llegado/i,
    /necesito hablar con/i,
    /quiero una queja/i,
    /problema con/i,
    /reclamo/i
  ];

  const isComplexQuestion = complexQuestionPatterns.some(pattern => 
    pattern.test(message)
  );

  return responseContainsEscalationSignal || isComplexQuestion;
}

export function generateEscalationMessage(customerName: string, originalQuestion: string): string {
  return `🚨 PREGUNTA ESCALADA DE CLIENTE

👤 Cliente: ${customerName}
❓ Pregunta: ${originalQuestion}

📞 Esta pregunta fue escalada automáticamente porque el bot no pudo proporcionar una respuesta adecuada.

Responde a este mensaje para enviar tu respuesta directamente al cliente.`;
}

export function generateCustomerNotificationMessage(customerName: string): string {
  return `Hola${customerName ? ' ' + customerName : ''} 😊

He trasladado tu consulta a un miembro especializado de nuestro equipo de Envíos Ojito para brindarte una respuesta más precisa.

📞 Te responderán muy pronto con la información exacta que necesitas.

¡Gracias por tu paciencia! 🌟`;
}
