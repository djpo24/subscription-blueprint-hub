
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

// Estados que SÍ pueden ser despachados - CORREGIDO para incluir los estados correctos
const ELIGIBLE_STATES = [
  'recibido',     // Paquetes que han llegado y están listos para despacho
  'procesado',    // Paquetes con etiqueta impresa - SÍ pueden ser despachados
  'bodega',       // Paquetes en bodega listos para despacho
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
    console.log('🔍 [useDispatchEligiblePackages] === ANÁLISIS FINAL CORREGIDO ===');
    
    // Add safety check for trips parameter
    if (!trips || !Array.isArray(trips)) {
      console.log('⚠️ [useDispatchEligiblePackages] No trips provided or trips is not an array');
      return [];
    }

    console.log('📊 [useDispatchEligiblePackages] Trips recibidos:', trips.length);
    
    // Log all package statuses for debugging
    const allPackages = trips.flatMap(trip => trip.packages || []);
    
    console.log('📦 [useDispatchEligiblePackages] === ANÁLISIS DE ESTADOS FINAL ===');
    console.log('📋 [useDispatchEligiblePackages] Total paquetes encontrados:', allPackages.length);
    
    if (allPackages.length === 0) {
      console.log('❌ [useDispatchEligiblePackages] NO HAY PAQUETES EN LOS VIAJES');
      return [];
    }

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
    
    const eligiblePackages = trips.flatMap(trip => 
      (trip.packages || [])
        .filter(pkg => {
          // Verificar si el paquete ya está despachado
          if (dispatchedPackageIds.has(pkg.id)) {
            console.log(`⚠️ [useDispatchEligiblePackages] Paquete ${pkg.tracking_number} EXCLUIDO (ya despachado)`);
            return false;
          }

          // Verificar si el estado es elegible - INCLUYE "recibido" y "procesado"
          const isEligible = ELIGIBLE_STATES.includes(pkg.status as any);
          
          if (!isEligible) {
            console.log(`⚠️ [useDispatchEligiblePackages] Paquete ${pkg.tracking_number} EXCLUIDO por estado: ${pkg.status}`);
          } else {
            console.log(`✅ [useDispatchEligiblePackages] Paquete ${pkg.tracking_number} ELEGIBLE con estado: ${pkg.status}`);
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
      console.log('🔍 [useDispatchEligiblePackages] Posibles razones:');
      console.log('   1. Los paquetes ya están despachados');
      console.log('   2. Los paquetes no tienen estados "recibido" o "procesado"');
      console.log('   3. No hay paquetes en los viajes de esta fecha');
    } else {
      console.log(`🎉 [useDispatchEligiblePackages] ENCONTRADOS ${eligiblePackages.length} paquetes elegibles!`);
      eligiblePackages.forEach(pkg => {
        console.log(`   ✓ ${pkg.tracking_number} (${pkg.status})`);
      });
    }
    
    return eligiblePackages;
  }, [trips, dispatchedPackages]);
}
