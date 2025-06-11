
import { toast } from '@/hooks/use-toast';

export class DeliveryErrorHandler {
  static handleDeliveryError(error: any) {
    console.error('❌ [DeliveryErrorHandler] Error en entrega:', {
      error,
      errorType: typeof error,
      errorConstructor: error?.constructor?.name,
      errorMessage: error?.message,
      errorCode: error?.code,
      errorDetails: error?.details,
      errorHint: error?.hint
    });
    
    let errorMessage = "No se pudo completar la entrega del paquete.";
    let shouldTryFallback = false;
    
    // Análisis del error
    if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('id del paquete es requerido')) {
        errorMessage = "Error: ID del paquete no válido.";
      } else if (message.includes('información del entregador es requerida')) {
        errorMessage = "Error: Información del entregador requerida.";
      } else if (message.includes('no se pudo encontrar el paquete')) {
        errorMessage = "Error: Paquete no encontrado en el sistema.";
      } else if (message.includes('ya ha sido entregado')) {
        errorMessage = "Este paquete ya fue entregado anteriormente.";
      } else if (message.includes('no se pudo actualizar')) {
        errorMessage = "Error actualizando el paquete. Se intentará método alternativo.";
        shouldTryFallback = true;
      } else {
        errorMessage = "Error inesperado durante la entrega. Se intentará método alternativo.";
        shouldTryFallback = true;
      }
    }
    
    // Analizar códigos de error de Supabase
    if (error?.code) {
      console.log('🔍 [DeliveryErrorHandler] Código de error:', error.code);
      
      switch (error.code) {
        case '42804': // Error de tipo de datos
        case '22023': // Error de formato
        case '42501': // Error de permisos
          errorMessage = "Error de base de datos. Intentando método alternativo...";
          shouldTryFallback = true;
          break;
        case '23505': // Violación de unicidad
          errorMessage = "Error: El paquete ya fue procesado.";
          break;
        case 'PGRST116': // No encontrado
          errorMessage = "Error: Paquete no encontrado.";
          break;
        default:
          shouldTryFallback = true;
      }
    }
    
    console.log('📝 [DeliveryErrorHandler] Mensaje final:', errorMessage);
    console.log('🔄 [DeliveryErrorHandler] ¿Intentar método alternativo?', shouldTryFallback);
    
    toast({
      title: "Error en la entrega",
      description: errorMessage,
      variant: "destructive",
    });
    
    return { shouldTryFallback };
  }

  static isPermissionError(error: any): boolean {
    const isPermissionError = !!(
      error?.code === '42501' || 
      error?.code === '42804' ||
      error?.message?.includes('permission denied') ||
      error?.message?.includes('no se pudo actualizar') ||
      error?.message?.includes('error actualizando')
    );
    
    console.log('🔒 [DeliveryErrorHandler] ¿Es error de permisos?', isPermissionError, {
      errorMessage: error?.message,
      errorCode: error?.code
    });
    
    return isPermissionError;
  }
}
