
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
          description.ilike.%${searchLower}%
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('❌ [usePackageSearch] Error en búsqueda:', error);
        throw error;
      }
      
      // Filtrar también por datos del cliente en el frontend
      const filteredData = data?.filter(pkg => {
        // Verificar si el término de búsqueda coincide con los datos del cliente
        if (pkg.customers) {
          const customerName = pkg.customers.name?.toLowerCase() || '';
          const customerPhone = pkg.customers.phone?.toLowerCase() || '';
          const customerIdNumber = pkg.customers.id_number?.toLowerCase() || '';
          
          return customerName.includes(searchLower) || 
                 customerPhone.includes(searchLower) || 
                 customerIdNumber.includes(searchLower);
        }
        return false;
      }) || [];
      
      // Combinar resultados de paquetes y clientes
      const packageResults = data || [];
      const combinedResults = [...packageResults, ...filteredData];
      
      // Eliminar duplicados basándose en el ID
      const uniqueResults = combinedResults.filter((pkg, index, self) => 
        index === self.findIndex(p => p.id === pkg.id)
      );
      
      console.log('✅ [usePackageSearch] Encomiendas encontradas:', uniqueResults.length);
      return uniqueResults;
    },
    enabled: !!searchTerm.trim(),
    staleTime: 30000, // Cache por 30 segundos
  });
}
