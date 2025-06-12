
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SentMessage {
  id: string;
  customer_id: string | null;
  phone: string;
  message: string;
  image_url?: string;
  sent_at: string;
  status: 'pending' | 'sent' | 'failed';
}

export function useSentMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sentMessages = [], isLoading } = useQuery({
    queryKey: ['sent-messages'],
    queryFn: async (): Promise<SentMessage[]> => {
      console.log('Fetching sent messages...');
      
      const { data, error } = await supabase
        .from('sent_messages')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(1000); // Increased limit to 1000
      
      if (error) {
        console.error('Error fetching sent messages:', error);
        throw error;
      }
      
      console.log('Sent messages fetched:', data?.length || 0);
      
      // Asegurar que el status sea del tipo correcto
      return (data || []).map(msg => ({
        ...msg,
        status: (['pending', 'sent', 'failed'].includes(msg.status)) ? msg.status : 'sent'
      })) as SentMessage[];
    },
    refetchInterval: 5000,
  });

  const saveSentMessageMutation = useMutation({
    mutationFn: async ({ 
      customerId, 
      phone, 
      message, 
      imageUrl 
    }: { 
      customerId: string | null;
      phone: string;
      message: string;
      imageUrl?: string;
    }) => {
      console.log('Saving sent message:', { customerId, phone, message, imageUrl });
      
      const { data, error } = await supabase
        .from('sent_messages')
        .insert({
          customer_id: customerId,
          phone: phone,
          message: message,
          image_url: imageUrl,
          status: 'sent'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving sent message:', error);
        throw error;
      }
      
      console.log('Sent message saved successfully:', data);
      return data;
    },
    onSuccess: () => {
      console.log('Invalidating sent messages query...');
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['chat-data'] });
    },
    onError: (error: any) => {
      console.error('Error saving sent message:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar el mensaje enviado",
        variant: "destructive"
      });
    }
  });

  return {
    sentMessages,
    isLoading,
    saveSentMessage: saveSentMessageMutation.mutateAsync,
    isSaving: saveSentMessageMutation.isPending,
  };
}
