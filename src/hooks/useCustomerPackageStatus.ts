
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PackageStatus, PACKAGE_STATUS_CONFIG, PackageIndicator } from '@/components/chat/types/PackageStatusTypes';

export function useCustomerPackageStatus(customerPhone: string) {
  return useQuery({
    queryKey: ['customer-package-status', customerPhone],
    queryFn: async (): Promise<PackageIndicator | null> => {
      try {
        // Primero buscar el cliente por teléfono
        const { data: customer } = await supabase
          .from('customers')
          .select('id')
          .eq('phone', customerPhone)
          .maybeSingle();

        if (!customer) {
          return null;
        }

        // Obtener los paquetes del cliente
        const { data: packages } = await supabase
          .from('packages')
          .select('id, status, amount_to_collect, delivered_at')
          .eq('customer_id', customer.id);

        if (!packages || packages.length === 0) {
          return null;
        }

        // Determinar el estado más crítico basado en la lógica de negocio
        const statuses: PackageStatus[] = [];

        for (const pkg of packages) {
          if (pkg.status === 'delivered' && pkg.amount_to_collect > 0) {
            // Entregado pero con pago pendiente
            statuses.push('delivered_pending_payment');
          } else if (pkg.status === 'delivered' && pkg.amount_to_collect === 0) {
            // Entregado y pagado completamente
            statuses.push('delivered');
          } else if ((pkg.status === 'en_destino' || pkg.status === 'pending') && pkg.amount_to_collect > 0) {
            // Pendiente de recogida y tiene monto por cobrar
            statuses.push('pending_pickup_payment');
          } else if (pkg.status === 'en_destino' || pkg.status === 'pending') {
            // Pendiente de entrega
            statuses.push('pending_delivery');
          } else if (pkg.status === 'transito' || pkg.status === 'in_transit' || pkg.status === 'despachado') {
            // En tránsito
            statuses.push('in_transit');
          }
        }

        if (statuses.length === 0) {
          return null;
        }

        // Encontrar el estado con mayor prioridad (número menor = mayor prioridad)
        const mostCriticalStatus = statuses.reduce((prev, current) => {
          const prevPriority = PACKAGE_STATUS_CONFIG[prev]?.priority ?? 999;
          const currentPriority = PACKAGE_STATUS_CONFIG[current]?.priority ?? 999;
          return currentPriority < prevPriority ? current : prev;
        });

        return PACKAGE_STATUS_CONFIG[mostCriticalStatus];
      } catch (error) {
        console.error('Error fetching customer package status:', error);
        return null;
      }
    },
    enabled: !!customerPhone,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
