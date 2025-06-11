
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserActivity, ActivityType } from '../types';

export function useUserActivities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType>('all');

  const { data: userActivities = [], isLoading, refetch } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async () => {
      console.log('Fetching user activities from database...');
      
      const { data, error } = await supabase
        .from('user_actions')
        .select(`
          *,
          user_profiles!user_actions_user_id_fkey(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching user activities:', error);
        throw error;
      }

      console.log('Fetched user activities:', data);

      // Transform the data to match our UserActivity interface
      const transformedData: UserActivity[] = (data || []).map(activity => ({
        id: activity.id,
        created_at: activity.created_at,
        action_type: activity.action_type, // Map action_type to action_type
        activity_type: activity.action_type, // Also map to activity_type
        description: activity.description,
        user_name: activity.user_profiles ? `${activity.user_profiles.first_name} ${activity.user_profiles.last_name}` : 'Usuario desconocido',
        user_email: activity.user_profiles?.email || '',
        table_name: activity.table_name,
        record_id: activity.record_id,
        old_values: activity.old_values,
        new_values: activity.new_values,
        can_revert: activity.can_revert,
        reverted_at: activity.reverted_at,
        reverted_by: activity.reverted_by
      }));

      return transformedData;
    },
  });

  const filteredActivities = userActivities.filter((activity: UserActivity) => {
    const matchesSearch = 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = activityTypeFilter === 'all' || activity.activity_type === activityTypeFilter;
    
    return matchesSearch && matchesType;
  });

  return {
    userActivities,
    filteredActivities,
    isLoading,
    refetch,
    searchTerm,
    setSearchTerm,
    activityTypeFilter,
    setActivityTypeFilter
  };
}
