
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackageDispatchInfo(packageIds: string[]) {
  return useQuery({
    queryKey: ['package-dispatch-info', packageIds],
    queryFn: async () => {
      if (packageIds.length === 0) return {};
      
      // Obtener información de despachos para los paquetes
      const { data: dispatchPackages, error } = await supabase
        .from('dispatch_packages')
        .select(`
          package_id,
          dispatch_id,
          dispatch_relations!inner (
            id,
            dispatch_date,
            created_at
          )
        `)
        .in('package_id', packageIds)
        .order('dispatch_relations.created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching dispatch info:', error);
        return {};
      }

      // Agrupar por paquete y calcular números de despacho
      const packageDispatchInfo: Record<string, { dispatchNumber: number; totalDispatches: number }> = {};
      
      // Agrupar despachos por paquete
      const dispatchesByPackage = (dispatchPackages || []).reduce((acc, item) => {
        const packageId = item.package_id;
        if (!acc[packageId]) {
          acc[packageId] = [];
        }
        acc[packageId].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Para cada paquete, determinar su número de despacho y total
      Object.entries(dispatchesByPackage).forEach(([packageId, dispatches]) => {
        // Ordenar por fecha de creación
        dispatches.sort((a, b) => 
          new Date(a.dispatch_relations.created_at).getTime() - 
          new Date(b.dispatch_relations.created_at).getTime()
        );

        // El número de despacho es la posición en el array + 1
        const dispatchNumber = dispatches.length; // El último despacho al que fue asignado
        const totalDispatches = dispatches.length;

        packageDispatchInfo[packageId] = {
          dispatchNumber,
          totalDispatches
        };
      });

      return packageDispatchInfo;
    },
    enabled: packageIds.length > 0,
    refetchOnWindowFocus: false,
    staleTime: 30000 // Cache por 30 segundos
  });
}
