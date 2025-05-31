
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';

interface PackageFormProps {
  customerId: string;
  tripId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function PackageForm({ customerId, tripId, onSuccess, onCancel }: PackageFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    description: '',
    weight: '',
    freight: '',
    amountToCollect: '',
    currency: 'COP', // Default to Colombian Pesos
    details: [''] // Array to store product details
  });

  const generateTrackingNumber = () => {
    const prefix = 'EO';
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${year}-${random}`;
  };

  const handleDetailChange = (index: number, value: string) => {
    const newDetails = [...formData.details];
    newDetails[index] = value;
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const handleDetailBlur = (index: number) => {
    const currentDetail = formData.details[index];
    if (currentDetail.trim() && index === formData.details.length - 1 && formData.details.length < 20) {
      // Add new empty field if current is the last one and has content
      setFormData(prev => ({
        ...prev,
        details: [...prev.details, '']
      }));
    }
  };

  const handleDetailKeyPress = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentDetail = formData.details[index];
      if (currentDetail.trim() && index === formData.details.length - 1 && formData.details.length < 20) {
        setFormData(prev => ({
          ...prev,
          details: [...prev.details, '']
        }));
        // Focus next input after a short delay
        setTimeout(() => {
          const nextInput = document.querySelector(`input[data-detail-index="${index + 1}"]`) as HTMLInputElement;
          if (nextInput) nextInput.focus();
        }, 100);
      }
    }
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

      const { error } = await supabase
        .from('packages')
        .insert([{
          tracking_number: trackingNumber,
          customer_id: customerId,
          description: finalDescription,
          weight: formData.weight ? parseFloat(formData.weight) : null,
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
      {/* Product details fields */}
      <div>
        <Label>Detalles de productos *</Label>
        <div className="space-y-2 mt-2">
          {formData.details.map((detail, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                data-detail-index={index}
                value={detail}
                onChange={(e) => handleDetailChange(index, e.target.value)}
                onBlur={() => handleDetailBlur(index)}
                onKeyPress={(e) => handleDetailKeyPress(index, e)}
                placeholder={`Producto ${index + 1}${index === 0 ? ' (requerido)' : ' (opcional)'}`}
                required={index === 0}
              />
              <span className="text-sm text-gray-500 min-w-[40px]">
                {index + 1}/20
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Presiona Enter o haz clic fuera del campo para agregar otro producto (máximo 20)
        </p>
      </div>

      {/* Freight and Weight fields side by side */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="freight">Flete (COP)</Label>
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
      </div>

      {/* Amount to collect with currency selection */}
      <div>
        <Label htmlFor="amountToCollect">Valor a cobrar</Label>
        <div className="flex gap-2">
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COP">COP</SelectItem>
              <SelectItem value="ANG">ANG</SelectItem>
            </SelectContent>
          </Select>
          <Input
            id="amountToCollect"
            type="number"
            step="0.01"
            value={formData.amountToCollect}
            onChange={(e) => setFormData(prev => ({ ...prev, amountToCollect: e.target.value }))}
            placeholder="0.00"
            className="flex-1"
          />
        </div>
      </div>

      {/* Optional description field with toggle - moved to bottom */}
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowDescription(!showDescription)}
          className="mb-2"
        >
          {showDescription ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Ocultar descripción
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Agregar descripción (opcional)
            </>
          )}
        </Button>
        
        {showDescription && (
          <div>
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descripción adicional del contenido..."
              rows={3}
            />
          </div>
        )}
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
