
import { useToast } from '@/hooks/use-toast';

interface FormData {
  details: string[];
}

export function usePackageFormValidation() {
  const { toast } = useToast();

  const getFilledDetails = (details: string[]) => {
    return details.filter(detail => detail.trim() !== '');
  };

  const validateForm = (customerId: string, tripId: string | undefined, formData: FormData) => {
    if (!customerId || !tripId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente y un viaje",
        variant: "destructive"
      });
      return false;
    }

    const filledDetails = getFilledDetails(formData.details);
    if (filledDetails.length === 0) {
      toast({
        title: "Error",
        description: "Debe ingresar al menos un detalle del producto",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  return {
    validateForm,
    getFilledDetails
  };
}
