
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TrackingEvent } from '@/types/supabase-temp';

interface InvestigationResult {
  package: {
    tracking_number: string;
    status: string;
    updated_at: string;
    customer_name: string;
  };
  trackingEvents: TrackingEvent[];
  userActions: any[];
  analysis?: string[];
}

export function usePackageStatusInvestigation() {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('');
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);

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
        user_name: 'Usuario desconocido',
        user_email: ''
      }));
    },
    enabled: !!selectedPackageId
  });

  const investigatePackage = (trackingNumber: string) => {
    // Find package by tracking number first
    const findPackageAndInvestigate = async () => {
      const { data: pkg, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers!customer_id (
            name,
            email,
            phone
          )
        `)
        .eq('tracking_number', trackingNumber)
        .single();

      if (!error && pkg) {
        setSelectedPackageId(pkg.id);
        
        // Set investigation result
        setInvestigationResult({
          package: {
            tracking_number: pkg.tracking_number || '',
            status: pkg.status || '',
            updated_at: pkg.updated_at || '',
            customer_name: pkg.customers?.name || 'N/A'
          },
          trackingEvents: [],
          userActions: [],
          analysis: [
            'El paquete cambió a estado "en transito" automáticamente',
            'Puede ser debido a una actualización manual del usuario',
            'Verificar los eventos de tracking para más detalles',
            'Revisar las acciones de usuario para identificar cambios manuales'
          ]
        });
      }
    };

    findPackageAndInvestigate();
  };

  return {
    selectedPackageId,
    setSelectedPackageId,
    packageDetails,
    trackingEvents,
    userActions,
    investigatePackage,
    investigationResult,
    isLoading: isLoadingPackage || isLoadingEvents || isLoadingActions
  };
}
