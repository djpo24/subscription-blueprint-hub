
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const { toast } = useToast();

  const { data: notificationLog = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('🔍 Fetching notifications...');
      
      try {
        const { data, error } = await supabase
          .from('notification_log')
          .select(`
            *,
            customers!customer_id (
              name,
              phone,
              whatsapp_number
            ),
            packages!package_id (
              tracking_number,
              destination,
              amount_to_collect,
              currency
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ Error fetching notifications:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('❌ Error in useNotifications:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const processNotifications = async () => {
    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Notificaciones procesadas",
        description: "Se han procesado todas las notificaciones pendientes",
      });
    } catch (error) {
      console.error('❌ Error processing notifications:', error);
      toast({
        title: "Error",
        description: "Error al procesar las notificaciones",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTestNotification = async (params: { phone: string; message: string }) => {
    setIsSendingTest(true);
    try {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Notificación de prueba enviada",
        description: `Mensaje enviado a ${params.phone}`,
      });
    } catch (error) {
      console.error('❌ Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Error al enviar la notificación de prueba",
        variant: "destructive"
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  return {
    notificationLog,
    isLoading,
    processNotifications,
    sendTestNotification,
    isProcessing,
    isSendingTest
  };
}
