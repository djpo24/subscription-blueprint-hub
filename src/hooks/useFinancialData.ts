
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalFreight: number;
  pendingCollections: number;
  deliveredPackages: number;
  totalPackages: number;
}

interface CustomerPending {
  customer_id: string;
  customer_name: string;
  phone: string;
  email: string;
  total_pending: number;
  package_count: number;
  tracking_numbers: string[];
}

export function useFinancialData() {
  return useQuery({
    queryKey: ['financial-data', format(new Date(), 'yyyy-MM')],
    queryFn: async (): Promise<{
      summary: FinancialSummary;
      customersPending: CustomerPending[];
    }> => {
      console.log('💰 Fetching financial data...');
      
      try {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);

        // Obtener datos de paquetes del mes actual
        const { data: packages, error: packagesError } = await supabase
          .from('packages')
          .select(`
            id,
            tracking_number,
            freight,
            amount_to_collect,
            status,
            delivered_at,
            customer_id,
            customers(name, phone, email)
          `)
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (packagesError) {
          console.error('❌ Error fetching packages:', packagesError);
          throw new Error(`Error al cargar paquetes: ${packagesError.message}`);
        }

        // Obtener pagos del mes
        const { data: payments, error: paymentsError } = await supabase
          .from('customer_payments')
          .select('amount')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        if (paymentsError) {
          console.error('❌ Error fetching payments:', paymentsError);
          // No lanzar error aquí, solo registrar y continuar con payments = []
          console.warn('⚠️ Could not fetch payments, continuing without payment data');
        }

        // Calcular resumen financiero
        const totalRevenue = (payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const totalFreight = (packages || []).reduce((sum, pkg) => sum + (pkg.freight || 0), 0);
        const deliveredPackages = (packages || []).filter(pkg => pkg.status === 'delivered').length;
        const totalPackages = (packages || []).length;

        // Obtener clientes con pagos pendientes usando la función RPC
        let customersPending: CustomerPending[] = [];
        let pendingCollections = 0;

        try {
          const { data: pendingData, error: pendingError } = await supabase
            .rpc('get_collection_packages', {
              p_limit: 100,
              p_offset: 0
            });

          if (pendingError) {
            console.error('❌ Error fetching pending collections:', pendingError);
            // No lanzar error, solo registrar y continuar
            console.warn('⚠️ Could not fetch pending collections, continuing without this data');
          } else if (Array.isArray(pendingData)) {
            // Calcular total pendiente
            pendingCollections = pendingData.reduce((sum, item) => sum + (item.pending_amount || 0), 0);
            
            // Agrupar por cliente (simplificado)
            const customerMap = new Map<string, CustomerPending>();
            
            pendingData.forEach(item => {
              const customerId = item.package_id; // Using package_id as unique identifier
              const existing = customerMap.get(customerId);
              
              if (existing) {
                existing.total_pending += item.pending_amount || 0;
                existing.package_count += 1;
                existing.tracking_numbers.push(item.tracking_number);
              } else {
                customerMap.set(customerId, {
                  customer_id: customerId,
                  customer_name: item.customer_name || 'N/A',
                  phone: item.customer_phone || 'N/A',
                  email: 'N/A', // No disponible en la función RPC
                  total_pending: item.pending_amount || 0,
                  package_count: 1,
                  tracking_numbers: [item.tracking_number]
                });
              }
            });

            customersPending = Array.from(customerMap.values())
              .sort((a, b) => b.total_pending - a.total_pending);
          }
        } catch (pendingError) {
          console.error('❌ Error in pending collections processing:', pendingError);
          // Continuar sin datos de colecciones pendientes
        }

        const summary: FinancialSummary = {
          totalRevenue,
          totalExpenses: 0, // Por ahora no hay gastos registrados
          netProfit: totalRevenue,
          totalFreight,
          pendingCollections,
          deliveredPackages,
          totalPackages
        };

        console.log('✅ Financial data loaded successfully');

        return {
          summary,
          customersPending
        };
      } catch (error) {
        console.error('❌ Error in useFinancialData:', error);
        throw error;
      }
    },
    refetchInterval: 30000,
    staleTime: 10000,
    retry: 3,
    retryDelay: 1000,
  });
}
