
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MarketingNotificationLog {
  id: string;
  campaign_id: string | null;
  customer_name: string | null;
  customer_phone: string;
  message_content: string;
  status: 'pending' | 'prepared' | 'sent' | 'failed';
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  whatsapp_message_id: string | null;
}

export function useMarketingNotifications() {
  const [pendingNotifications, setPendingNotifications] = useState<MarketingNotificationLog[]>([]);
  const [preparedNotifications, setPreparedNotifications] = useState<MarketingNotificationLog[]>([]);
  const [failedNotifications, setFailedNotifications] = useState<MarketingNotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingPending, setIsClearingPending] = useState(false);
  
  const { toast } = useToast();

  const fetchMarketingNotifications = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_message_log')
        .select('*')
        .in('status', ['pending', 'prepared', 'failed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const logs = data || [];
      
      const validStatuses = ['pending', 'prepared', 'sent', 'failed'];
      const typedLogs = logs.filter(log => validStatuses.includes(log.status)) as MarketingNotificationLog[];
      
      setPendingNotifications(typedLogs.filter(log => log.status === 'pending'));
      setPreparedNotifications(typedLogs.filter(log => log.status === 'prepared'));
      setFailedNotifications(typedLogs.filter(log => log.status === 'failed'));
      
    } catch (error) {
      console.error('Error fetching marketing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las notificaciones de marketing",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketingNotifications();
  }, []);

  const prepareNotifications = async (campaignData: {
    campaign_name: string;
    trip_start_date: string;
    trip_end_date: string;
    message_template: string;
  }) => {
    setIsPreparing(true);
    try {
      console.log('🔄 Preparando notificaciones de marketing...');
      
      const { data, error } = await supabase.functions.invoke('process-marketing-notifications', {
        body: {
          mode: 'prepare',
          ...campaignData
        }
      });

      if (error) throw error;

      toast({
        title: "¡Notificaciones preparadas!",
        description: `Se prepararon ${data.prepared} notificaciones para envío`
      });

      await fetchMarketingNotifications();
    } catch (error) {
      console.error('Error preparing marketing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron preparar las notificaciones: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsPreparing(false);
    }
  };

  const executeNotifications = async () => {
    setIsExecuting(true);
    try {
      console.log('🚀 Ejecutando notificaciones de marketing...');
      
      const { data, error } = await supabase.functions.invoke('process-marketing-notifications', {
        body: {
          mode: 'execute'
        }
      });

      if (error) throw error;

      toast({
        title: "¡Notificaciones enviadas!",
        description: `Se enviaron ${data.executed} notificaciones exitosamente. ${data.failed} fallaron.`
      });

      await fetchMarketingNotifications();
    } catch (error) {
      console.error('Error executing marketing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron enviar las notificaciones: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const retryFailedNotifications = async () => {
    setIsRetrying(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-marketing-notifications', {
        body: {
          mode: 'retry_failed'
        }
      });

      if (error) throw error;

      toast({
        title: "¡Reintento completado!",
        description: `Se reintentaron ${data.retried} mensajes. ${data.executed} exitosos, ${data.failed} fallaron.`
      });

      await fetchMarketingNotifications();
    } catch (error) {
      console.error('Error retrying failed notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron reintentar las notificaciones: " + error.message,
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const clearPreparedNotifications = async () => {
    setIsClearing(true);
    try {
      const { error } = await supabase
        .from('marketing_message_log')
        .delete()
        .eq('status', 'prepared');

      if (error) throw error;

      toast({
        title: "Notificaciones limpiadas",
        description: "Se eliminaron las notificaciones preparadas"
      });

      await fetchMarketingNotifications();
    } catch (error) {
      console.error('Error clearing prepared notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron limpiar las notificaciones",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  const clearPendingNotifications = async () => {
    setIsClearingPending(true);
    try {
      const { error } = await supabase
        .from('marketing_message_log')
        .delete()
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Notificaciones pendientes limpiadas",
        description: "Se eliminaron las notificaciones pendientes"
      });

      await fetchMarketingNotifications();
    } catch (error) {
      console.error('Error clearing pending notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron limpiar las notificaciones pendientes",
        variant: "destructive"
      });
    } finally {
      setIsClearingPending(false);
    }
  };

  return {
    pendingNotifications,
    preparedNotifications,
    failedNotifications,
    isLoading,
    prepareNotifications,
    executeNotifications,
    retryFailedNotifications,
    clearPreparedNotifications,
    clearPendingNotifications,
    isPreparing,
    isExecuting,
    isRetrying,
    isClearing,
    isClearingPending,
    refetch: fetchMarketingNotifications
  };
}
