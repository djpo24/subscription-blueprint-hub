
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCurrentUserRole() {
  return useQuery({
    queryKey: ['current-user-role'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      return data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
