
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import { InlineCustomerForm } from './InlineCustomerForm';

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tripId?: string;
}

export function PackageDialog({ open, onOpenChange, onSuccess, tripId }: PackageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    description: '',
    weight: '',
    dimensions: '',
    trip_id: tripId || ''
  });

  // Fetch customers for the dropdown
  const { data: customers = [], refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch trips for the dropdown (when no specific trip is provided)
  const { data: trips = [] } = useQuery({
    queryKey: ['trips-for-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_date, origin, destination, flight_number')
        .eq('status', 'scheduled')
        .order('trip_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !tripId
  });

  const generateTrackingNumber = () => {
    const prefix = 'EO';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const handleCustomerCreated = (customerId: string) => {
    setFormData(prev => ({ ...prev, customer_id: customerId }));
    setShowCustomerForm(false);
    refetchCustomers();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trackingNumber = generateTrackingNumber();
      
      // Get trip details for origin and destination
      const selectedTripId = tripId || formData.trip_id;
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('origin, destination, flight_number')
        .eq('id', selectedTripId)
        .single();

      if (tripError) throw tripError;

      const { error } = await supabase
        .from('packages')
        .insert([{
          tracking_number: trackingNumber,
          customer_id: formData.customer_id,
          description: formData.description,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          dimensions: formData.dimensions || null,
          origin: tripData.origin,
          destination: tripData.destination,
          flight_number: tripData.flight_number,
          trip_id: selectedTripId,
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

      // Reset form
      setFormData({
        customer_id: '',
        description: '',
        weight: '',
        dimensions: '',
        trip_id: tripId || ''
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nueva Encomienda</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva encomienda.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer">Cliente</Label>
              <div className="flex gap-2">
                <Select 
                  value={formData.customer_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                  required
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Seleccionar cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomerForm(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!tripId && (
              <div>
                <Label htmlFor="trip">Viaje</Label>
                <Select 
                  value={formData.trip_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trip_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar viaje" />
                  </SelectTrigger>
                  <SelectContent>
                    {trips.map((trip) => (
                      <SelectItem key={trip.id} value={trip.id}>
                        {new Date(trip.trip_date).toLocaleDateString()} - {trip.origin} → {trip.destination}
                        {trip.flight_number && ` (${trip.flight_number})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {showCustomerForm && (
            <InlineCustomerForm
              onSuccess={handleCustomerCreated}
              onCancel={() => setShowCustomerForm(false)}
            />
          )}

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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Encomienda'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
