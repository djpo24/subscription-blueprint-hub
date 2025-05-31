
import { useState } from 'react';
import { format, startOfToday } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TripFormData {
  route: string;
  flight_number: string;
}

export function useTripForm(onSuccess: () => void) {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<Date>();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<TripFormData>({
    route: '',
    flight_number: ''
  });

  const today = startOfToday();

  // Function to parse route and get origin and destination
  const parseRoute = (route: string) => {
    if (route === 'Barranquilla-Curazao') {
      return { origin: 'Barranquilla', destination: 'Curazao' };
    } else if (route === 'Curazao-Barranquilla') {
      return { origin: 'Curazao', destination: 'Barranquilla' };
    }
    return { origin: '', destination: '' };
  };

  const updateFormData = (updates: Partial<TripFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha",
        variant: "destructive"
      });
      return;
    }

    if (!formData.route) {
      toast({
        title: "Error",
        description: "Por favor selecciona el viaje",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { origin, destination } = parseRoute(formData.route);
      
      const { error } = await supabase
        .from('trips')
        .insert([{
          trip_date: format(date, 'yyyy-MM-dd'),
          origin: origin,
          destination: destination,
          flight_number: formData.flight_number || null,
          status: 'scheduled'
        }]);

      if (error) throw error;

      toast({
        title: "Viaje creado",
        description: `Viaje de ${origin} a ${destination} creado exitosamente`,
      });

      // Reset form
      setFormData({
        route: '',
        flight_number: ''
      });
      setDate(undefined);

      onSuccess();
    } catch (error: any) {
      console.error('Error creating trip:', error);
      if (error.code === '23505') {
        toast({
          title: "Error",
          description: "Ya existe un viaje para esta fecha y ruta",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el viaje",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    formData,
    updateFormData,
    date,
    setDate,
    today,
    isLoading,
    handleSubmit
  };
}
