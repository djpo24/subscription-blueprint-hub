
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: Package[];
}

// Estados que SÍ pueden ser despachados
const ELIGIBLE_STATES = [
  'recibido',     // Paquetes que han llegado y están listos para despacho
  'bodega',       // Paquetes en bodega listos para despacho
] as const;

// Estados que NO deben aparecer en el listado de despacho
const INELIGIBLE_STATES = [
  'procesado',    // Ya fue procesado en un despacho anterior
  'delivered',    // Ya fue entregado
  'in_transit',   // Ya está en tránsito
  'transito',     // Variante de in_transit
  'en_destino',   // Ya llegó al destino
  'arrived',      // Ya llegó
] as const;

export function useDispatchEligiblePackages(trips: Trip[] = []) {
  // Obtener todos los IDs de paquetes de los viajes
  const allPackageIds = useMemo(() => {
    return trips.flatMap(trip => trip.packages.map(pkg => pkg.id));
  }, [trips]);

  // Consultar qué paquetes ya están en despachos
  const { data: dispatchedPackages = [] } = useQuery({
    queryKey: ['dispatched-packages', allPackageIds],
    queryFn: async () => {
      if (allPackageIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('dispatch_packages')
        .select('package_id')
        .in('package_id', allPackageIds);

      if (error) {
        console.error('❌ Error fetching dispatched packages:', error);
        return [];
      }

      return data || [];
    },
    enabled: allPackageIds.length > 0,
  });

  return useMemo(() => {
    console.log('🔍 Filtering dispatch-eligible packages...');
    
    // Add safety check for trips parameter
    if (!trips || !Array.isArray(trips)) {
      console.log('⚠️ No trips provided or trips is not an array');
      return [];
    }

    // Crear un Set con los IDs de paquetes ya despachados
    const dispatchedPackageIds = new Set(
      dispatchedPackages.map(dp => dp.package_id)
    );
    
    const eligiblePackages = trips.flatMap(trip => 
      trip.packages
        .filter(pkg => {
          // Verificar si el paquete ya está despachado
          if (dispatchedPackageIds.has(pkg.id)) {
            console.log(`⚠️ Package ${pkg.tracking_number} excluded (already dispatched)`);
            return false;
          }

          // Verificar si el estado es elegible (usar ELIGIBLE_STATES en lugar de filtrar INELIGIBLE)
          const isEligible = ELIGIBLE_STATES.includes(pkg.status as any);
          
          if (!isEligible) {
            console.log(`⚠️ Package ${pkg.tracking_number} excluded (status: ${pkg.status}). Eligible states: ${ELIGIBLE_STATES.join(', ')}`);
          } else {
            console.log(`✅ Package ${pkg.tracking_number} is eligible (status: ${pkg.status})`);
          }
          
          return isEligible;
        })
        .map(pkg => ({
          id: pkg.id,
          tracking_number: pkg.tracking_number,
          origin: trip.origin,
          destination: trip.destination,
          status: pkg.status,
          description: pkg.description,
          weight: pkg.weight,
          freight: pkg.freight,
          amount_to_collect: pkg.amount_to_collect,
          customers: pkg.customers
        }))
    );

    console.log(`✅ Found ${eligiblePackages.length} dispatch-eligible packages from ${trips.length} trips`);
    console.log('📊 Package statuses found:', trips.flatMap(t => t.packages).map(p => p.status));
    
    return eligiblePackages;
  }, [trips, dispatchedPackages]);
}
