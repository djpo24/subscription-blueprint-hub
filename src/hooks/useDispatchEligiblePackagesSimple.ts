
import { useMemo } from 'react';

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

// Estados que pueden ser despachados - INCLUYE "despachado" 
const DISPATCHABLE_STATES = ['recibido', 'procesado', 'despachado', 'pending', 'arrived'];

export function useDispatchEligiblePackagesSimple(trips: Trip[] = []) {
  return useMemo(() => {
    console.log('🚀 [SOLUCIÓN RADICAL] === HOOK SIMPLIFICADO CON DESPACHADO ===');
    
    if (!trips || !Array.isArray(trips)) {
      console.log('❌ [SOLUCIÓN RADICAL] No hay viajes');
      return [];
    }

    console.log('📦 [SOLUCIÓN RADICAL] Procesando viajes:', trips.length);
    
    const eligiblePackages = trips.flatMap(trip => 
      (trip.packages || [])
        .filter(pkg => {
          // LÓGICA SIMPLIFICADA: Solo verificar estado (incluye "despachado")
          const isEligible = DISPATCHABLE_STATES.includes(pkg.status);
          
          console.log(`📋 [SOLUCIÓN RADICAL] Paquete ${pkg.tracking_number}: ${pkg.status} -> ${isEligible ? 'ELEGIBLE' : 'NO ELEGIBLE'}`);
          
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

    console.log('✅ [SOLUCIÓN RADICAL] RESULTADO CON DESPACHADO:', eligiblePackages.length, 'paquetes elegibles');
    
    return eligiblePackages;
  }, [trips]);
}
