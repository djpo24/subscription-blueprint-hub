
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCurrentUserRoleWithPreview(previewRole?: 'admin' | 'employee' | 'traveler') {
  const { user, loading: authLoading } = useAuth();

  return useQuery({
    queryKey: ['current-user-role-with-preview', user?.id, previewRole],
    queryFn: async () => {
      console.log('useCurrentUserRoleWithPreview: Starting query for user:', user?.id);
      
      if (!user) {
        console.log('useCurrentUserRoleWithPreview: No user found');
        return null;
      }

      // If we have a preview role, return it directly
      if (previewRole) {
        console.log('useCurrentUserRoleWithPreview: Using preview role:', previewRole);
        return { role: previewRole, is_active: true };
      }

      console.log('useCurrentUserRoleWithPreview: Fetching user role from database');

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('useCurrentUserRoleWithPreview: Error fetching user role:', error);
        // Return a default role instead of throwing
        return { role: 'employee', is_active: true };
      }
      
      console.log('useCurrentUserRoleWithPreview: User role data received:', data);
      return data;
    },
    enabled: !!user && !authLoading,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
