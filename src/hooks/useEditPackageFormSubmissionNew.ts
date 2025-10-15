
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseFormattedNumber } from '@/utils/numberFormatter';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
}

interface FormData {
  description: string;
  weight: string;
  freight: string;
  amountToCollect: string;
  currency: Currency;
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

export function useEditPackageFormSubmissionNew({
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
    
    // Use the package's existing IDs if the form ones are empty
    const finalCustomerId = customerId || pkg.customer_id;
    const finalTripId = tripId || pkg.trip_id;
    
    console.log('🔍 [useEditPackageFormSubmissionNew] Validating IDs:', {
      formCustomerId: customerId,
      packageCustomerId: pkg.customer_id,
      finalCustomerId: finalCustomerId,
      formTripId: tripId,
      packageTripId: pkg.trip_id,
      finalTripId: finalTripId,
      currentStatus: pkg.status
    });
    
    if (!finalCustomerId || !finalTripId) {
      console.error('❌ [useEditPackageFormSubmissionNew] Missing required IDs:', {
        finalCustomerId,
        finalTripId,
        originalCustomerId: pkg.customer_id,
        originalTripId: pkg.trip_id
      });
      
      toast({
        title: "Error de validación",
        description: `Faltan datos requeridos: ${!finalCustomerId ? 'Cliente' : ''} ${!finalTripId ? 'Viaje' : ''}`,
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
        .eq('id', finalTripId)
        .single();

      if (tripError) throw tripError;

      // Create package description from details and optional description
      let finalDescription = filledDetails.join(', ');
      if (formData.description.trim()) {
        finalDescription = `${formData.description.trim()} - ${finalDescription}`;
      }

      // Ensure currency is valid
      const validCurrency: Currency = formData.currency === 'AWG' ? 'AWG' : 'COP';

      // Parse formatted numbers (remove thousand separators before parseFloat)
      const freightValue = formData.freight ? parseFloat(parseFormattedNumber(formData.freight)) : 0;
      const amountValue = formData.amountToCollect ? parseFloat(parseFormattedNumber(formData.amountToCollect)) : 0;

      console.log('📤 [useEditPackageFormSubmissionNew] FINAL DATA TO SAVE:', {
        packageId: pkg.id,
        trackingNumber: pkg.tracking_number,
        originalCurrency: pkg.currency,
        formCurrency: formData.currency,
        finalCurrency: validCurrency,
        finalCustomerId,
        finalTripId,
        currentStatus: pkg.status,
        freightRaw: formData.freight,
        freightParsed: freightValue,
        amountRaw: formData.amountToCollect,
        amountParsed: amountValue
      });

      // CRITICAL: Preserve the current status - do not change it during updates
      const updateData = {
        customer_id: finalCustomerId,
        description: finalDescription,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        freight: freightValue,
        amount_to_collect: amountValue,
        currency: validCurrency,
        origin: tripData.origin,
        destination: tripData.destination,
        flight_number: tripData.flight_number,
        trip_id: finalTripId,
        // IMPORTANT: Preserve the current status to prevent unwanted state changes
        status: pkg.status,
        updated_at: new Date().toISOString()
      };

      console.log('🔥 [useEditPackageFormSubmissionNew] UPDATE DATA WITH STATUS PRESERVATION:', updateData);

      const { error } = await supabase
        .from('packages')
        .update(updateData)
        .eq('id', pkg.id);

      if (error) {
        console.error('❌ [useEditPackageFormSubmissionNew] Update error:', error);
        throw error;
      }

      console.log('✅ [useEditPackageFormSubmissionNew] PACKAGE UPDATED SUCCESSFULLY - STATUS PRESERVED:', pkg.status);

      // Create tracking event for the update (not a status change)
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: pkg.id,
          event_type: 'updated',
          description: 'Información de encomienda actualizada (sin cambio de estado)',
          location: tripData.origin
        }]);

      toast({
        title: "Encomienda actualizada",
        description: `La información ha sido actualizada correctamente. Estado preservado: ${pkg.status}`
      });

      onSuccess();
    } catch (error) {
      console.error('❌ [useEditPackageFormSubmissionNew] Complete error:', error);
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
