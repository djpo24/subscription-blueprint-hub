
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackageSearch(searchTerm: string) {
  return useQuery({
    queryKey: ['package-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) {
        return [];
      }

      console.log('🔍 [usePackageSearch] Buscando encomiendas con término:', searchTerm);
      
      const searchLower = searchTerm.toLowerCase().trim();
      
      // Buscar en toda la base de datos de encomiendas
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
        .or(`
          tracking_number.ilike.%${searchLower}%,
          description.ilike.%${searchLower}%,
          customers.name.ilike.%${searchLower}%,
          customers.phone.ilike.%${searchLower}%,
          customers.id_number.ilike.%${searchLower}%
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Limitar a 100 resultados para rendimiento
      
      if (error) {
        console.error('❌ [usePackageSearch] Error en búsqueda:', error);
        throw error;
      }
      
      console.log('✅ [usePackageSearch] Encomiendas encontradas:', data?.length || 0);
      return data || [];
    },
    enabled: !!searchTerm.trim(),
    staleTime: 30000, // Cache por 30 segundos
  });
}
