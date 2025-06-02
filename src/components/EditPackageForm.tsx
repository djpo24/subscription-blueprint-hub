
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePackageActions } from '@/hooks/usePackageActions';
import { Trash2, Warehouse } from 'lucide-react';

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
    description: pkg.description || '',
    weight: pkg.weight?.toString() || '',
    freight: pkg.freight?.toString() || '',
    amount_to_collect: pkg.amount_to_collect?.toString() || ''
  });

  useEffect(() => {
    setFormData({
      description: pkg.description || '',
      weight: pkg.weight?.toString() || '',
      freight: pkg.freight?.toString() || '',
      amount_to_collect: pkg.amount_to_collect?.toString() || ''
    });
  }, [pkg]);

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

    setIsLoading(true);
    
    try {
      // Get trip details for origin and destination
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('origin, destination, flight_number')
        .eq('id', tripId)
        .single();

      if (tripError) throw tripError;

      const { error } = await supabase
        .from('packages')
        .update({
          customer_id: customerId,
          description: formData.description,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          freight: formData.freight ? parseFloat(formData.freight) : 0,
          amount_to_collect: formData.amount_to_collect ? parseFloat(formData.amount_to_collect) : 0,
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
        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción de la encomienda"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="weight">Peso (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label htmlFor="freight">Flete</Label>
              <Input
                id="freight"
                type="number"
                step="0.01"
                value={formData.freight}
                onChange={(e) => setFormData(prev => ({ ...prev, freight: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="amount_to_collect">Valor a Cobrar</Label>
              <Input
                id="amount_to_collect"
                type="number"
                step="0.01"
                value={formData.amount_to_collect}
                onChange={(e) => setFormData(prev => ({ ...prev, amount_to_collect: e.target.value }))}
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Actualizando...' : 'Actualizar Encomienda'}
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
