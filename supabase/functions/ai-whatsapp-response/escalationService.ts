
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
  console.log('🚫 ESCALACIÓN COMPLETAMENTE DESACTIVADA - No se creará solicitud');
  // Sistema de escalación completamente desactivado
  return null;
}

export async function checkForAdminResponse(
  supabase: any,
  customerPhone: string
): Promise<string | null> {
  console.log('🚫 Sistema de escalación desactivado - No se verificarán respuestas del admin');
  // Sistema completamente desactivado
  return null;
}

export function shouldEscalateToAdmin(message: string, aiResponse: string, customerInfo: any): boolean {
  console.log('🚫 ESCALACIÓN COMPLETAMENTE DESACTIVADA - El bot responderá SIEMPRE');
  
  // NUNCA ESCALAR - EL BOT SIEMPRE RESPONDE
  return false;
}

export function generateEscalationMessage(customerName: string, originalQuestion: string): string {
  return `🚫 Sistema de escalación desactivado - Este mensaje no debería enviarse.`;
}

export function generateCustomerNotificationMessage(customerName: string): string {
  return `Hola ${customerName} 👋

¡Gracias por contactarnos! Estoy aquí para ayudarte con cualquier consulta sobre tus encomiendas o servicios de Envíos Ojito.

¿En qué puedo asistirte hoy?`;
}
