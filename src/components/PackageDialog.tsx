
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

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PackageDialog({ open, onOpenChange, onSuccess }: PackageDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    description: '',
    weight: '',
    dimensions: '',
    origin: '',
    destination: '',
    flight_number: ''
  });

  // Fetch customers for the dropdown
  const { data: customers = [] } = useQuery({
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

  const generateTrackingNumber = () => {
    const prefix = 'EO';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const trackingNumber = generateTrackingNumber();
      
      const { error } = await supabase
        .from('packages')
        .insert([{
          tracking_number: trackingNumber,
          customer_id: formData.customer_id,
          description: formData.description,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          dimensions: formData.dimensions || null,
          origin: formData.origin,
          destination: formData.destination,
          flight_number: formData.flight_number || null,
          status: 'pending'
        }]);

      if (error) throw error;

      // Create initial tracking event
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: (await supabase
            .from('packages')
            .select('id')
            .eq('tracking_number', trackingNumber)
            .single()).data?.id,
          event_type: 'created',
          description: 'Encomienda creada',
          location: formData.origin
        }]);

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
        origin: '',
        destination: '',
        flight_number: ''
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
              <Select 
                value={formData.customer_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
                required
              >
                <SelectTrigger>
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
            </div>

            <div>
              <Label htmlFor="flight_number">Número de Vuelo (Opcional)</Label>
              <Input
                id="flight_number"
                value={formData.flight_number}
                onChange={(e) => setFormData(prev => ({ ...prev, flight_number: e.target.value }))}
                placeholder="AV123"
              />
            </div>
          </div>

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
              <Label htmlFor="origin">Origen</Label>
              <Select 
                value={formData.origin} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, origin: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar origen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                  <SelectItem value="Curazao">Curazao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="destination">Destino</Label>
              <Select 
                value={formData.destination} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, destination: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar destino" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barranquilla">Barranquilla</SelectItem>
                  <SelectItem value="Curazao">Curazao</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
