
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'admin' | 'employee' | 'traveler';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useUserProfiles() {
  return useQuery({
    queryKey: ['user-profiles'],
    queryFn: async (): Promise<UserProfile[]> => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user profiles:', error);
        throw error;
      }

      // Transform the data to ensure all required fields are present and properly typed
      return (data || []).map(profile => ({
        ...profile,
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
        phone: profile.phone || '',
        user_id: profile.user_id || '',
        is_active: profile.is_active ?? true,
        role: (profile.role as 'admin' | 'employee' | 'traveler') || 'employee'
      }));
    }
  });
}
