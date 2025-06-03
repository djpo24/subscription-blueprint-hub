
import { useToast } from '@/hooks/use-toast';

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: unknown) => {
    console.error('❌ Error in message send process:', error);
    
    let errorMessage = "No se pudo enviar el mensaje";
    
    if (error instanceof Error) {
      if (error.message.includes('Token de WhatsApp expirado')) {
        errorMessage = error.message;
      } else if (error.message.includes('row-level security policy')) {
        errorMessage = "Error de permisos. Intente nuevamente.";
      } else if (error.message.includes('Bucket not found')) {
        errorMessage = "Error de configuración de almacenamiento.";
      } else {
        errorMessage = error.message;
      }
    }
    
    toast({
      title: "Error al enviar mensaje",
      description: errorMessage,
      variant: "destructive"
    });
    
    throw error;
  };

  return { handleError };
}
