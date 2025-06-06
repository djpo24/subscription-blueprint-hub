
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PackageInDispatch } from '@/types/dispatch';

export function usePackageByTrackingNumber(trackingNumber: string | null) {
  return useQuery({
    queryKey: ['package-by-tracking', trackingNumber],
    queryFn: async (): Promise<PackageInDispatch | null> => {
      if (!trackingNumber) return null;

      console.log('🔍 Buscando paquete con tracking number:', trackingNumber);
      
      // Buscar el paquete en la base de datos
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (packageError) {
        console.error('❌ Error buscando paquete:', packageError);
        throw new Error(`No se encontró el paquete con tracking number: ${trackingNumber}`);
      }

      if (!packageData) {
        throw new Error(`No se encontró el paquete con tracking number: ${trackingNumber}`);
      }

      console.log('📦 Paquete encontrado:', packageData);

      // Buscar los datos del cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('name, email')
        .eq('id', packageData.customer_id)
        .single();

      if (customerError) {
        console.error('⚠️ Error buscando cliente:', customerError);
      }

      // Crear el objeto PackageInDispatch con los datos reales
      const realPackage: PackageInDispatch = {
        id: packageData.id,
        tracking_number: packageData.tracking_number,
        origin: packageData.origin,
        destination: packageData.destination,
        status: packageData.status,
        description: packageData.description,
        weight: packageData.weight,
        freight: packageData.freight,
        amount_to_collect: packageData.amount_to_collect,
        currency: packageData.currency,
        trip_id: packageData.trip_id,
        customers: customerData ? {
          name: customerData.name,
          email: customerData.email
        } : {
          name: 'Cliente no encontrado',
          email: 'N/A'
        }
      };
      
      console.log('✅ Paquete con datos completos:', realPackage);
      return realPackage;
    },
    enabled: !!trackingNumber,
    retry: false, // No reintentar si no se encuentra el paquete
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
