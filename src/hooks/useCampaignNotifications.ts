
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CampaignNotification {
  id: string;
  campaign_name: string;
  outbound_trip_id?: string | null;
  return_trip_id?: string | null;
  deadline_date?: string | null;
  message_template: string;
  template_name: string;
  template_language: string;
  status: 'draft' | 'sent';
  total_customers_sent?: number;
  success_count?: number;
  failed_count?: number;
  created_at: string;
  sent_at?: string | null;
}

export function useCampaignNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['campaign-notifications'],
    queryFn: async (): Promise<CampaignNotification[]> => {
      const { data, error } = await supabase
        .from('trip_notifications')
        .select('*')
        .eq('template_name', 'proximos_viajes')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaign notifications:', error);
        throw error;
      }

      // Map the database response to match our interface
      return (data || []).map(item => ({
        id: item.id,
        campaign_name: item.campaign_name || `Campaña ${new Date(item.created_at).toLocaleDateString()}`,
        outbound_trip_id: item.outbound_trip_id,
        return_trip_id: item.return_trip_id,
        deadline_date: item.deadline_date,
        message_template: item.message_template,
        template_name: item.template_name,
        template_language: item.template_language,
        status: item.status,
        total_customers_sent: item.total_customers_sent,
        success_count: item.success_count,
        failed_count: item.failed_count,
        created_at: item.created_at,
        sent_at: item.sent_at
      }));
    }
  });

  const createNotification = useMutation({
    mutationFn: async (params: {
      campaign_name: string;
      outbound_trip_id?: string;
      return_trip_id?: string;
      deadline_date?: string;
    }) => {
      const { data, error } = await supabase
        .from('trip_notifications')
        .insert({
          campaign_name: params.campaign_name,
          outbound_trip_id: params.outbound_trip_id,
          return_trip_id: params.return_trip_id,
          deadline_date: params.deadline_date,
          message_template: `¡Hola {{nombre_cliente}}! 👋

🛫 **IMPORTANTE: Próximo viaje programado**

Te informamos que tenemos un viaje programado próximamente:

📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}
📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}

⏰ **FECHA LÍMITE para entrega de encomiendas:**
🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**

📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.

📞 Para coordinar la entrega o resolver dudas, contáctanos.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`,
          template_name: 'proximos_viajes',
          template_language: 'es_CO',
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Campaña creada",
        description: "La campaña ha sido creada exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña: " + error.message,
        variant: "destructive"
      });
    }
  });

  const sendNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { data, error } = await supabase.functions.invoke('send-trip-notifications', {
        body: { tripNotificationId: notificationId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Campaña enviada",
        description: `Se enviaron ${data.successCount} mensajes exitosamente`
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al enviar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    notifications,
    isLoading,
    createNotification: createNotification.mutate,
    isCreating: createNotification.isPending,
    sendNotification: sendNotification.mutate,
    isSending: sendNotification.isPending
  };
}
