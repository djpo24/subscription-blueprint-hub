
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Package, TrackingEvent } from '@/types/supabase-temp';

interface GuestTrackingResult {
  package: Package | null;
  trackingEvents: TrackingEvent[];
  isLoading: boolean;
  error: string | null;
  searchPackage: (trackingNumber: string) => void;
}

export function useGuestTracking(): GuestTrackingResult {
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { data: packageData, isLoading: isLoadingPackage } = useQuery({
    queryKey: ['guest-package', trackingNumber],
    queryFn: async (): Promise<Package | null> => {
      if (!trackingNumber.trim()) return null;

      console.log('🔍 Searching for package:', trackingNumber);
      
      try {
        const { data, error } = await supabase
          .from('packages')
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .eq('tracking_number', trackingNumber)
          .maybeSingle();

        if (error) {
          console.error('❌ Error fetching package:', error);
          throw error;
        }

        if (!data) {
          setError('No se encontró ningún paquete con ese número de seguimiento');
          return null;
        }

        setError(null);
        return data;
      } catch (error) {
        console.error('❌ Error in guest tracking:', error);
        setError('Error al buscar el paquete');
        return null;
      }
    },
    enabled: !!trackingNumber.trim(),
    refetchInterval: 30000,
  });

  const { data: trackingEvents = [], isLoading: isLoadingEvents } = useQuery({
    queryKey: ['guest-tracking-events', packageData?.id],
    queryFn: async (): Promise<TrackingEvent[]> => {
      if (!packageData?.id) return [];

      console.log('🔍 Fetching tracking events for package:', packageData.id);
      
      try {
        const { data, error } = await supabase
          .from('tracking_events')
          .select('*')
          .eq('package_id', packageData.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching tracking events:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('❌ Error fetching tracking events:', error);
        return [];
      }
    },
    enabled: !!packageData?.id,
    refetchInterval: 30000,
  });

  const searchPackage = (newTrackingNumber: string) => {
    setTrackingNumber(newTrackingNumber);
    setError(null);
  };

  return {
    package: packageData || null,
    trackingEvents,
    isLoading: isLoadingPackage || isLoadingEvents,
    error,
    searchPackage
  };
}
