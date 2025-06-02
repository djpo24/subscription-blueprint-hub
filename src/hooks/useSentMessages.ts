
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
      const { data, error } = await supabase
        .from('sent_messages')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(500);
      
      if (error) {
        console.error('Error fetching sent messages:', error);
        throw error;
      }
      
      return data || [];
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
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
    saveSentMessage: saveSentMessageMutation.mutate,
    isSaving: saveSentMessageMutation.isPending,
  };
}
