
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDateForQuery } from '@/utils/dateUtils';
import { format } from 'date-fns';

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
      // Obtener información de los paquetes seleccionados
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('weight, freight, amount_to_collect')
        .in('id', packageIds);

      if (packagesError) throw packagesError;

      // Calcular totales
      const totals = packages.reduce(
        (acc, pkg) => ({
          weight: acc.weight + (pkg.weight || 0),
          freight: acc.freight + (pkg.freight || 0),
          amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
        }),
        { weight: 0, freight: 0, amount_to_collect: 0 }
      );

      // Crear el despacho usando el estado inicial "procesado"
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .insert({
          dispatch_date: formatDateForQuery(date),
          total_packages: packageIds.length,
          total_weight: totals.weight,
          total_freight: totals.freight,
          total_amount_to_collect: totals.amount_to_collect,
          status: 'procesado', // Estado inicial en español
          notes: notes || null
        })
        .select()
        .single();

      if (dispatchError) throw dispatchError;

      // Crear las relaciones paquete-despacho
      const dispatchPackages = packageIds.map(packageId => ({
        dispatch_id: dispatch.id,
        package_id: packageId
      }));

      const { error: relationError } = await supabase
        .from('dispatch_packages')
        .insert(dispatchPackages);

      if (relationError) throw relationError;

      // Actualizar el estado de las encomiendas a "despachado" (nuevo estado)
      const { error: updateError } = await supabase
        .from('packages')
        .update({ 
          status: 'despachado', // Cambiar a nuevo estado "despachado"
          updated_at: new Date().toISOString()
        })
        .in('id', packageIds);

      if (updateError) {
        console.error('Error updating package status:', updateError);
        // No lanzamos el error para no fallar todo el proceso
      }

      // Crear eventos de tracking para cada paquete
      const trackingEvents = packageIds.map(packageId => ({
        package_id: packageId,
        event_type: 'dispatched',
        description: 'Encomienda despachada',
        location: 'Centro de distribución'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('Error creating tracking events:', trackingError);
        // No lanzamos el error para no fallar todo el proceso
      }

      return { dispatch, date };
    },
    onSuccess: (data) => {
      const formattedDate = format(data.date, 'yyyy-MM-dd');
      
      // Invalidar todas las queries relevantes inmediatamente
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations', formattedDate] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      // Refetch inmediato para actualización dinámica
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['packages-by-date', formattedDate] });
      queryClient.refetchQueries({ queryKey: ['packages'] });
    }
  });
}
