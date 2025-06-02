
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadMessages() {
  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async (): Promise<number> => {
      // Por ahora, vamos a considerar como "no leídos" todos los mensajes recibidos en las últimas 24 horas
      // En el futuro se puede implementar un sistema más sofisticado de marcado de lectura
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
      
      const { data, error } = await supabase
        .from('incoming_messages')
        .select('id')
        .gte('timestamp', twentyFourHoursAgo.toISOString())
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching unread messages:', error);
        return 0;
      }
      
      return data?.length || 0;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  return {
    unreadCount,
    refetch
  };
}
