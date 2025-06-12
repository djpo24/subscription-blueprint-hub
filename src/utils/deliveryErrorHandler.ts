
export class DeliveryErrorHandler {
  static handleDeliveryError(error: any) {
    console.error('🔍 [DeliveryErrorHandler] Analizando error:', error);
    
    // Analizar el tipo de error para decidir si usar fallback
    const shouldTryFallback = this.shouldUseFallback(error);
    
    // Mostrar mensaje de error apropiado al usuario
    const userMessage = this.getUserFriendlyMessage(error);
    
    return {
      shouldTryFallback,
      userMessage
    };
  }
  
  static shouldUseFallback(error: any): boolean {
    // Usar fallback en casos específicos de errores
    if (this.isNetworkError(error)) return true;
    if (this.isPermissionError(error)) return true;
    if (this.isTimeoutError(error)) return true;
    
    return false;
  }
  
  static isNetworkError(error: any): boolean {
    return error?.message?.includes('network') || 
           error?.message?.includes('fetch') ||
           error?.code === 'NETWORK_ERROR';
  }
  
  static isPermissionError(error: any): boolean {
    return error?.message?.includes('permission') ||
           error?.message?.includes('unauthorized') ||
           error?.message?.includes('row-level security') ||
           error?.code === 'PGRST301';
  }
  
  static isTimeoutError(error: any): boolean {
    return error?.message?.includes('timeout') ||
           error?.code === 'TIMEOUT';
  }
  
  static getUserFriendlyMessage(error: any): string {
    if (this.isPermissionError(error)) {
      return 'No tienes permisos para realizar esta acción. Contacta al administrador.';
    }
    
    if (this.isNetworkError(error)) {
      return 'Error de conexión. Verifica tu conexión a internet e intenta nuevamente.';
    }
    
    if (this.isTimeoutError(error)) {
      return 'La operación tardó demasiado tiempo. Intenta nuevamente.';
    }
    
    return 'Error inesperado. Por favor intenta nuevamente.';
  }
}
