
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePackages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const packagesQuery = useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('*, customers(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const updatePackage = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from('packages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    }
  });

  return {
    packages: packagesQuery.data || [],
    filteredPackages: packagesQuery.data || [], // For now, return all packages as filtered
    isLoading: packagesQuery.isLoading,
    data: packagesQuery.data || [],
    refetch: packagesQuery.refetch,
    updatePackage: (id: string, updates: any) => updatePackage.mutate({ id, updates }),
    disableChat: false // Default value
  };
}
