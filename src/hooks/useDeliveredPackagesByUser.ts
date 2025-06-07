
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useDeliveredPackagesByUser() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['delivered-packages-by-user', user?.id],
    queryFn: async () => {
      if (!user?.email) {
        throw new Error('Usuario no autenticado');
      }

      console.log('🔍 [useDeliveredPackagesByUser] Buscando paquetes entregados por:', user.email);

      const { data, error } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          origin,
          destination,
          status,
          description,
          weight,
          freight,
          amount_to_collect,
          currency,
          delivered_at,
          delivered_by,
          customers (
            name,
            email,
            phone
          )
        `)
        .eq('status', 'delivered')
        .eq('delivered_by', user.email)
        .order('delivered_at', { ascending: false });

      if (error) {
        console.error('❌ [useDeliveredPackagesByUser] Error:', error);
        throw error;
      }

      console.log('✅ [useDeliveredPackagesByUser] Paquetes encontrados:', data?.length || 0);
      return data || [];
    },
    enabled: !!user?.email,
  });
}
