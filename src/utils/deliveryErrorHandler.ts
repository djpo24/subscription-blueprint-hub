
import { toast } from '@/hooks/use-toast';

export class DeliveryErrorHandler {
  static handleDeliveryError(error: any) {
    console.error('❌ [DeliveryErrorHandler] Error en mutación de entrega:', {
      error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint
    });
    
    let errorMessage = "No se pudo completar la entrega del paquete. Intenta nuevamente.";
    let shouldTryFallback = false;
    
    // Análisis detallado del error
    if (error?.code) {
      console.log('🔍 [DeliveryErrorHandler] Código de error:', error.code);
      
      switch (error.code) {
        case '42804': // Error de tipo de datos
          errorMessage = "Error de formato de datos. Se intentará método alternativo.";
          shouldTryFallback = true;
          break;
        case '22023':
          errorMessage = "Error de formato de datos. Se intentará método alternativo.";
          shouldTryFallback = true;
          break;
        case '42501':
          errorMessage = "Error de permisos. Se intentará método alternativo.";
          shouldTryFallback = true;
          break;
        case '23505':
          errorMessage = "Error de duplicado. El paquete ya fue procesado.";
          break;
        case 'PGRST116':
          errorMessage = "No se encontró el paquete especificado.";
          break;
        default:
          console.log('🔍 [DeliveryErrorHandler] Código de error no manejado:', error.code);
          shouldTryFallback = true; // Intentar fallback para códigos desconocidos
      }
    }
    
    // Mensaje más específico para errores de base de datos
    if (error?.message) {
      console.log('🔍 [DeliveryErrorHandler] Mensaje de error:', error.message);
      
      if (error.message.includes('currency_type') || error.message.includes('currency')) {
        errorMessage = "Error de tipo de moneda. Se intentará método alternativo.";
        shouldTryFallback = true;
      } else if (error.message.includes('collection_stats')) {
        errorMessage = "Error de permisos en estadísticas. Se intentará método alternativo.";
        shouldTryFallback = true;
      } else if (error.message.includes('permission denied')) {
        errorMessage = "Error de permisos en la base de datos. Se intentará método alternativo.";
        shouldTryFallback = true;
      } else if (error.message.includes('violates')) {
        errorMessage = "Error de validación de datos.";
      } else if (error.message.includes('does not exist')) {
        errorMessage = "Error: elemento no encontrado.";
      }
    }
    
    console.log('📝 [DeliveryErrorHandler] Mensaje final:', errorMessage);
    console.log('🔄 [DeliveryErrorHandler] ¿Debería intentar fallback?', shouldTryFallback);
    
    toast({
      title: "Error en la entrega",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { shouldTryFallback };
  }

  static isPermissionError(error: any): boolean {
    const isPermissionError = !!(
      error?.message?.includes('collection_stats') || 
      error?.message?.includes('currency_type') ||
      error?.code === '42501' || 
      error?.code === '42804' || // Agregar error de tipo de datos
      error?.message?.includes('permission denied')
    );
    
    console.log('🔒 [DeliveryErrorHandler] ¿Es error de permisos o tipo?', isPermissionError, {
      errorMessage: error?.message,
      errorCode: error?.code
    });
    
    return isPermissionError;
  }
}
