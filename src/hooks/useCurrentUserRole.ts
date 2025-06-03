
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCurrentUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-user-role', user?.id],
    queryFn: async () => {
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
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
