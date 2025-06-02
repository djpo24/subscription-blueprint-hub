
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ShipmentBatch {
  id: string;
  trip_id: string;
  batch_number: string;
  batch_label: string;
  destination: string;
  total_packages: number;
  total_weight: number | null;
  total_freight: number | null;
  total_amount_to_collect: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CreateBatchData {
  trip_id: string;
  destination: string;
  package_ids: string[];
}

export function useShipmentBatches(tripId?: string) {
  return useQuery({
    queryKey: ['shipment-batches', tripId],
    queryFn: async (): Promise<ShipmentBatch[]> => {
      let query = supabase
        .from('shipment_batches')
        .select('*')
        .order('batch_number', { ascending: true });

      if (tripId) {
        query = query.eq('trip_id', tripId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ trip_id, destination, package_ids }: CreateBatchData) => {
      // Get the next batch number for this trip
      const { data: existingBatches, error: batchError } = await supabase
        .from('shipment_batches')
        .select('batch_number')
        .eq('trip_id', trip_id)
        .order('batch_number', { ascending: false })
        .limit(1);

      if (batchError) throw batchError;

      const nextBatchNumber = existingBatches && existingBatches.length > 0 
        ? String(parseInt(existingBatches[0].batch_number) + 1).padStart(3, '0')
        : '001';

      // Generate batch label using the database function
      const { data: labelData, error: labelError } = await supabase
        .rpc('generate_batch_label', {
          p_trip_id: trip_id,
          p_batch_number: nextBatchNumber
        });

      if (labelError) throw labelError;

      // Create the batch
      const { data: batch, error: createError } = await supabase
        .from('shipment_batches')
        .insert({
          trip_id,
          batch_number: nextBatchNumber,
          batch_label: labelData,
          destination,
          status: 'pending'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Assign packages to the batch
      const { error: updateError } = await supabase
        .from('packages')
        .update({ batch_id: batch.id })
        .in('id', package_ids);

      if (updateError) throw updateError;

      return batch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment-batches'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip'] });
    }
  });
}

export function useBatchPackages(batchId: string) {
  return useQuery({
    queryKey: ['batch-packages', batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .eq('batch_id', batchId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!batchId
  });
}
