
export async function notifyAdminOfEscalation(
  supabase: any,
  escalationId: string,
  customerName: string,
  originalQuestion: string
): Promise<boolean> {
  try {
    console.log('🚫 NOTIFICACIÓN AL ADMIN DESACTIVADA - Sistema de escalación deshabilitado');
    
    // Sistema de escalación completamente desactivado
    // No enviar notificaciones al administrador
    return false;
  } catch (error) {
    console.error('❌ Error en notifyAdminOfEscalation (desactivado):', error);
    return false;
  }
}
