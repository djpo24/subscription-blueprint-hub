
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DispatchBatch {
  id: string;
  dispatch_id: string;
  batch_id: string;
  created_at: string;
  shipment_batches: {
    id: string;
    batch_label: string;
    destination: string;
    total_packages: number;
    total_weight: number | null;
    total_freight: number | null;
    total_amount_to_collect: number | null;
    status: string;
  };
}

export function useDispatchBatches(dispatchId: string) {
  return useQuery({
    queryKey: ['dispatch-batches', dispatchId],
    queryFn: async (): Promise<DispatchBatch[]> => {
      const { data, error } = await supabase
        .from('dispatch_batches')
        .select(`
          *,
          shipment_batches (
            id,
            batch_label,
            destination,
            total_packages,
            total_weight,
            total_freight,
            total_amount_to_collect,
            status
          )
        `)
        .eq('dispatch_id', dispatchId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!dispatchId
  });
}

export function useCreateDispatchWithBatches() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      date, 
      batch_ids, 
      notes 
    }: { 
      date: Date; 
      batch_ids: string[]; 
      notes?: string;
    }) => {
      // Get batch information for totals calculation
      const { data: batches, error: batchError } = await supabase
        .from('shipment_batches')
        .select('total_packages, total_weight, total_freight, total_amount_to_collect')
        .in('id', batch_ids);

      if (batchError) throw batchError;

      // Calculate dispatch totals from batches
      const totals = batches.reduce(
        (acc, batch) => ({
          packages: acc.packages + (batch.total_packages || 0),
          weight: acc.weight + (batch.total_weight || 0),
          freight: acc.freight + (batch.total_freight || 0),
          amount_to_collect: acc.amount_to_collect + (batch.total_amount_to_collect || 0)
        }),
        { packages: 0, weight: 0, freight: 0, amount_to_collect: 0 }
      );

      // Format date consistently
      const formatDateForQuery = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Create the dispatch
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .insert({
          dispatch_date: formatDateForQuery(date),
          total_packages: totals.packages,
          total_weight: totals.weight,
          total_freight: totals.freight,
          total_amount_to_collect: totals.amount_to_collect,
          notes: notes || null
        })
        .select()
        .single();

      if (dispatchError) throw dispatchError;

      // Create dispatch-batch relationships
      const dispatchBatches = batch_ids.map(batch_id => ({
        dispatch_id: dispatch.id,
        batch_id: batch_id
      }));

      const { error: relationError } = await supabase
        .from('dispatch_batches')
        .insert(dispatchBatches);

      if (relationError) throw relationError;

      // Update batch status to 'dispatched'
      const { error: statusError } = await supabase
        .from('shipment_batches')
        .update({ 
          status: 'dispatched',
          updated_at: new Date().toISOString()
        })
        .in('id', batch_ids);

      if (statusError) throw statusError;

      // Update packages status to 'procesado' through the batches
      const { error: packageUpdateError } = await supabase
        .from('packages')
        .update({ 
          status: 'procesado',
          updated_at: new Date().toISOString()
        })
        .in('batch_id', batch_ids);

      if (packageUpdateError) {
        console.error('Error updating package status:', packageUpdateError);
      }

      return dispatch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['shipment-batches'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    }
  });
}
