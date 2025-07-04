
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TripNotificationLog {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  personalized_message: string;
  status: 'pending' | 'prepared' | 'sent' | 'failed';
  template_name?: string;
  template_language?: string;
  error_message?: string;
  created_at: string;
  sent_at?: string;
}

export function useTripNotificationDetails(tripNotificationId: string, isOpen: boolean) {
  const [pendingNotifications, setPendingNotifications] = useState<TripNotificationLog[]>([]);
  const [preparedNotifications, setPreparedNotifications] = useState<TripNotificationLog[]>([]);
  const [failedNotifications, setFailedNotifications] = useState<TripNotificationLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingPending, setIsClearingPending] = useState(false);
  
  const { toast } = useToast();

  const fetchNotificationDetails = async () => {
    if (!isOpen || !tripNotificationId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('trip_notification_log')
        .select('*')
        .eq('trip_notification_id', tripNotificationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const logs = data || [];
      setPendingNotifications(logs.filter(log => log.status === 'pending'));
      setPreparedNotifications(logs.filter(log => log.status === 'prepared'));
      setFailedNotifications(logs.filter(log => log.status === 'failed'));
      
    } catch (error) {
      console.error('Error fetching notification details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles de la notificación",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationDetails();
  }, [isOpen, tripNotificationId]);

  const prepareNotifications = async () => {
    setIsPreparing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-trip-notification-details', {
        body: {
          tripNotificationId,
          mode: 'prepare'
        }
      });

      if (error) throw error;

      toast({
        title: "¡Notificaciones preparadas!",
        description: `Se prepararon ${data.prepared} notificaciones para envío`
      });

      await fetchNotificationDetails();
    } catch (error) {
      console.error('Error preparing notifications:', error);
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
      const { data, error } = await supabase.functions.invoke('process-trip-notification-details', {
        body: {
          tripNotificationId,
          mode: 'execute'
        }
      });

      if (error) throw error;

      toast({
        title: "¡Notificaciones enviadas!",
        description: `Se enviaron ${data.executed} notificaciones exitosamente. ${data.failed} fallaron.`
      });

      await fetchNotificationDetails();
    } catch (error) {
      console.error('Error executing notifications:', error);
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
      const { data, error } = await supabase.functions.invoke('process-trip-notification-details', {
        body: {
          tripNotificationId,
          mode: 'retry_failed'
        }
      });

      if (error) throw error;

      toast({
        title: "¡Reintento completado!",
        description: `Se reintentaron ${data.retried} mensajes. ${data.executed} exitosos, ${data.failed} fallaron.`
      });

      await fetchNotificationDetails();
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
        .from('trip_notification_log')
        .delete()
        .eq('trip_notification_id', tripNotificationId)
        .eq('status', 'prepared');

      if (error) throw error;

      toast({
        title: "Notificaciones limpiadas",
        description: "Se eliminaron las notificaciones preparadas"
      });

      await fetchNotificationDetails();
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
        .from('trip_notification_log')
        .delete()
        .eq('trip_notification_id', tripNotificationId)
        .eq('status', 'pending');

      if (error) throw error;

      toast({
        title: "Notificaciones pendientes limpiadas",
        description: "Se eliminaron las notificaciones pendientes"
      });

      await fetchNotificationDetails();
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
    isClearingPending
  };
}
