
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDateForQuery } from '@/utils/dateUtils';
import type { DispatchRelation } from '@/types/dispatch';

export function useDispatchRelations(date?: Date) {
  return useQuery({
    queryKey: ['dispatch-relations', date ? formatDateForQuery(date) : 'all'],
    queryFn: async (): Promise<DispatchRelation[]> => {
      console.log('🔍 Fecha recibida en useDispatchRelations:', date);
      console.log('🔍 Fecha original (getDate):', date ? date.getDate() : 'undefined');
      console.log('🔍 Fecha original (getMonth):', date ? date.getMonth() + 1 : 'undefined');
      console.log('🔍 Fecha original (getFullYear):', date ? date.getFullYear() : 'undefined');
      
      let query = supabase
        .from('dispatch_relations')
        .select('*')
        .order('created_at', { ascending: false });

      if (date) {
        const formattedDate = formatDateForQuery(date);
        console.log('📅 Fecha formateada para consulta (nueva función):', formattedDate);
        query = query.eq('dispatch_date', formattedDate);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error en consulta de despachos:', error);
        throw error;
      }
      
      console.log('📦 Despachos encontrados:', data);
      console.log('📊 Número de despachos:', data?.length || 0);
      
      if (data && data.length > 0) {
        console.log('🗓️ Fechas de despacho en los datos:', data.map(d => d.dispatch_date));
      }
      
      return data || [];
    }
  });
}

// Re-export the other hooks for convenience
export { useDispatchPackages } from './useDispatchPackages';
export { useCreateDispatch } from './useCreateDispatch';
