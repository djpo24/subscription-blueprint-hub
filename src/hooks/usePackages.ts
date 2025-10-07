
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async () => {
      // Use pagination to bypass 1000 record limit
      let allPackages: any[] = [];
      let page = 0;
      const pageSize = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('packages')
          .select(`
            *,
            customers (
              name,
              email
            )
          `)
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          allPackages = [...allPackages, ...data];
          hasMore = data.length === pageSize;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      return allPackages;
    }
  });
}
