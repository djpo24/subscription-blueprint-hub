
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

export function useDispatchRelations(date?: Date) {
  return useQuery({
    queryKey: ['dispatch-relations', date ? format(date, 'yyyy-MM-dd') : 'all'],
    queryFn: async (): Promise<DispatchRelation[]> => {
      let query = supabase
        .from('dispatch_relations')
        .select('*')
        .order('created_at', { ascending: false });

      if (date) {
        const formattedDate = format(date, 'yyyy-MM-dd');
        query = query.eq('dispatch_date', formattedDate);
      }

      const { data, error } = await query;
      
      if (error) throw error;
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

      // Crear el despacho
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .insert({
          dispatch_date: format(date, 'yyyy-MM-dd'),
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

      return dispatch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    }
  });
}
