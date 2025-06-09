
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TrackingEvent {
  id: string;
  event_type: string;
  description: string;
  location: string | null;
  timestamp: string;
}

interface UserAction {
  id: string;
  action_type: string;
  description: string;
  user_name: string;
  created_at: string;
  old_values: any;
  new_values: any;
  table_name: string;
  record_id: string;
}

interface PackageInfo {
  id: string;
  tracking_number: string;
  status: string;
  customer_name: string | null;
  updated_at: string;
  created_at: string;
}

interface InvestigationResult {
  package: PackageInfo;
  trackingEvents: TrackingEvent[];
  userActions: UserAction[];
  analysis: string[];
}

export function usePackageStatusInvestigation() {
  const [trackingNumber, setTrackingNumber] = useState<string | null>(null);

  const { data: investigationResult, isLoading, refetch } = useQuery({
    queryKey: ['package-investigation', trackingNumber],
    queryFn: async (): Promise<InvestigationResult | null> => {
      if (!trackingNumber) return null;

      console.log('🔍 Iniciando investigación para:', trackingNumber);

      // 1. Obtener información del paquete
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          status,
          updated_at,
          created_at,
          customers!inner(name)
        `)
        .eq('tracking_number', trackingNumber)
        .single();

      if (packageError) {
        console.error('❌ Error obteniendo paquete:', packageError);
        throw new Error(`Paquete no encontrado: ${packageError.message}`);
      }

      // 2. Obtener eventos de tracking
      const { data: trackingEvents, error: trackingError } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('package_id', packageData.id)
        .order('timestamp', { ascending: false });

      if (trackingError) {
        console.error('❌ Error obteniendo eventos:', trackingError);
      }

      // 3. Obtener acciones de usuario relacionadas con este paquete
      const { data: userActions, error: actionsError } = await supabase
        .from('user_actions')
        .select(`
          *,
          user_profiles!fk_user_actions_user_profiles(first_name, last_name)
        `)
        .eq('table_name', 'packages')
        .eq('record_id', packageData.id)
        .order('created_at', { ascending: false });

      if (actionsError) {
        console.error('❌ Error obteniendo acciones:', actionsError);
      }

      // 4. Buscar acciones que contengan cambios de estado
      const { data: statusChangeActions, error: statusError } = await supabase
        .from('user_actions')
        .select(`
          *,
          user_profiles!fk_user_actions_user_profiles(first_name, last_name)
        `)
        .eq('table_name', 'packages')
        .or(`description.ilike.%transito%,description.ilike.%in_transit%,new_values->>status.eq.transito,new_values->>status.eq.in_transit`)
        .order('created_at', { ascending: false });

      if (statusError) {
        console.error('❌ Error obteniendo cambios de estado:', statusError);
      }

      // Combinar todas las acciones relevantes
      const allRelevantActions = [
        ...(userActions || []),
        ...(statusChangeActions || [])
      ].filter((action, index, self) => 
        index === self.findIndex(a => a.id === action.id)
      );

      // 5. Analizar los datos
      const analysis = analyzeStatusChanges(
        packageData,
        trackingEvents || [],
        allRelevantActions
      );

      return {
        package: {
          id: packageData.id,
          tracking_number: packageData.tracking_number,
          status: packageData.status,
          customer_name: packageData.customers?.name || null,
          updated_at: packageData.updated_at,
          created_at: packageData.created_at
        },
        trackingEvents: (trackingEvents || []).map(event => ({
          id: event.id,
          event_type: event.event_type,
          description: event.description,
          location: event.location,
          timestamp: event.timestamp
        })),
        userActions: allRelevantActions.map(action => ({
          id: action.id,
          action_type: action.action_type,
          description: action.description,
          user_name: action.user_profiles 
            ? `${action.user_profiles.first_name} ${action.user_profiles.last_name}`
            : 'Usuario desconocido',
          created_at: action.created_at,
          old_values: action.old_values,
          new_values: action.new_values,
          table_name: action.table_name,
          record_id: action.record_id
        })),
        analysis
      };
    },
    enabled: !!trackingNumber,
  });

  const investigatePackage = (packageTrackingNumber: string) => {
    setTrackingNumber(packageTrackingNumber);
  };

  return {
    investigatePackage,
    investigationResult,
    isLoading,
    refetch
  };
}

function analyzeStatusChanges(
  packageInfo: any,
  trackingEvents: TrackingEvent[],
  userActions: any[]
): string[] {
  const analysis: string[] = [];

  // Buscar eventos relacionados con "transito"
  const transitEvents = trackingEvents.filter(event => 
    event.event_type.includes('transit') || 
    event.description.toLowerCase().includes('transito') ||
    event.description.toLowerCase().includes('in_transit')
  );

  // Buscar acciones de usuario que cambien el estado
  const statusChangeActions = userActions.filter(action => 
    action.new_values?.status === 'transito' || 
    action.new_values?.status === 'in_transit' ||
    action.description.toLowerCase().includes('transito')
  );

  if (transitEvents.length > 0) {
    analysis.push(`Se encontraron ${transitEvents.length} eventos de tracking relacionados con tránsito.`);
    transitEvents.forEach(event => {
      analysis.push(`- Evento "${event.event_type}": ${event.description} (${new Date(event.timestamp).toLocaleString()})`);
    });
  }

  if (statusChangeActions.length > 0) {
    analysis.push(`Se encontraron ${statusChangeActions.length} acciones de usuario que cambiaron el estado.`);
    statusChangeActions.forEach(action => {
      analysis.push(`- ${action.user_name || 'Usuario desconocido'}: ${action.description} (${new Date(action.created_at).toLocaleString()})`);
    });
  }

  // Verificar si no hay logs específicos
  if (transitEvents.length === 0 && statusChangeActions.length === 0) {
    analysis.push('⚠️ No se encontraron logs específicos del cambio a "en transito".');
    analysis.push('Posibles causas:');
    analysis.push('- El cambio se hizo a través de la función useMarkTripAsInTransit (marcar viaje en tránsito)');
    analysis.push('- El cambio se hizo mediante un proceso automatizado que no registra logs detallados');
    analysis.push('- El estado se cambió directamente en la base de datos');
    analysis.push('- Existe un bug en el sistema de logging');
  }

  // Verificar si el paquete está en un despacho
  analysis.push('💡 Recomendación: Verificar si este paquete está asociado a un despacho y si se usó la función "Marcar viaje en tránsito".');

  return analysis;
}
