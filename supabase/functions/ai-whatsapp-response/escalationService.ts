
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
    console.log('🚨 ESCALACIÓN CRÍTICA - Creando solicitud para:', customerName);
    
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
      console.error('❌ Error crítico creando escalación:', error);
      return null;
    }

    console.log('✅ Escalación creada exitosamente:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Error crítico en createEscalationRequest:', error);
    return null;
  }
}

export async function checkForAdminResponse(
  supabase: any,
  customerPhone: string
): Promise<string | null> {
  try {
    console.log('🔍 Verificando respuesta del administrador para:', customerPhone);
    
    const { data, error } = await supabase
      .from('admin_escalations')
      .select('*')
      .eq('customer_phone', customerPhone)
      .eq('status', 'answered')
      .order('answered_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error verificando respuesta admin:', error);
      return null;
    }

    if (data && data.admin_response) {
      console.log('✅ Respuesta del admin encontrada:', data.id);
      
      // Marcar como cerrada para evitar re-envío
      await supabase
        .from('admin_escalations')
        .update({ status: 'closed' })
        .eq('id', data.id);

      return data.admin_response;
    }

    return null;
  } catch (error) {
    console.error('❌ Error en checkForAdminResponse:', error);
    return null;
  }
}

export function shouldEscalateToAdmin(message: string, aiResponse: string, customerInfo: any): boolean {
  console.log('🔥 EVALUACIÓN RADICAL DE ESCALACIÓN');
  
  // ESCALACIÓN AUTOMÁTICA: Si la IA responde con frases prohibidas
  const prohibitedResponses = [
    'no encuentro información específica',
    'no tengo información detallada',
    'no puedo acceder a esa información',
    'contacte a nuestro equipo',
    'un miembro de nuestro equipo',
    'no está en mi base de conocimientos',
    'no tengo acceso a esa información',
    'para más detalles contacte',
    'necesitaría más información',
    'no puedo proporcionar esa información',
    'le recomiendo contactar',
    'deberá contactar directamente',
    'no tengo esa información disponible',
    'consulte con nuestro personal'
  ];

  const hasProhibitedResponse = prohibitedResponses.some(phrase => 
    aiResponse.toLowerCase().includes(phrase.toLowerCase())
  );

  // ESCALACIÓN AUTOMÁTICA: Cliente sin encomiendas preguntando sobre envíos específicos
  const hasNoPackages = !customerInfo.customerFound || customerInfo.packagesCount === 0;
  
  const askingAboutSpecificPackage = /\b(tracking|encomienda|paquete|envío|dónde está|cuándo llega)\b/i.test(message);

  // ESCALACIÓN AUTOMÁTICA: Preguntas que requieren información específica
  const requiresSpecificInfo = [
    /dónde está mi/i,
    /cuándo llega/i,
    /por qué no ha llegado/i,
    /cuándo van a entregar/i,
    /dónde puedo recoger/i,
    /tracking.*no funciona/i,
    /problema con.*encomienda/i,
    /queja/i,
    /reclamo/i
  ].some(pattern => pattern.test(message));

  // DECISIÓN RADICAL: Escalar si cumple CUALQUIERA de estos criterios
  const shouldEscalate = hasProhibitedResponse || 
                         (hasNoPackages && askingAboutSpecificPackage) || 
                         requiresSpecificInfo;

  console.log('🚨 DECISIÓN DE ESCALACIÓN RADICAL:', {
    hasProhibitedResponse,
    hasNoPackages,
    askingAboutSpecificPackage,
    requiresSpecificInfo,
    shouldEscalate,
    aiResponseLength: aiResponse.length,
    customerPackages: customerInfo.packagesCount
  });

  return shouldEscalate;
}

export function generateEscalationMessage(customerName: string, originalQuestion: string): string {
  return `🚨 ESCALACIÓN AUTOMÁTICA - CLIENTE REQUIERE ATENCIÓN

👤 Cliente: ${customerName}
❓ Pregunta: "${originalQuestion}"

⚠️ SARA no pudo proporcionar información específica verificable.

📱 Responde directamente a este mensaje y será enviado automáticamente al cliente.

⏰ Tu respuesta se procesará inmediatamente sin generar respuestas automáticas adicionales.

🔄 Solo responde UNA VEZ por escalación para evitar confusiones.`;
}

export function generateCustomerNotificationMessage(customerName: string): string {
  return `Hola${customerName ? ' ' + customerName : ''} 👋

Tu consulta requiere información específica que no tengo disponible en este momento. 

🔄 He transferido tu pregunta directamente a nuestro especialista Didier Pedroza de Envíos Ojito.

📞 Te responderá en los próximos minutos con la información exacta que necesitas.

¡Gracias por tu paciencia! 🙏`;
}
