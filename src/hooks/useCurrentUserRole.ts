
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCurrentUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-user-role', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('useCurrentUserRole: No user found');
        return null;
      }

      console.log('useCurrentUserRole: Fetching user role for user:', user.id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('useCurrentUserRole: Error fetching user role:', error);
        throw error;
      }
      
      console.log('useCurrentUserRole: User role data received:', data);
      return data;
    },
    enabled: !!user,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
