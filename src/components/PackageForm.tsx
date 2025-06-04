
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductDetailsInput } from './package-form/ProductDetailsInput';
import { FreightAndWeightFields } from './package-form/FreightAndWeightFields';
import { AmountToCollectSection } from './package-form/AmountToCollectSection';
import { OptionalDescriptionField } from './package-form/OptionalDescriptionField';

type Currency = 'COP' | 'AWG';

interface PackageFormProps {
  customerId: string;
  tripId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PackageForm({
  customerId,
  tripId,
  onSuccess,
  onCancel
}: PackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: '',
    weight: '',
    freight: '',
    freightFormatted: '',
    amountToCollect: '',
    amountToCollectFormatted: '',
    currency: 'COP' as Currency, // Fixed type annotation
    details: [''] // Array to store product details
  });

  console.log('📋 [PackageForm] Current form data:', formData);
  console.log('💰 [PackageForm] Selected currency for amount to collect:', formData.currency);
  console.log('💰 [PackageForm] Amount to collect:', formData.amountToCollect);

  const generateTrackingNumber = () => {
    const prefix = 'EO';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const getFilledDetails = () => {
    return formData.details.filter(detail => detail.trim() !== '');
  };

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

      // Preparar los datos para insertar
      const packageData = {
        tracking_number: trackingNumber,
        customer_id: customerId,
        description: finalDescription,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        freight: formData.freight ? parseFloat(formData.freight) : 0,
        amount_to_collect: formData.amountToCollect ? parseFloat(formData.amountToCollect) : 0,
        currency: formData.currency, // IMPORTANTE: Usar la divisa seleccionada
        origin: tripData.origin,
        destination: tripData.destination,
        flight_number: tripData.flight_number,
        trip_id: tripId,
        status: 'recibido'
      };

      console.log('📤 [PackageForm] Datos del paquete a insertar:', packageData);
      console.log('💰 [PackageForm] Divisa que se enviará a la BD:', packageData.currency);
      console.log('💰 [PackageForm] Monto a cobrar que se enviará:', packageData.amount_to_collect);

      const { error } = await supabase
        .from('packages')
        .insert([packageData]);

      if (error) {
        console.error('❌ [PackageForm] Error al insertar en BD:', error);
        throw error;
      }

      console.log('✅ [PackageForm] Paquete creado exitosamente en BD');

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

      onSuccess();
    } catch (error) {
      console.error('❌ [PackageForm] Error creating package:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la encomienda",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ProductDetailsInput
        details={formData.details}
        onChange={(details) => setFormData(prev => ({ ...prev, details }))}
      />

      <FreightAndWeightFields
        freight={formData.freight}
        freightFormatted={formData.freightFormatted}
        weight={formData.weight}
        onFreightChange={(freight, freightFormatted) =>
          setFormData(prev => ({ ...prev, freight, freightFormatted }))
        }
        onWeightChange={(weight) =>
          setFormData(prev => ({ ...prev, weight }))
        }
      />

      <AmountToCollectSection
        currency={formData.currency}
        amountToCollect={formData.amountToCollect}
        amountToCollectFormatted={formData.amountToCollectFormatted}
        onCurrencyChange={(currency) => {
          console.log('💱 [PackageForm] Currency changed to:', currency);
          setFormData(prev => ({ ...prev, currency }));
        }}
        onAmountChange={(amountToCollect, amountToCollectFormatted) => {
          console.log('💰 [PackageForm] Amount changed to:', amountToCollect);
          setFormData(prev => ({ ...prev, amountToCollect, amountToCollectFormatted }));
        }}
      />

      <OptionalDescriptionField
        description={formData.description}
        onChange={(description) =>
          setFormData(prev => ({ ...prev, description }))
        }
      />

      <div className="w-full">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Creando...' : 'Crear Encomienda'}
        </Button>
      </div>
    </form>
  );
}
