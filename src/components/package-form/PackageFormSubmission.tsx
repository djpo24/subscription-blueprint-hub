
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { parseFormattedNumber } from '@/utils/numberFormatter';

type Currency = 'COP' | 'AWG';

interface FormData {
  description: string;
  weight: string;
  freight: string;
  amountToCollect: string;
  currency: Currency;
  details: string[];
}

export function usePackageFormSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateTrackingNumber = () => {
    const prefix = 'EO';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const submitPackage = async (
    customerId: string,
    tripId: string,
    formData: FormData,
    filledDetails: string[]
  ) => {
    setIsLoading(true);
    
    try {
      const trackingNumber = generateTrackingNumber();

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

      // Parse formatted numbers (remove thousand separators before parseFloat)
      const freightValue = formData.freight ? parseFloat(parseFormattedNumber(formData.freight)) : 0;
      const amountValue = formData.amountToCollect ? parseFloat(parseFormattedNumber(formData.amountToCollect)) : 0;

      // Preparar los datos para insertar
      const packageData = {
        tracking_number: trackingNumber,
        customer_id: customerId,
        description: finalDescription,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        freight: freightValue, // El flete siempre en COP
        amount_to_collect: amountValue,
        currency: formData.currency, // Esta es la divisa para el monto a cobrar, NO para el flete
        origin: tripData.origin,
        destination: tripData.destination,
        flight_number: tripData.flight_number,
        trip_id: tripId,
        status: 'recibido'
      };

      console.log('📤 [PackageFormSubmission] Datos del paquete a insertar:', packageData);
      console.log('💰 [PackageFormSubmission] Divisa para monto a cobrar:', packageData.currency);
      console.log('💰 [PackageFormSubmission] Monto a cobrar:', packageData.amount_to_collect);
      console.log('🚢 [PackageFormSubmission] Flete (siempre en COP):', packageData.freight);
      console.log('🔍 [PackageFormSubmission] Raw values:', {
        freightRaw: formData.freight,
        freightParsed: freightValue,
        amountRaw: formData.amountToCollect,
        amountParsed: amountValue
      });

      const { error } = await supabase
        .from('packages')
        .insert([packageData]);

      if (error) {
        console.error('❌ [PackageFormSubmission] Error al insertar en BD:', error);
        throw error;
      }

      console.log('✅ [PackageFormSubmission] Paquete creado exitosamente en BD');

      // Create initial tracking event
      const { data: newPackageData } = await supabase
        .from('packages')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .single();

      if (newPackageData) {
        await supabase
          .from('tracking_events')
          .insert([{
            package_id: newPackageData.id,
            event_type: 'created',
            description: 'Encomienda creada',
            location: tripData.origin
          }]);
      }

      toast({
        title: "Encomienda creada",
        description: `Número de seguimiento: ${trackingNumber}`
      });

      return true;
    } catch (error) {
      console.error('❌ [PackageFormSubmission] Error creating package:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la encomienda",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitPackage
  };
}
