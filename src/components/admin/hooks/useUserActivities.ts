
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserActivity, ActivityType } from '../types';

export function useUserActivities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState<ActivityType>('all');

  const { data: userActivities = [], isLoading, refetch } = useQuery({
    queryKey: ['user-activities'],
    queryFn: async () => {
      // Since audit_logs doesn't exist, let's create a mock dataset for demonstration
      // In a real implementation, you would query actual audit/log tables
      const mockData: UserActivity[] = [
        {
          id: '1',
          created_at: new Date().toISOString(),
          activity_type: 'LOGIN',
          description: 'Usuario inició sesión en el sistema',
          user_name: 'Admin User',
          user_email: 'admin@example.com'
        },
        {
          id: '2',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          activity_type: 'CREATE',
          description: 'Creó un nuevo paquete',
          user_name: 'Employee User',
          user_email: 'employee@example.com'
        },
        {
          id: '3',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          activity_type: 'UPDATE',
          description: 'Actualizó información de cliente',
          user_name: 'Admin User',
          user_email: 'admin@example.com'
        }
      ];

      return mockData;
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
