
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useGlobalPackageSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['packages-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return [];
      }

      const searchLower = searchTerm.toLowerCase().trim();
      
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers (
            name,
            email,
            phone,
            id_number
          )
        `)
        .or(`tracking_number.ilike.%${searchLower}%,description.ilike.%${searchLower}%,customers.name.ilike.%${searchLower}%,customers.phone.ilike.%${searchLower}%,customers.id_number.ilike.%${searchLower}%`)
        .order('created_at', { ascending: false })
        .limit(50); // Limitar a 50 resultados para rendimiento
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchTerm.trim(), // Solo ejecutar si hay término de búsqueda
  });
}
