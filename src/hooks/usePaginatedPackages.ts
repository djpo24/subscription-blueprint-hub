import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UsePaginatedPackagesParams {
  page: number;
  pageSize: number;
  search?: string;
}

export function usePaginatedPackages({ page, pageSize, search = '' }: UsePaginatedPackagesParams) {
  const trimmedSearch = search.trim();

  return useQuery({
    queryKey: ['packages-paginated', page, pageSize, trimmedSearch],
    queryFn: async () => {
      let query = supabase
        .from('packages')
        .select(
          `
            *,
            customers (
              name,
              email
            )
          `,
          { count: 'exact' }
        )
        .is('deleted_at', null);

      if (trimmedSearch) {
        const escaped = trimmedSearch.replace(/[%,]/g, ' ');
        query = query.or(
          `tracking_number.ilike.%${escaped}%,description.ilike.%${escaped}%`
        );
      }

      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        data: data || [],
        total: count ?? 0,
      };
    },
    placeholderData: keepPreviousData,
  });
}
