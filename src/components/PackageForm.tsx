
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PackageFormProps {
  customerId: string;
  tripId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PackageForm({ customerId, tripId, onSuccess, onCancel }: PackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: '',
    weight: '',
    dimensions: ''
  });

  const generateTrackingNumber = () => {
    const prefix = 'EO';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
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

      const { error } = await supabase
        .from('packages')
        .insert([{
          tracking_number: trackingNumber,
          customer_id: customerId,
          description: formData.description,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          dimensions: formData.dimensions || null,
          origin: tripData.origin,
          destination: tripData.destination,
          flight_number: tripData.flight_number,
          trip_id: tripId,
          status: 'pending'
        }]);

      if (error) throw error;

      // Create initial tracking event
      const { data: packageData } = await supabase
        .from('packages')
        .select('id')
        .eq('tracking_number', trackingNumber)
        .single();

      if (packageData) {
        await supabase
          .from('tracking_events')
          .insert([{
            package_id: packageData.id,
            event_type: 'created',
            description: 'Encomienda creada',
            location: tripData.origin
          }]);
      }

      toast({
        title: "Encomienda creada",
        description: `Número de seguimiento: ${trackingNumber}`,
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating package:', error);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descripción del contenido..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          <Label htmlFor="dimensions">Dimensiones</Label>
          <Input
            id="dimensions"
            value={formData.dimensions}
            onChange={(e) => setFormData(prev => ({ ...prev, dimensions: e.target.value }))}
            placeholder="20x30x10 cm"
          />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creando...' : 'Crear Encomienda'}
        </Button>
      </DialogFooter>
    </form>
  );
}
