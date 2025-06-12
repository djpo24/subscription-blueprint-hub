
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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

  return useMutation({
    mutationFn: async (params: UpdateRouteFreightRateParams) => {
      if (params.id) {
        // Update existing rate
        const { data, error } = await supabase
          .from('route_freight_rates')
          .update({
            origin: params.origin,
            destination: params.destination,
            price_per_kilo: params.pricePerKilo,
            currency: params.currency,
            effective_from: params.effectiveFrom,
            effective_until: params.effectiveUntil || null,
            notes: params.notes,
            updated_at: new Date().toISOString()
          })
          .eq('id', params.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new rate
        const { data, error } = await supabase
          .from('route_freight_rates')
          .insert({
            origin: params.origin,
            destination: params.destination,
            price_per_kilo: params.pricePerKilo,
            currency: params.currency,
            effective_from: params.effectiveFrom,
            effective_until: params.effectiveUntil || null,
            notes: params.notes
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['route-freight-rates'] });
    }
  });
}
