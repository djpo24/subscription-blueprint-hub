
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PackageStatus, PACKAGE_STATUS_CONFIG, PackageIndicator } from '@/components/chat/types/PackageStatusTypes';

export function useCustomerPackageStatus(customerPhone: string) {
  return useQuery({
    queryKey: ['customer-package-status', customerPhone],
    queryFn: async (): Promise<PackageIndicator | null> => {
      try {
        // Normalizar el número de teléfono para búsqueda más flexible
        if (!customerPhone || customerPhone.trim() === '') {
          console.log('🔍 [useCustomerPackageStatus] No phone provided');
          return null;
        }

        // Crear múltiples variaciones del número de teléfono para búsqueda más amplia
        const originalPhone = customerPhone.trim();
        const normalizedPhone = originalPhone.replace(/[\s\-\(\)\+]/g, '');
        const withCountryCode = normalizedPhone.startsWith('57') ? normalizedPhone : `57${normalizedPhone}`;
        const withoutCountryCode = normalizedPhone.startsWith('57') ? normalizedPhone.substring(2) : normalizedPhone;
        const withPlus = `+${normalizedPhone}`;
        
        const phoneVariations = [
          originalPhone,
          normalizedPhone,
          withCountryCode,
          withoutCountryCode,
          withPlus,
          `+57${withoutCountryCode}`
        ].filter((phone, index, arr) => arr.indexOf(phone) === index); // Remove duplicates

        console.log('🔍 [useCustomerPackageStatus] Searching for phone variations:', {
          original: originalPhone,
          variations: phoneVariations
        });

        // Buscar el cliente por múltiples variaciones de teléfono
        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp_number')
          .or(phoneVariations.map(phone => 
            `phone.eq.${phone},whatsapp_number.eq.${phone}`
          ).join(','));

        if (customerError) {
          console.error('❌ [useCustomerPackageStatus] Error searching customers:', customerError);
          return null;
        }

        console.log('🔍 [useCustomerPackageStatus] Customer search results:', {
          phone: originalPhone,
          foundCustomers: customers?.length || 0,
          customers: customers?.map(c => ({ id: c.id, name: c.name, phone: c.phone, whatsapp: c.whatsapp_number }))
        });

        if (!customers || customers.length === 0) {
          console.log('🔍 [useCustomerPackageStatus] No customer found for phone:', originalPhone);
          return null;
        }

        // Si encontramos múltiples clientes, usar el primero
        const customer = customers[0];
        console.log('🔍 [useCustomerPackageStatus] Using customer:', customer.name, customer.id);

        // Obtener los paquetes del cliente
        const { data: packages, error: packagesError } = await supabase
          .from('packages')
          .select('id, status, amount_to_collect, delivered_at')
          .eq('customer_id', customer.id);

        if (packagesError) {
          console.error('❌ [useCustomerPackageStatus] Error fetching packages:', packagesError);
          return null;
        }

        if (!packages || packages.length === 0) {
          console.log('🔍 [useCustomerPackageStatus] No packages found for customer:', customer.id);
          return null;
        }

        // Obtener todos los pagos para los paquetes del cliente
        const packageIds = packages.map(pkg => pkg.id);
        const { data: payments, error: paymentsError } = await supabase
          .from('customer_payments')
          .select('package_id, amount')
          .in('package_id', packageIds);

        if (paymentsError) {
          console.error('❌ [useCustomerPackageStatus] Error fetching payments:', paymentsError);
          return null;
        }

        console.log('🔍 [useCustomerPackageStatus] Customer:', customer.name, 'packages:', packages.length, 'payments:', payments?.length || 0);

        // Determinar el estado más crítico basado en la lógica de negocio
        const statuses: PackageStatus[] = [];

        for (const pkg of packages) {
          // Calcular pagos para este paquete específico
          const packagePayments = payments?.filter(p => p.package_id === pkg.id) || [];
          const totalPaid = packagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          const pendingAmount = (pkg.amount_to_collect || 0) - totalPaid;

          console.log('📦 [useCustomerPackageStatus] Package:', pkg.id, {
            status: pkg.status,
            amountToCollect: pkg.amount_to_collect,
            totalPaid,
            pendingAmount,
            deliveredAt: pkg.delivered_at
          });

          if (pkg.status === 'delivered') {
            if (pkg.amount_to_collect > 0 && pendingAmount > 0) {
              // Entregado pero con pago pendiente
              statuses.push('delivered_pending_payment');
            } else {
              // Entregado y pagado completamente (o sin monto a cobrar)
              // Verificar si han pasado más de 2 días desde la entrega
              if (pkg.delivered_at) {
                const deliveredDate = new Date(pkg.delivered_at);
                const now = new Date();
                const daysDifference = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
                
                // Solo mostrar el indicador verde si han pasado menos de 2 días
                if (daysDifference < 2) {
                  statuses.push('delivered');
                }
                // Si han pasado más de 2 días, no agregamos ningún estado (no se mostrará indicador)
              } else {
                // Si no hay fecha de entrega, mostrar como entregado
                statuses.push('delivered');
              }
            }
          } else if (pkg.status === 'en_destino' || pkg.status === 'pending') {
            if (pkg.amount_to_collect > 0) {
              // Pendiente de recogida y tiene monto por cobrar
              statuses.push('pending_pickup_payment');
            } else {
              // Pendiente de entrega sin cobro
              statuses.push('pending_delivery');
            }
          } else if (pkg.status === 'despachado') {
            // Despachado
            statuses.push('dispatched');
          } else if (pkg.status === 'transito' || pkg.status === 'in_transit') {
            // En tránsito
            statuses.push('in_transit');
          } else if (pkg.status === 'recibido' || pkg.status === 'procesado') {
            // Recibido o procesado
            statuses.push('received_processed');
          }
        }

        if (statuses.length === 0) {
          console.log('🔍 [useCustomerPackageStatus] No valid statuses found for customer:', customer.name);
          return null;
        }

        // Encontrar el estado con mayor prioridad (número menor = mayor prioridad)
        const mostCriticalStatus = statuses.reduce((prev, current) => {
          const prevPriority = PACKAGE_STATUS_CONFIG[prev]?.priority ?? 999;
          const currentPriority = PACKAGE_STATUS_CONFIG[current]?.priority ?? 999;
          return currentPriority < prevPriority ? current : prev;
        });

        console.log('📊 [useCustomerPackageStatus] Final status for customer:', customer.name, '→', mostCriticalStatus);
        return PACKAGE_STATUS_CONFIG[mostCriticalStatus];
      } catch (error) {
        console.error('❌ [useCustomerPackageStatus] Error fetching customer package status:', error);
        return null;
      }
    },
    enabled: !!customerPhone && customerPhone.trim() !== '',
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1, // Solo reintentar una vez en caso de error
  });
}
