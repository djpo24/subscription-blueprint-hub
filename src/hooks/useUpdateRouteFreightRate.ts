
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateRouteFreightRateParams {
  id?: string;
  origin: string;
  destination: string;
  pricePerKilo: number;
  currency: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  notes?: string;
}

export function useUpdateRouteFreightRate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UpdateRouteFreightRateParams) => {
      const { id, ...data } = params;
      
      const payload = {
        origin: data.origin,
        destination: data.destination,
        price_per_kilo: data.pricePerKilo,
        currency: data.currency,
        effective_from: data.effectiveFrom,
        effective_until: data.effectiveUntil || null,
        notes: data.notes || null,
        is_active: true
      };

      if (id) {
        // Update existing rate
        const { error } = await supabase
          .from('route_freight_rates')
          .update(payload)
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Create new rate
        const { error } = await supabase
          .from('route_freight_rates')
          .insert(payload);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-freight-rates'] });
    },
    onError: (error: any) => {
      console.error('Error updating freight rate:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la tarifa",
        variant: "destructive"
      });
    }
  });
}
