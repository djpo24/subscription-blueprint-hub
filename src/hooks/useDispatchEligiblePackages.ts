
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

// Estados que NO deben aparecer en el listado de despacho
const INELIGIBLE_STATES = [
  'procesado',    // Ya fue procesado en un despacho anterior
  'delivered',    // Ya fue entregado
  'in_transit',   // Ya está en tránsito
] as const;

export function useDispatchEligiblePackages(trips: Trip[]) {
  return useMemo(() => {
    console.log('🔍 Filtering dispatch-eligible packages...');
    
    const eligiblePackages = trips.flatMap(trip => 
      trip.packages
        .filter(pkg => {
          const isEligible = !INELIGIBLE_STATES.includes(pkg.status as any);
          
          if (!isEligible) {
            console.log(`⚠️ Package ${pkg.tracking_number} excluded (status: ${pkg.status})`);
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

    console.log(`✅ Found ${eligiblePackages.length} dispatch-eligible packages`);
    
    return eligiblePackages;
  }, [trips]);
}
