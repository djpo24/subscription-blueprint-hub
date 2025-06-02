
import { useToast } from '@/hooks/use-toast';
import { TripFormData } from '@/types/tripForm';

export function useTripFormValidation() {
  const { toast } = useToast();

  const validateForm = (date: Date | undefined, formData: TripFormData) => {
    if (!date) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha para el viaje",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.route) {
      toast({
        title: "Error", 
        description: "Por favor selecciona una ruta para el viaje",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.traveler_id) {
      toast({
        title: "Error",
        description: "Por favor selecciona un viajero para el viaje",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return { validateForm };
}
