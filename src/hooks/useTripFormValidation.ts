
import { useToast } from '@/hooks/use-toast';
import { TripFormData } from '@/types/tripForm';

export function useTripFormValidation() {
  const { toast } = useToast();

  const validateForm = (date: Date | undefined, formData: TripFormData) => {
    console.log('Validating form:', { date, formData });
    
    if (!date) {
      console.log('Validation failed: No date provided');
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha para el viaje",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.route) {
      console.log('Validation failed: No route provided');
      toast({
        title: "Error", 
        description: "Por favor selecciona una ruta para el viaje",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.traveler_id) {
      console.log('Validation failed: No traveler provided');
      toast({
        title: "Error",
        description: "Por favor selecciona un viajero para el viaje",
        variant: "destructive"
      });
      return false;
    }

    console.log('Validation passed successfully');
    return true;
  };

  return { validateForm };
}
