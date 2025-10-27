import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CustomerSearchSelector } from '@/components/CustomerSearchSelector';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CarrierTrackingFormProps {
  onResult: (result: any) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const carriers = [
  { value: 'interrapidisimo', label: 'Interrapidísimo' },
  { value: 'servientrega', label: 'Servientrega' },
  { value: 'envia', label: 'Envía' },
  { value: 'deprisa', label: 'Deprisa' },
  { value: 'coordinadora', label: 'Coordinadora' }
];

export function CarrierTrackingForm({ onResult, isLoading, setIsLoading }: CarrierTrackingFormProps) {
  const [customerId, setCustomerId] = useState('');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !carrier || !trackingNumber) {
      toast.error('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('track-carrier', {
        body: {
          carrier,
          trackingNumber,
          customerId,
          saveToDatabase: true
        }
      });

      if (error) {
        console.error('Error tracking carrier:', error);
        toast.error('Error al consultar la transportadora');
        onResult({
          carrier,
          trackingNumber,
          status: 'error',
          events: [],
          error: error.message
        });
        return;
      }

      onResult(data);
      toast.success('Guía agregada al seguimiento automático');
      
      // Reset form
      setTrackingNumber('');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error('Error al realizar la consulta');
      onResult({
        carrier,
        trackingNumber,
        status: 'error',
        events: [],
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <CustomerSearchSelector
          selectedCustomerId={customerId}
          onCustomerChange={setCustomerId}
        />
      </div>

      <div>
        <Label htmlFor="carrier">Transportadora</Label>
        <Select value={carrier} onValueChange={setCarrier}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una transportadora" />
          </SelectTrigger>
          <SelectContent>
            {carriers.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="trackingNumber">Número de Guía</Label>
        <Input
          id="trackingNumber"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          placeholder="Ingresa el número de guía"
          required
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        <Search className="mr-2 h-4 w-4" />
        {isLoading ? 'Consultando...' : 'Consultar Estado'}
      </Button>
    </form>
  );
}
