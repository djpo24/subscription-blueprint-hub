import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeletedPackage {
  id: string;
  tracking_number: string;
  description: string;
  status: string;
  origin: string;
  destination: string;
  weight: number;
  freight: number;
  amount_to_collect: number;
  currency: string;
  created_at: string;
  deleted_at: string;
  deleted_by: string;
  customer_name: string;
  customer_phone: string;
  trip_date: string;
  deleted_by_name: string;
}

export function useDeletedPackages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deletedPackages = [], isLoading, error } = useQuery({
    queryKey: ['deleted-packages'],
    queryFn: async (): Promise<DeletedPackage[]> => {
      console.log('🔍 Fetching deleted packages...');
      
      const { data, error } = await supabase.rpc('get_deleted_packages');

      if (error) {
        console.error('❌ Error fetching deleted packages:', error);
        throw error;
      }

      console.log('📦 Deleted packages fetched:', data?.length || 0);
      return data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const restorePackageMutation = useMutation({
    mutationFn: async (packageId: string) => {
      console.log('🔄 Restoring package:', packageId);
      
      const { data, error } = await supabase.rpc('restore_deleted_package', {
        package_id: packageId
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Paquete restaurado",
        description: "El paquete ha sido restaurado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['deleted-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
    onError: (error) => {
      console.error('❌ Error restoring package:', error);
      toast({
        title: "Error",
        description: "No se pudo restaurar el paquete",
        variant: "destructive",
      });
    },
  });

  return {
    deletedPackages,
    isLoading,
    error,
    restorePackage: restorePackageMutation.mutate,
    isRestoring: restorePackageMutation.isPending,
  };
}
