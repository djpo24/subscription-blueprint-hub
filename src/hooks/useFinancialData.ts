
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
          customers!inner(name, phone, email)
        `)
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (packagesError) throw packagesError;

      // Obtener pagos del mes
      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('amount')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      if (paymentsError) throw paymentsError;

      // Calcular resumen financiero
      const totalRevenue = (payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const totalFreight = (packages || []).reduce((sum, pkg) => sum + (pkg.freight || 0), 0);
      const deliveredPackages = (packages || []).filter(pkg => pkg.status === 'delivered').length;
      const totalPackages = (packages || []).length;

      // Obtener clientes con pagos pendientes (método simplificado)
      const { data: pendingPackages, error: pendingError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          amount_to_collect,
          customer_id,
          customers!inner(name, phone, email)
        `)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0);

      if (pendingError) throw pendingError;

      // Agrupar por cliente
      const customersPendingMap = new Map<string, CustomerPending>();
      
      (pendingPackages || []).forEach(pkg => {
        const customerId = pkg.customer_id;
        const existing = customersPendingMap.get(customerId);
        
        if (existing) {
          existing.total_pending += pkg.amount_to_collect || 0;
          existing.package_count += 1;
          existing.tracking_numbers.push(pkg.tracking_number);
        } else {
          customersPendingMap.set(customerId, {
            customer_id: customerId,
            customer_name: pkg.customers?.name || 'N/A',
            phone: pkg.customers?.phone || 'N/A',
            email: pkg.customers?.email || 'N/A',
            total_pending: pkg.amount_to_collect || 0,
            package_count: 1,
            tracking_numbers: [pkg.tracking_number]
          });
        }
      });

      const customersPending = Array.from(customersPendingMap.values())
        .sort((a, b) => b.total_pending - a.total_pending);

      const pendingCollections = customersPending.reduce((sum, customer) => sum + customer.total_pending, 0);

      const summary: FinancialSummary = {
        totalRevenue,
        totalExpenses: 0, // Por ahora no hay gastos registrados
        netProfit: totalRevenue,
        totalFreight,
        pendingCollections,
        deliveredPackages,
        totalPackages
      };

      return {
        summary,
        customersPending
      };
    },
    refetchInterval: 30000,
    staleTime: 10000
  });
}
