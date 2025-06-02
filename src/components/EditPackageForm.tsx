
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePackageActions } from '@/hooks/usePackageActions';
import { Trash2, Warehouse } from 'lucide-react';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const { toast } = useToast();
  const { moveToWarehouse } = usePackageActions();
  
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

  useEffect(() => {
    if (pkg) {
      // Parse existing description to extract details and optional description
      const description = pkg.description || '';
      let optionalDescription = '';
      let details = [''];

      // Try to split description if it contains " - " (separator from create form)
      if (description.includes(' - ')) {
        const parts = description.split(' - ');
        optionalDescription = parts[0];
        const detailsString = parts.slice(1).join(' - ');
        details = detailsString.split(', ').filter(detail => detail.trim());
      } else {
        // If no separator, treat as details only
        details = description.split(', ').filter(detail => detail.trim());
      }

      // Ensure at least one empty detail for input
      if (details.length === 0) {
        details = [''];
      } else if (details[details.length - 1] !== '') {
        details.push('');
      }

      setFormData({
        description: optionalDescription,
        weight: pkg.weight?.toString() || '',
        freight: pkg.freight?.toString() || '',
        freightFormatted: pkg.freight ? `$${pkg.freight.toLocaleString()}` : '',
        amountToCollect: pkg.amount_to_collect?.toString() || '',
        amountToCollectFormatted: pkg.amount_to_collect ? `$${pkg.amount_to_collect.toLocaleString()}` : '',
        currency: 'COP',
        details: details
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
        description: "La información ha sido actualizada correctamente"
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

  const handleDelete = async () => {
    setIsLoading(true);
    
    try {
      // Delete tracking events first
      await supabase
        .from('tracking_events')
        .delete()
        .eq('package_id', pkg.id);

      // Delete the package
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', pkg.id);

      if (error) throw error;

      toast({
        title: "Encomienda eliminada",
        description: "La encomienda ha sido eliminada correctamente"
      });

      setShowDeleteDialog(false);
      onSuccess();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la encomienda",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToWarehouse = () => {
    moveToWarehouse(pkg.id);
    setShowWarehouseDialog(false);
    onSuccess();
  };

  return (
    <>
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

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowWarehouseDialog(true)}
              className="flex items-center gap-2"
            >
              <Warehouse className="h-4 w-4" />
              Mover a Bodega
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          </div>
          
          <Button type="button" variant="outline" onClick={onCancel} className="w-full">
            Cancelar
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la encomienda {pkg.tracking_number}. 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Warehouse Confirmation Dialog */}
      <AlertDialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Mover a bodega?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción moverá la encomienda {pkg.tracking_number} a bodega y 
              la desasignará del viaje actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMoveToWarehouse}>
              Mover a Bodega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
