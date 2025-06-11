
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TrackingEvent } from '@/types/supabase-temp';

export function usePackageStatusInvestigation() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  const { data: packageDetails, isLoading: isLoadingPackage } = useQuery({
    queryKey: ['package-investigation', selectedPackageId],
    queryFn: async () => {
      if (!selectedPackageId) return null;

      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers!customer_id (
            name,
            email,
            phone
          )
        `)
        .eq('id', selectedPackageId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!selectedPackageId
  });

  const { data: trackingEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['tracking-events', selectedPackageId],
    queryFn: async (): Promise<TrackingEvent[]> => {
      if (!selectedPackageId) return [];

      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('package_id', selectedPackageId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform to match TrackingEvent interface
      return (data || []).map(event => ({
        ...event,
        created_at: event.created_at || new Date().toISOString()
      }));
    },
    enabled: !!selectedPackageId
  });

  const { data: userActions = [], isLoading: isLoadingActions } = useQuery({
    queryKey: ['package-user-actions', selectedPackageId],
    queryFn: async () => {
      if (!selectedPackageId) return [];

      const { data, error } = await supabase
        .from('user_actions')
        .select('*')
        .eq('record_id', selectedPackageId)
        .eq('table_name', 'packages')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(action => ({
        ...action,
        user_name: 'Usuario desconocido', // Default since we can't join with user_profiles
        user_email: ''
      }));
    },
    enabled: !!selectedPackageId
  });

  return {
    selectedPackageId,
    setSelectedPackageId,
    packageDetails,
    trackingEvents,
    userActions,
    isLoading: isLoadingPackage || isLoadingEvents || isLoadingActions
  };
}
