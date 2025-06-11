
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

// Estados que pueden ser despachados - INCLUYE "despachado" para re-despachos
const DISPATCHABLE_STATES = ['recibido', 'procesado', 'bodega', 'pending', 'arrived'];
// Nota: "despachado" se excluye para evitar re-despachos accidentales a menos que sea necesario

export function useDispatchEligiblePackagesSimple(trips: Trip[] = []) {
  return useMemo(() => {
    console.log('🔍 [ESTADO DESPACHADO] === HOOK ELEGIBILIDAD DE PAQUETES ===');
    
    if (!trips || !Array.isArray(trips)) {
      console.log('❌ [ESTADO DESPACHADO] No hay viajes');
      return [];
    }

    console.log('📦 [ESTADO DESPACHADO] Procesando viajes:', trips.length);
    
    const eligiblePackages = trips.flatMap(trip => 
      (trip.packages || [])
        .filter(pkg => {
          const isEligible = DISPATCHABLE_STATES.includes(pkg.status);
          
          console.log(`📋 [ESTADO DESPACHADO] Paquete ${pkg.tracking_number}: ${pkg.status} -> ${isEligible ? 'ELEGIBLE' : 'NO ELEGIBLE'}`);
          
          // Mostrar advertencia si el paquete ya está despachado
          if (pkg.status === 'despachado') {
            console.log(`⚠️ [ESTADO DESPACHADO] Paquete ${pkg.tracking_number} ya está DESPACHADO`);
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

    console.log('✅ [ESTADO DESPACHADO] RESULTADO:', eligiblePackages.length, 'paquetes elegibles para despacho');
    
    return eligiblePackages;
  }, [trips]);
}
