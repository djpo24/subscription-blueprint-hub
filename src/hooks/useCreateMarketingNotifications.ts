
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateMarketingNotificationsParams {
  campaign_name: string;
  trip_start_date: string;
  trip_end_date: string;
  message_template: string;
}

export function useCreateMarketingNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (params: CreateMarketingNotificationsParams) => {
      console.log('🔄 Creando notificaciones de marketing para clientes...', params);
      
      const { data, error } = await supabase.functions.invoke('process-marketing-notifications', {
        body: {
          mode: 'create',
          campaign_name: params.campaign_name,
          trip_start_date: params.trip_start_date,
          trip_end_date: params.trip_end_date,
          message_template: params.message_template
        }
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw error;
      }

      console.log('✅ Creation result:', data);

      if (data && data.success) {
        toast({
          title: "¡Clientes cargados!",
          description: data.message || `Se cargaron ${data.created} clientes para la campaña de marketing`
        });
        
        // Refresh notifications to show the pending ones
        queryClient.invalidateQueries({ queryKey: ['marketing-notifications'] });
      } else {
        throw new Error(data?.error || 'Error desconocido al cargar clientes');
      }

      return data;
    },
    onError: (error: any) => {
      console.error('❌ Error creating marketing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes: " + (error.message || 'Error desconocido'),
        variant: "destructive"
      });
    }
  });

  return {
    createNotifications: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
