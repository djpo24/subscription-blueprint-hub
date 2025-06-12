
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMarketingContacts(searchTerm: string = '') {
  return useQuery({
    queryKey: ['marketing-contacts', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('marketing_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`customer_name.ilike.%${searchTerm}%,phone_number.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching marketing contacts:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
}
