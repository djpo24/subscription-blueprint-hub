
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

// Estados que SÍ pueden ser despachados - AMPLIADO para incluir más estados
const ELIGIBLE_STATES = [
  'recibido',     // Paquetes que han llegado y están listos para despacho
  'bodega',       // Paquetes en bodega listos para despacho
  'procesado',    // Paquetes que fueron impresos (NO significa despachados)
  'pending',      // Paquetes pendientes también pueden ser despachados
  'arrived',      // Paquetes que han llegado
] as const;

// Estados que NO deben aparecer en el listado de despacho
const INELIGIBLE_STATES = [
  'delivered',    // Ya fue entregado
  'in_transit',   // Ya está en tránsito
  'transito',     // Variante de in_transit
  'en_destino',   // Ya llegó al destino
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
    console.log('🔍 [useDispatchEligiblePackages] === DIAGNÓSTICO COMPLETO ===');
    
    // Add safety check for trips parameter
    if (!trips || !Array.isArray(trips)) {
      console.log('⚠️ [useDispatchEligiblePackages] No trips provided or trips is not an array');
      return [];
    }

    console.log('📊 [useDispatchEligiblePackages] Trips recibidos:', trips.length);
    trips.forEach((trip, index) => {
      console.log(`🚗 [useDispatchEligiblePackages] Trip ${index + 1}:`, {
        id: trip.id,
        origin: trip.origin,
        destination: trip.destination,
        packagesCount: trip.packages?.length || 0
      });
    });

    // Log all package statuses for debugging
    const allPackages = trips.flatMap(trip => trip.packages || []);
    
    console.log('📦 [useDispatchEligiblePackages] === RESUMEN DE PAQUETES ===');
    console.log('📋 [useDispatchEligiblePackages] Total paquetes encontrados:', allPackages.length);
    
    if (allPackages.length === 0) {
      console.log('❌ [useDispatchEligiblePackages] NO HAY PAQUETES EN LOS VIAJES');
      return [];
    }

    // Mostrar cada paquete individualmente
    allPackages.forEach((pkg, index) => {
      console.log(`📦 [useDispatchEligiblePackages] Paquete ${index + 1}:`, {
        tracking_number: pkg.tracking_number,
        status: pkg.status,
        customer: pkg.customers?.name || 'Sin cliente'
      });
    });

    const statusCounts = allPackages.reduce((acc, pkg) => {
      acc[pkg.status || 'undefined'] = (acc[pkg.status || 'undefined'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 [useDispatchEligiblePackages] Distribución de estados:', statusCounts);
    console.log('✅ [useDispatchEligiblePackages] Estados ELEGIBLES:', ELIGIBLE_STATES);
    console.log('❌ [useDispatchEligiblePackages] Estados NO ELEGIBLES:', INELIGIBLE_STATES);

    // Crear un Set con los IDs de paquetes ya despachados
    const dispatchedPackageIds = new Set(
      dispatchedPackages.map(dp => dp.package_id)
    );
    
    console.log('📦 [useDispatchEligiblePackages] Paquetes ya despachados:', dispatchedPackageIds.size);
    if (dispatchedPackageIds.size > 0) {
      console.log('📦 [useDispatchEligiblePackages] IDs despachados:', Array.from(dispatchedPackageIds));
    }
    
    const eligiblePackages = trips.flatMap(trip => 
      (trip.packages || [])
        .filter(pkg => {
          // Verificar si el paquete ya está despachado
          if (dispatchedPackageIds.has(pkg.id)) {
            console.log(`⚠️ [useDispatchEligiblePackages] Paquete ${pkg.tracking_number} EXCLUIDO (ya despachado)`);
            return false;
          }

          // Verificar si el estado es elegible
          const isEligible = ELIGIBLE_STATES.includes(pkg.status as any);
          
          if (!isEligible) {
            console.log(`⚠️ [useDispatchEligiblePackages] Paquete ${pkg.tracking_number} EXCLUIDO (estado: ${pkg.status})`);
          } else {
            console.log(`✅ [useDispatchEligiblePackages] Paquete ${pkg.tracking_number} ELEGIBLE (estado: ${pkg.status})`);
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

    console.log('🎯 [useDispatchEligiblePackages] === RESULTADO FINAL ===');
    console.log(`✅ [useDispatchEligiblePackages] Paquetes ELEGIBLES para despacho: ${eligiblePackages.length}`);
    console.log(`📊 [useDispatchEligiblePackages] De ${allPackages.length} paquetes totales en ${trips.length} viajes`);
    
    if (eligiblePackages.length === 0) {
      console.log('❌ [useDispatchEligiblePackages] === NO HAY PAQUETES ELEGIBLES ===');
      console.log('🔍 [useDispatchEligiblePackages] Posibles causas:');
      console.log('   1. Todos los paquetes ya fueron despachados');
      console.log('   2. Los paquetes están en estados no elegibles');
      console.log('   3. No hay paquetes en los viajes de esta fecha');
    }
    
    return eligiblePackages;
  }, [trips, dispatchedPackages]);
}
