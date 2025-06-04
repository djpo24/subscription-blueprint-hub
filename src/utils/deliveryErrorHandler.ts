
import { toast } from '@/hooks/use-toast';

export class DeliveryErrorHandler {
  static handleDeliveryError(error: any) {
    console.error('❌ Error en mutación de entrega:', error);
    
    let errorMessage = "No se pudo completar la entrega del paquete. Intenta nuevamente.";
    
    // Mensaje más específico para errores de base de datos
    if (error?.code === '22023') {
      errorMessage = "Error de formato de datos. El paquete se intentará entregar de manera alternativa.";
    } else if (error?.message?.includes('collection_stats') || error?.code === '42501') {
      errorMessage = "Error de permisos en la base de datos. Contacta al administrador del sistema.";
    }
    
    toast({
      title: "Error en la entrega",
      description: errorMessage,
      variant: "destructive",
    });
  }

  static isPermissionError(error: any): boolean {
    return error?.message?.includes('collection_stats') || error?.code === '42501';
  }
}
