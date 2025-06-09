
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PackageInDispatch } from '@/types/dispatch';

export function usePackageByTrackingNumber(trackingNumber: string | null) {
  return useQuery({
    queryKey: ['package-by-tracking', trackingNumber],
    queryFn: async (): Promise<PackageInDispatch | null> => {
      if (!trackingNumber) return null;

      console.log('🔍 [usePackageByTrackingNumber] Buscando paquete con tracking number:', trackingNumber);
      
      // Buscar el paquete en la base de datos
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();

      if (packageError) {
        console.error('❌ [usePackageByTrackingNumber] Error buscando paquete:', packageError);
        throw new Error(`No se encontró el paquete con tracking number: ${trackingNumber}`);
      }

      if (!packageData) {
        throw new Error(`No se encontró el paquete con tracking number: ${trackingNumber}`);
      }

      console.log('📦 [usePackageByTrackingNumber] Paquete encontrado:', packageData);

      // Buscar los datos del cliente
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('name, email, phone')
        .eq('id', packageData.customer_id)
        .single();

      if (customerError) {
        console.error('⚠️ [usePackageByTrackingNumber] Error buscando cliente:', customerError);
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
        delivered_at: packageData.delivered_at,
        delivered_by: packageData.delivered_by,
        customers: customerData ? {
          name: customerData.name,
          email: customerData.email,
          phone: customerData.phone
        } : {
          name: 'Cliente no encontrado',
          email: 'N/A',
          phone: 'N/A'
        }
      };
      
      console.log('✅ [usePackageByTrackingNumber] Paquete con datos completos:', realPackage);
      return realPackage;
    },
    enabled: !!trackingNumber,
    retry: false, // No reintentar si no se encuentra el paquete
    staleTime: 0, // Always refetch when trackingNumber changes
    gcTime: 0, // Don't cache results - always fresh data for new scans
  });
}
