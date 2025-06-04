
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency?: string;
  status: string;
}

interface FormData {
  description: string;
  weight: string;
  freight: string;
  amountToCollect: string;
  currency: string;
  details: string[];
}

interface EditPackageFormSubmissionProps {
  package: Package;
  customerId: string;
  tripId: string;
  formData: FormData;
  getFilledDetails: () => string[];
  onSuccess: () => void;
}

export function useEditPackageFormSubmission({
  package: pkg,
  customerId,
  tripId,
  formData,
  getFilledDetails,
  onSuccess
}: EditPackageFormSubmissionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerId || !tripId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un cliente y un viaje",
        variant: "destructive"
      });
      return;
    }

    const filledDetails = getFilledDetails();
    if (filledDetails.length === 0) {
      toast({
        title: "Error",
        description: "Debe ingresar al menos un detalle del producto",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get trip details for origin and destination
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('origin, destination, flight_number')
        .eq('id', tripId)
        .single();

      if (tripError) throw tripError;

      // Create package description from details and optional description
      let finalDescription = filledDetails.join(', ');
      if (formData.description.trim()) {
        finalDescription = `${formData.description.trim()} - ${finalDescription}`;
      }

      // CRITICAL FIX: Strict currency validation and assignment
      const currencyToSave = formData.currency === 'AWG' ? 'AWG' : 'COP';

      console.log('📤 [EditPackageFormSubmission] DATOS FINALES PARA GUARDAR:', {
        packageId: pkg.id,
        trackingNumber: pkg.tracking_number,
        currencyOriginal: pkg.currency,
        currencyForm: formData.currency,
        currencyFinal: currencyToSave,
        freight: formData.freight ? parseFloat(formData.freight) : 0,
        amount_to_collect: formData.amountToCollect ? parseFloat(formData.amountToCollect) : 0
      });

      const updateData = {
        customer_id: customerId,
        description: finalDescription,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        freight: formData.freight ? parseFloat(formData.freight) : 0,
        amount_to_collect: formData.amountToCollect ? parseFloat(formData.amountToCollect) : 0,
        currency: currencyToSave,
        origin: tripData.origin,
        destination: tripData.destination,
        flight_number: tripData.flight_number,
        trip_id: tripId,
        updated_at: new Date().toISOString()
      };

      console.log('🔥 [EditPackageFormSubmission] UPDATE DATA:', updateData);

      const { error } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', pkg.id);

      if (error) {
        console.error('❌ [EditPackageFormSubmission] Error en UPDATE:', error);
        throw error;
      }

      console.log('✅ [EditPackageFormSubmission] PAQUETE ACTUALIZADO EXITOSAMENTE CON DIVISA:', currencyToSave);

      // Create tracking event
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: pkg.id,
          event_type: 'updated',
          description: 'Información de encomienda actualizada',
          location: tripData.origin
        }]);

      toast({
        title: "Encomienda actualizada",
        description: `La información ha sido actualizada correctamente con divisa ${currencyToSave}`
      });

      onSuccess();
    } catch (error) {
      console.error('❌ [EditPackageFormSubmission] Error completo:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la encomienda",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading
  };
}
