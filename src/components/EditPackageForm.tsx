
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ProductDetailsInput } from './package-form/ProductDetailsInput';
import { FreightAndWeightFields } from './package-form/FreightAndWeightFields';
import { AmountToCollectSection } from './package-form/AmountToCollectSection';
import { OptionalDescriptionField } from './package-form/OptionalDescriptionField';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  status: string;
}

interface EditPackageFormProps {
  package: Package;
  customerId: string;
  tripId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditPackageForm({
  package: pkg,
  customerId,
  tripId,
  onSuccess,
  onCancel
}: EditPackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: '',
    weight: '',
    freight: '',
    freightFormatted: '',
    amountToCollect: '',
    amountToCollectFormatted: '',
    currency: 'COP',
    details: ['']
  });

  // Initialize form data with package information
  useEffect(() => {
    if (pkg) {
      // Parse description to extract optional description and product details
      const description = pkg.description || '';
      let optionalDescription = '';
      let productDetails = [''];

      // Try to split description if it contains " - " separator
      if (description.includes(' - ')) {
        const parts = description.split(' - ');
        optionalDescription = parts[0];
        productDetails = parts[1].split(', ').filter(detail => detail.trim() !== '');
      } else {
        // If no separator, treat entire description as product details
        productDetails = description.split(', ').filter(detail => detail.trim() !== '');
      }

      // Ensure at least one empty detail for adding new ones
      if (productDetails.length === 0) {
        productDetails = [''];
      } else if (productDetails[productDetails.length - 1] !== '') {
        productDetails.push('');
      }

      setFormData({
        description: optionalDescription,
        weight: pkg.weight ? pkg.weight.toString() : '',
        freight: pkg.freight ? pkg.freight.toString() : '',
        freightFormatted: pkg.freight ? pkg.freight.toString() : '',
        amountToCollect: pkg.amount_to_collect ? pkg.amount_to_collect.toString() : '',
        amountToCollectFormatted: pkg.amount_to_collect ? pkg.amount_to_collect.toString() : '',
        currency: 'COP',
        details: productDetails
      });
    }
  }, [pkg]);

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

      console.log('Actualizando encomienda con valores:', {
        freight: formData.freight ? parseFloat(formData.freight) : 0,
        amount_to_collect: formData.amountToCollect ? parseFloat(formData.amountToCollect) : 0
      });

      const { error } = await supabase
        .from('packages')
        .update({
          customer_id: customerId,
          description: finalDescription,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          freight: formData.freight ? parseFloat(formData.freight) : 0,
          amount_to_collect: formData.amountToCollect ? parseFloat(formData.amountToCollect) : 0,
          origin: tripData.origin,
          destination: tripData.destination,
          flight_number: tripData.flight_number,
          trip_id: tripId,
          updated_at: new Date().toISOString()
        })
        .eq('id', pkg.id);

      if (error) throw error;

      // Create tracking event for the update
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
        description: `La encomienda ${pkg.tracking_number} ha sido actualizada exitosamente`
      });

      onSuccess();
    } catch (error) {
      console.error('Error updating package:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la encomienda",
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
        onCurrencyChange={(currency) =>
          setFormData(prev => ({ ...prev, currency }))
        }
        onAmountChange={(amountToCollect, amountToCollectFormatted) =>
          setFormData(prev => ({ ...prev, amountToCollect, amountToCollectFormatted }))
        }
      />

      <OptionalDescriptionField
        description={formData.description}
        onChange={(description) =>
          setFormData(prev => ({ ...prev, description }))
        }
      />

      <div className="w-full">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Actualizando...' : 'Actualizar Encomienda'}
        </Button>
      </div>
    </form>
  );
}
