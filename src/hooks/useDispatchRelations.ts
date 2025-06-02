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
  trip_id: string | null;
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
      console.log('🔍 Fecha original (getDate):', date ? date.getDate() : 'undefined');
      console.log('🔍 Fecha original (getMonth):', date ? date.getMonth() + 1 : 'undefined');
      console.log('🔍 Fecha original (getFullYear):', date ? date.getFullYear() : 'undefined');
      
      let query = supabase
        .from('dispatch_relations')
        .select('*')
        .order('created_at', { ascending: false });

      if (date) {
        const formattedDate = formatDateForQuery(date);
        console.log('📅 Fecha formateada para consulta (nueva función):', formattedDate);
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

export function useDispatchPackages(dispatchId: string) {
  return useQuery({
    queryKey: ['dispatch-packages', dispatchId],
    queryFn: async (): Promise<PackageInDispatch[]> => {
      const { data, error } = await supabase
        .from('dispatch_packages')
        .select(`
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
            trip_id,
            customers (
              name,
              email
            )
          )
        `)
        .eq('dispatch_id', dispatchId);
      
      if (error) throw error;
      
      return data?.map(item => item.packages).filter(Boolean) || [];
    },
    enabled: !!dispatchId
  });
}

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

      // Crear el despacho usando la nueva función de formateo
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .insert({
          dispatch_date: formatDateForQuery(date),
          total_packages: packageIds.length,
          total_weight: totals.weight,
          total_freight: totals.freight,
          total_amount_to_collect: totals.amount_to_collect,
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

      // NUEVO: Actualizar el estado de las encomiendas a "procesado"
      const { error: updateError } = await supabase
        .from('packages')
        .update({ 
          status: 'procesado',
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
        event_type: 'processed',
        description: 'Encomienda procesada para despacho',
        location: 'Centro de procesamiento'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('Error creating tracking events:', trackingError);
        // No lanzamos el error para no fallar todo el proceso
      }

      return dispatch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    }
  });
}
