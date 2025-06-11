
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_packages: number;
  total_weight: number;
  total_freight: number;
  total_amount_to_collect: number;
  pending_count: number;
  delivered_count: number;
  // Agregar información de monedas
  amounts_by_currency: Record<string, number>;
  primary_currency: string | null;
}

export function useDispatchRelations(selectedDate?: Date) {
  return useQuery({
    queryKey: ['dispatch-relations', selectedDate?.toISOString()],
    queryFn: async (): Promise<DispatchRelation[]> => {
      console.log('🔍 Fetching dispatch relations...');
      
      try {
        let query = supabase
          .from('dispatch_relations')
          .select('*')
          .order('dispatch_date', { ascending: false });

        if (selectedDate) {
          const dateString = selectedDate.toISOString().split('T')[0];
          query = query.eq('dispatch_date', dateString);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching dispatch relations:', error);
          throw error;
        }

        console.log('✅ Raw dispatch relations data:', data);

        // Para cada despacho, calcular los totales reales desde dispatch_packages
        const dispatchesWithTotals = await Promise.all(
          (data || []).map(async (dispatch) => {
            console.log(`🔍 Processing dispatch ${dispatch.id} with DB status: ${dispatch.status}`);
            
            // Obtener los paquetes del despacho con información completa incluyendo moneda
            const { data: dispatchPackages, error: packagesError } = await supabase
              .from('dispatch_packages')
              .select(`
                *,
                packages!package_id (
                  id,
                  weight,
                  freight,
                  amount_to_collect,
                  currency,
                  status
                )
              `)
              .eq('dispatch_id', dispatch.id);

            if (packagesError) {
              console.error('❌ Error fetching packages for dispatch:', dispatch.id, packagesError);
              return {
                ...dispatch,
                status: dispatch.status || 'pending', // Usar el estado de la DB
                total_packages: 0,
                total_weight: 0,
                total_freight: 0,
                total_amount_to_collect: 0,
                pending_count: 0,
                delivered_count: 0,
                amounts_by_currency: {},
                primary_currency: null,
              };
            }

            const packages = (dispatchPackages || [])
              .map(dp => dp.packages)
              .filter(Boolean);

            console.log(`📦 Packages for dispatch ${dispatch.id}:`, packages);

            // Calcular totales y agrupar por moneda
            const amountsByCurrency: Record<string, number> = {};
            let primaryCurrency: string | null = null;
            
            const totals = packages.reduce(
              (acc, pkg) => {
                // Agrupar montos por moneda
                if (pkg.amount_to_collect && pkg.amount_to_collect > 0) {
                  const currency = pkg.currency || 'COP'; // Usar COP como fallback
                  amountsByCurrency[currency] = (amountsByCurrency[currency] || 0) + pkg.amount_to_collect;
                  
                  // Establecer la moneda principal (la primera que encontremos con monto)
                  if (!primaryCurrency) {
                    primaryCurrency = currency;
                  }
                }

                return {
                  total_packages: acc.total_packages + 1,
                  total_weight: acc.total_weight + (pkg.weight || 0),
                  total_freight: acc.total_freight + (pkg.freight || 0),
                  total_amount_to_collect: acc.total_amount_to_collect + (pkg.amount_to_collect || 0),
                  pending_count: acc.pending_count + (pkg.status !== 'delivered' ? 1 : 0),
                  delivered_count: acc.delivered_count + (pkg.status === 'delivered' ? 1 : 0),
                };
              },
              {
                total_packages: 0,
                total_weight: 0,
                total_freight: 0,
                total_amount_to_collect: 0,
                pending_count: 0,
                delivered_count: 0,
              }
            );

            console.log(`📊 Calculated totals for dispatch ${dispatch.id}:`, totals);
            console.log(`💰 Amounts by currency for dispatch ${dispatch.id}:`, amountsByCurrency);

            // IMPORTANTE: Usar el estado de la base de datos directamente, no calcularlo
            // Solo calcular el estado si no existe en la DB o es null
            let finalStatus = dispatch.status;
            
            if (!finalStatus || finalStatus === 'pending') {
              // Solo recalcular si el estado está vacío o es pending
              if (totals.delivered_count === totals.total_packages && totals.total_packages > 0) {
                finalStatus = 'completed';
              } else if (totals.delivered_count > 0) {
                finalStatus = 'in_progress';
              } else {
                finalStatus = 'pending';
              }
            }

            console.log(`✅ Final status for dispatch ${dispatch.id}: ${finalStatus} (DB: ${dispatch.status})`);

            return {
              ...dispatch,
              status: finalStatus,
              ...totals,
              amounts_by_currency: amountsByCurrency,
              primary_currency: primaryCurrency,
              created_at: dispatch.created_at || new Date().toISOString(),
              updated_at: dispatch.updated_at || new Date().toISOString()
            };
          })
        );

        console.log('✅ Dispatches with calculated totals and preserved DB status:', dispatchesWithTotals);
        return dispatchesWithTotals;
      } catch (error) {
        console.error('❌ Error in useDispatchRelations:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });
}

// Export the useDispatchPackages function
export { useDispatchPackages } from './useDispatchPackages';
