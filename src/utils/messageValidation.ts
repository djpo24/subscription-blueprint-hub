
import { useToast } from '@/hooks/use-toast';

export function useMessageValidation() {
  const { toast } = useToast();

  const validateMessage = (message: string, image?: File, selectedPhone?: string) => {
    if (!message.trim() && !image) {
      toast({
        title: "Error",
        description: "Debe escribir un mensaje o adjuntar una imagen",
        variant: "destructive"
      });
      return false;
    }

    if (!selectedPhone) {
      toast({
        title: "Error", 
        description: "No se ha seleccionado un número de teléfono",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateMessage };
}
