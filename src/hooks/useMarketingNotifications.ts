
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
  campaign_name: string | null;
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
    console.log('🔄 Fetching marketing notifications...');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('marketing_message_log')
        .select('*')
        .in('status', ['pending', 'prepared', 'failed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      const logs = data || [];
      console.log(`📊 Found ${logs.length} notifications`);
      
      const validStatuses = ['pending', 'prepared', 'sent', 'failed'];
      const typedLogs = logs.filter(log => validStatuses.includes(log.status)) as MarketingNotificationLog[];
      
      const pending = typedLogs.filter(log => log.status === 'pending');
      const prepared = typedLogs.filter(log => log.status === 'prepared');
      const failed = typedLogs.filter(log => log.status === 'failed');
      
      console.log(`📋 Notifications breakdown: ${pending.length} pending, ${prepared.length} prepared, ${failed.length} failed`);
      
      setPendingNotifications(pending);
      setPreparedNotifications(prepared);
      setFailedNotifications(failed);
      
    } catch (error) {
      console.error('❌ Error fetching marketing notifications:', error);
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
      console.log('🔄 Preparando notificaciones de marketing...', campaignData);
      
      const { data, error } = await supabase.functions.invoke('process-marketing-notifications', {
        body: {
          mode: 'prepare',
          ...campaignData
        }
      });

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw error;
      }

      console.log('✅ Preparation result:', data);

      if (data && data.success) {
        toast({
          title: "¡Notificaciones preparadas!",
          description: `Se prepararon ${data.prepared} notificaciones para envío${data.skipped ? ` (${data.skipped} clientes sin teléfono)` : ''}`
        });
        
        // Refresh notifications to show the prepared ones
        await fetchMarketingNotifications();
      } else {
        throw new Error(data?.error || 'Error desconocido al preparar notificaciones');
      }

    } catch (error) {
      console.error('❌ Error preparing marketing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron preparar las notificaciones: " + (error.message || 'Error desconocido'),
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

      if (error) {
        console.error('❌ Error from edge function:', error);
        throw error;
      }

      console.log('✅ Execution result:', data);

      if (data && data.success) {
        toast({
          title: "¡Notificaciones enviadas!",
          description: `Se enviaron ${data.executed} notificaciones exitosamente. ${data.failed} fallaron.`
        });
        
        // Refresh notifications to show updated statuses
        await fetchMarketingNotifications();
      } else {
        throw new Error(data?.error || 'Error desconocido al ejecutar notificaciones');
      }

    } catch (error) {
      console.error('❌ Error executing marketing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron enviar las notificaciones: " + (error.message || 'Error desconocido'),
        variant: "destructive"
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const clearPreparedNotifications = async () => {
    setIsClearing(true);
    
    try {
      console.log('🗑️ Limpiando notificaciones preparadas...');
      
      const { error } = await supabase
        .from('marketing_message_log')
        .delete()
        .eq('status', 'prepared');

      if (error) {
        console.error('❌ Error clearing prepared notifications:', error);
        throw error;
      }

      toast({
        title: "Notificaciones limpiadas",
        description: "Se eliminaron las notificaciones preparadas"
      });

      // Refresh to show updated list
      await fetchMarketingNotifications();
      
    } catch (error) {
      console.error('❌ Error clearing prepared notifications:', error);
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
      console.log('🗑️ Limpiando notificaciones pendientes...');
      
      const { error } = await supabase
        .from('marketing_message_log')
        .delete()
        .eq('status', 'pending');

      if (error) {
        console.error('❌ Error clearing pending notifications:', error);
        throw error;
      }

      toast({
        title: "Notificaciones pendientes limpiadas",
        description: "Se eliminaron las notificaciones pendientes"
      });

      // Refresh to show updated list
      await fetchMarketingNotifications();
      
    } catch (error) {
      console.error('❌ Error clearing pending notifications:', error);
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
    retryFailedNotifications: () => Promise.resolve(), // Not implemented yet
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
