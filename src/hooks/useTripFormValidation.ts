
import { useToast } from '@/hooks/use-toast';
import { TripFormData } from '@/types/tripForm';

export function useTripFormValidation() {
  const { toast } = useToast();

  const validateForm = (date: Date | undefined, formData: TripFormData): boolean => {
    if (!date || !formData.route) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return false;
    }

    // Validar formato de ruta
    if (!formData.route.includes(' -> ')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una ruta válida",
        variant: "destructive"
      });
      return false;
    }

    const routeParts = formData.route.split(' -> ');
    if (routeParts.length !== 2 || !routeParts[0] || !routeParts[1]) {
      toast({
        title: "Error",
        description: "Formato de ruta inválido",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateForm };
}
