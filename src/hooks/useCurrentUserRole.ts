
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCurrentUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-user-role', user?.id],
    queryFn: async () => {
      if (!user) {
        return null;
      }

      console.log('Fetching user role for user:', user.id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }
      
      console.log('User role data:', data);
      return data;
    },
    enabled: !!user,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
