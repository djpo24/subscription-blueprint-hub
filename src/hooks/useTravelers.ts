
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTravelers() {
  return useQuery({
    queryKey: ['travelers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travelers')
        .select(`
          *,
          user_profiles!inner(
            user_id,
            email,
            role,
            is_active
          )
        `)
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}

// Hook to get travelers that can be used in trip creation (includes both linked and standalone)
export function useAvailableTravelers() {
  return useQuery({
    queryKey: ['available-travelers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travelers')
        .select(`
          *,
          user_profiles(
            user_id,
            email,
            role,
            is_active
          )
        `)
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}
