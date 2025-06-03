
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useCurrentUserRolePreview(previewRole?: 'admin' | 'employee' | 'traveler') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['current-user-role-preview', user?.id, previewRole],
    queryFn: async () => {
      if (!user) {
        console.log('useCurrentUserRolePreview: No user found');
        return null;
      }

      // Si se especifica un rol de preview, usarlo
      if (previewRole) {
        console.log('useCurrentUserRolePreview: Using preview role:', previewRole);
        return {
          role: previewRole,
          is_active: true
        };
      }

      console.log('useCurrentUserRolePreview: Fetching user role for user:', user.id);

      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, is_active')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('useCurrentUserRolePreview: Error fetching user role:', error);
        throw error;
      }
      
      console.log('useCurrentUserRolePreview: User role data received:', data);
      return data;
    },
    enabled: !!user,
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
