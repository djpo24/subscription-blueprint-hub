
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  total_packages: number;
  total_weight: number | null;
  total_freight: number | null;
  total_amount_to_collect: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  notes: string | null;
}

interface PackageInDispatch {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

// Helper function to format date consistently avoiding timezone issues
const formatDateForQuery = (date: Date): string => {
  // Use local date components to avoid timezone conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function useDispatchRelations(date?: Date) {
  return useQuery({
    queryKey: ['dispatch-relations', date ? formatDateForQuery(date) : 'all'],
    queryFn: async (): Promise<DispatchRelation[]> => {
      console.log('🔍 Fecha recibida en useDispatchRelations:', date);
      
      let query = supabase
        .from('dispatch_relations')
        .select('*')
        .order('created_at', { ascending: false });

      if (date) {
        const formattedDate = formatDateForQuery(date);
        console.log('📅 Fecha formateada para consulta:', formattedDate);
        query = query.eq('dispatch_date', formattedDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error en consulta de despachos:', error);
        throw error;
      }
      
      console.log('📦 Despachos encontrados:', data);
      console.log('📊 Número de despachos:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('🗓️ Fechas de despacho en los datos:', data.map(d => d.dispatch_date));
      }
      
      return data || [];
    }
  });
}

// Updated to get packages through batches instead of direct dispatch_packages relationship
export function useDispatchPackages(dispatchId: string) {
  return useQuery({
    queryKey: ['dispatch-packages', dispatchId],
    queryFn: async (): Promise<PackageInDispatch[]> => {
      // Get packages through the new batch system
      const { data, error } = await supabase
        .from('dispatch_batches')
        .select(`
          shipment_batches!inner (
            packages (
              id,
              tracking_number,
              origin,
              destination,
              status,
              description,
              weight,
              freight,
              amount_to_collect,
              customers (
                name,
                email
              )
            )
          )
        `)
        .eq('dispatch_id', dispatchId);
      
      if (error) throw error;
      
      // Flatten the packages from all batches
      const packages: PackageInDispatch[] = [];
      data?.forEach(dispatchBatch => {
        if (dispatchBatch.shipment_batches?.packages) {
          packages.push(...(dispatchBatch.shipment_batches.packages as PackageInDispatch[]));
        }
      });
      
      return packages;
    },
    enabled: !!dispatchId
  });
}

// Legacy create dispatch function - now creates batches automatically
export function useCreateDispatch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      date, 
      packageIds, 
      notes 
    }: { 
      date: Date; 
      packageIds: string[]; 
      notes?: string;
    }) => {
      // Get package information with trip details
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          id,
          trip_id,
          destination,
          weight,
          freight,
          amount_to_collect,
          trips!inner (
            id,
            origin,
            destination
          )
        `)
        .in('id', packageIds);

      if (packagesError) throw packagesError;

      // Group packages by trip and destination to create batches
      const tripDestinationGroups = new Map();
      
      packages.forEach(pkg => {
        const key = `${pkg.trip_id}-${pkg.destination}`;
        if (!tripDestinationGroups.has(key)) {
          tripDestinationGroups.set(key, {
            trip_id: pkg.trip_id,
            destination: pkg.destination,
            packages: []
          });
        }
        tripDestinationGroups.get(key).packages.push(pkg);
      });

      // Create batches for each trip-destination combination
      const batchIds: string[] = [];
      
      for (const [key, group] of tripDestinationGroups) {
        // Get next batch number for this trip
        const { data: existingBatches, error: batchError } = await supabase
          .from('shipment_batches')
          .select('batch_number')
          .eq('trip_id', group.trip_id)
          .order('batch_number', { ascending: false })
          .limit(1);

        if (batchError) throw batchError;

        const nextBatchNumber = existingBatches && existingBatches.length > 0 
          ? String(parseInt(existingBatches[0].batch_number) + 1).padStart(3, '0')
          : '001';

        // Generate batch label
        const { data: labelData, error: labelError } = await supabase
          .rpc('generate_batch_label', {
            p_trip_id: group.trip_id,
            p_batch_number: nextBatchNumber
          });

        if (labelError) throw labelError;

        // Create batch
        const { data: batch, error: createBatchError } = await supabase
          .from('shipment_batches')
          .insert({
            trip_id: group.trip_id,
            batch_number: nextBatchNumber,
            batch_label: labelData,
            destination: group.destination,
            status: 'pending'
          })
          .select()
          .single();

        if (createBatchError) throw createBatchError;

        // Assign packages to batch
        const packageIdsForBatch = group.packages.map(p => p.id);
        const { error: updateError } = await supabase
          .from('packages')
          .update({ batch_id: batch.id })
          .in('id', packageIdsForBatch);

        if (updateError) throw updateError;

        batchIds.push(batch.id);
      }

      // Calculate totals from all created batches
      const { data: batches, error: batchTotalsError } = await supabase
        .from('shipment_batches')
        .select('total_packages, total_weight, total_freight, total_amount_to_collect')
        .in('id', batchIds);

      if (batchTotalsError) throw batchTotalsError;

      const totals = batches.reduce(
        (acc, batch) => ({
          packages: acc.packages + (batch.total_packages || 0),
          weight: acc.weight + (batch.total_weight || 0),
          freight: acc.freight + (batch.total_freight || 0),
          amount_to_collect: acc.amount_to_collect + (batch.total_amount_to_collect || 0)
        }),
        { packages: 0, weight: 0, freight: 0, amount_to_collect: 0 }
      );

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
      const dispatchBatches = batchIds.map(batch_id => ({
        dispatch_id: dispatch.id,
        batch_id: batch_id
      }));

      const { error: relationError } = await supabase
        .from('dispatch_batches')
        .insert(dispatchBatches);

      if (relationError) throw relationError;

      // Update batch status to 'dispatched'
      const { error: batchStatusError } = await supabase
        .from('shipment_batches')
        .update({ 
          status: 'dispatched',
          updated_at: new Date().toISOString()
        })
        .in('id', batchIds);

      if (batchStatusError) throw batchStatusError;

      // Update packages status to 'procesado'
      const { error: packageUpdateError } = await supabase
        .from('packages')
        .update({ 
          status: 'procesado',
          updated_at: new Date().toISOString()
        })
        .in('id', packageIds);

      if (packageUpdateError) {
        console.error('Error updating package status:', packageUpdateError);
      }

      // Create tracking events for each package
      const trackingEvents = packageIds.map(packageId => ({
        package_id: packageId,
        event_type: 'processed',
        description: 'Encomienda procesada para despacho',
        location: 'Centro de procesamiento'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('Error creating tracking events:', trackingError);
      }

      return dispatch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['shipment-batches'] });
    }
  });
}
