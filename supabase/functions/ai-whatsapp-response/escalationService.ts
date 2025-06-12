
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
    console.log('🚫 ESCALACIÓN DESACTIVADA - No se creará solicitud para:', customerName);
    
    // Sistema de escalación completamente desactivado
    // Retornar null para indicar que no se creó escalación
    return null;
  } catch (error) {
    console.error('❌ Error en createEscalationRequest (desactivado):', error);
    return null;
  }
}

export async function checkForAdminResponse(
  supabase: any,
  customerPhone: string
): Promise<string | null> {
  try {
    console.log('🚫 Sistema de escalación desactivado - No se verificarán respuestas del admin');
    
    // Sistema completamente desactivado - no verificar respuestas de admin
    return null;
  } catch (error) {
    console.error('❌ Error en checkForAdminResponse (desactivado):', error);
    return null;
  }
}

export function shouldEscalateToAdmin(message: string, aiResponse: string, customerInfo: any): boolean {
  console.log('🚫 SISTEMA DE ESCALACIÓN COMPLETAMENTE DESACTIVADO');
  
  // ESCALACIÓN COMPLETAMENTE DESACTIVADA
  // Siempre retornar false para nunca escalar
  console.log('🚫 ESCALACIÓN DESACTIVADA:', {
    message: message?.substring(0, 50) + '...',
    aiResponseLength: aiResponse.length,
    customerPackages: customerInfo.packagesCount,
    escalationDecision: false,
    systemStatus: 'DISABLED'
  });

  return false; // NUNCA ESCALAR
}

export function generateEscalationMessage(customerName: string, originalQuestion: string): string {
  return `🚫 Sistema de escalación desactivado - Este mensaje no debería enviarse.`;
}

export function generateCustomerNotificationMessage(customerName: string): string {
  return `Lo siento, no pude procesar tu consulta en este momento. Por favor intenta nuevamente más tarde.`;
}
