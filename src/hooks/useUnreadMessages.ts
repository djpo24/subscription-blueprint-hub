
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useUnreadMessages() {
  const { data: unreadCount = 0, refetch } = useQuery({
    queryKey: ['unread-messages'],
    queryFn: async (): Promise<number> => {
      try {
        // Obtener la última vez que el usuario visitó la pestaña de chat
        const lastVisited = localStorage.getItem('chat-last-visited');
        const lastVisitedTime = lastVisited ? new Date(lastVisited) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        console.log('Checking unread messages since:', lastVisitedTime.toISOString());
        
        // Contar mensajes recibidos desde la última visita
        const { data, error } = await supabase
          .from('incoming_messages')
          .select('id, from_phone, timestamp')
          .gt('timestamp', lastVisitedTime.toISOString())
          .order('timestamp', { ascending: false });
        
        if (error) {
          console.error('Error fetching unread messages:', error);
          return 0;
        }
        
        // Agrupar por teléfono para contar conversaciones únicas con mensajes nuevos
        const uniquePhones = new Set(data?.map(msg => msg.from_phone) || []);
        const unreadConversations = uniquePhones.size;
        
        console.log(`Found ${data?.length || 0} new messages from ${unreadConversations} conversations`);
        
        return unreadConversations;
      } catch (error) {
        console.error('Error in useUnreadMessages:', error);
        return 0;
      }
    },
    refetchInterval: 5000, // Refrescar cada 5 segundos para notificaciones más rápidas
  });

  return {
    unreadCount,
    refetch
  };
}
