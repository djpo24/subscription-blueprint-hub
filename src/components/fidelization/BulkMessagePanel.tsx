import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFidelizationData } from '@/hooks/useFidelizationData';
import { useBulkFidelizationSettings } from '@/hooks/useBulkFidelizationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Send, Eye, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MessagePreview {
  customerId: string;
  customerName: string;
  customerPhone: string;
  messageType: 'redeemable' | 'motivational';
  messageContent: string;
  pointsAvailable: number;
}

export function BulkMessagePanel() {
  const { data: fidelizationData, isLoading: loadingData, refetch, isRefetching } = useFidelizationData('all');
  const { data: settings, isLoading: loadingSettings } = useBulkFidelizationSettings();
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [totalMessages, setTotalMessages] = useState(0);
  const [sendingStatus, setSendingStatus] = useState<Array<{
    customerId: string;
    customerName: string;
    status: 'pending' | 'sending' | 'sent' | 'failed';
    error?: string;
  }>>([]);

  const handleRefreshCustomers = async () => {
    console.log('🔄 Recargando datos de fidelización...');
    const result = await refetch();
    if (result.data) {
      const withPhone = result.data.filter(c => c.phone?.trim());
      toast.success(`${result.data.length} clientes actualizados (${withPhone.length} con teléfono)`);
    }
  };

  // Generar mensajes automáticamente cuando hay datos
  const messagePreviews = useMemo<MessagePreview[]>(() => {
    console.log('🔍 Evaluando datos para mensajes:', {
      hasFidelizationData: !!fidelizationData,
      fidelizationDataLength: fidelizationData?.length || 0,
      hasSettings: !!settings
    });

    if (!fidelizationData || !settings) {
      console.log('⚠️ Esperando datos o configuración');
      return [];
    }

    console.log('📝 Generando previews de mensajes para', fidelizationData.length, 'clientes');

    const previews = fidelizationData
      .filter(customer => !!customer.phone && customer.phone.trim().length > 0)
      .map(customer => {
        const totalPoints = customer.totalPoints;
        const isRedeemable = totalPoints >= 1000;
        const kilosAvailable = Math.floor(totalPoints / 1000);
        const pointsMissing = Math.max(0, 1000 - totalPoints);

        let messageContent = isRedeemable 
          ? settings.redeemable_template 
          : settings.motivational_template;

        messageContent = messageContent
          .replace(/\{\{nombre_cliente\}\}/g, customer.name)
          .replace(/\{\{puntos_disponibles\}\}/g, totalPoints.toString())
          .replace(/\{\{kilos_disponibles\}\}/g, kilosAvailable.toString())
          .replace(/\{\{puntos_faltantes\}\}/g, pointsMissing.toString());

        return {
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone!,
          messageType: (isRedeemable ? 'redeemable' : 'motivational') as 'redeemable' | 'motivational',
          messageContent,
          pointsAvailable: totalPoints,
        };
      });

    console.log('✅ Mensajes generados:', {
      total: previews.length,
      redeemable: previews.filter(p => p.messageType === 'redeemable').length,
      motivational: previews.filter(p => p.messageType === 'motivational').length
    });

    return previews;
  }, [fidelizationData, settings]);

  const redeemableCount = messagePreviews.filter(m => m.messageType === 'redeemable').length;
  const motivationalCount = messagePreviews.filter(m => m.messageType === 'motivational').length;

  // Monitorear progreso en tiempo real
  useEffect(() => {
    if (!isSending || totalMessages === 0) return;

    const channel = supabase
      .channel('bulk-fidelization-progress')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bulk_fidelization_log',
        },
        (payload) => {
          console.log('📨 Actualización de mensaje:', payload);
          if (payload.new.status === 'sent') {
            setSentCount(prev => prev + 1);
          } else if (payload.new.status === 'failed') {
            setFailedCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSending, totalMessages]);

  // Actualizar progreso
  useEffect(() => {
    if (totalMessages > 0) {
      const progress = ((sentCount + failedCount) / totalMessages) * 100;
      setSendingProgress(progress);
    }
  }, [sentCount, failedCount, totalMessages]);

  const handleSendMessages = async () => {
    if (!messagePreviews.length) {
      toast.error('No hay mensajes para enviar');
      return;
    }

    // Reset counters e inicializar estados
    setSentCount(0);
    setFailedCount(0);
    setTotalMessages(messagePreviews.length);
    setSendingProgress(0);
    setIsSending(true);
    setSendingStatus(messagePreviews.map(m => ({
      customerId: m.customerId,
      customerName: m.customerName,
      status: 'pending' as const,
    })));

    try {
      console.log('🚀 Iniciando envío masivo (IGUAL QUE VIAJES)...');
      
      let successCount = 0;
      let failedCount = 0;

      // Procesar uno por uno, igual que CampaignNotificationsPanel
      for (let i = 0; i < messagePreviews.length; i++) {
        const message = messagePreviews[i];
        
        console.log(`📤 Procesando ${i + 1}/${messagePreviews.length}: ${message.customerName}`);
        
        // Actualizar UI: enviando
        setSendingStatus(prev => prev.map(s => 
          s.customerId === message.customerId 
            ? { ...s, status: 'sending' as const }
            : s
        ));
        
        try {
          // 1. Crear registro en bulk_fidelization_log
          const { data: logData, error: logError } = await supabase
            .from('bulk_fidelization_log')
            .insert({
              customer_id: message.customerId,
              customer_name: message.customerName,
              customer_phone: message.customerPhone,
              message_type: message.messageType,
              message_content: message.messageContent,
              points_available: message.pointsAvailable,
              status: 'pending'
            })
            .select()
            .single();

          if (logError || !logData) {
            console.error(`❌ Error creando log para ${message.customerName}:`, logError);
            const errorMsg = logError?.message || 'Error creando registro';
            
            setSendingStatus(prev => prev.map(s => 
              s.customerId === message.customerId 
                ? { ...s, status: 'failed' as const, error: errorMsg }
                : s
            ));
            
            failedCount++;
            
            await supabase.from('bulk_fidelization_log').insert({
              customer_id: message.customerId,
              customer_name: message.customerName,
              customer_phone: message.customerPhone,
              message_type: message.messageType,
              message_content: message.messageContent,
              points_available: message.pointsAvailable,
              status: 'failed',
              error_message: errorMsg
            });
            
            continue;
          }

          // 2. Preparar templateParameters según tipo de mensaje
          let templateName = '';
          let templateLanguage = 'es_CO';
          let templateParameters = {};

          if (message.messageType === 'redeemable') {
            templateName = settings?.redeemable_template_name || 'canjea';
            templateLanguage = settings?.redeemable_template_language || 'es_CO';
            const kilos = Math.floor(message.pointsAvailable / 1000);
            templateParameters = {
              customerName: message.customerName,
              pointsAvailable: message.pointsAvailable.toString(),
              kilosAvailable: kilos.toString()
            };
          } else {
            templateName = settings?.motivational_template_name || 'pendiente_canje';
            templateLanguage = settings?.motivational_template_language || 'es_CO';
            const puntosFaltantes = Math.max(0, 1000 - message.pointsAvailable);
            templateParameters = {
              customerName: message.customerName,
              pointsAvailable: message.pointsAvailable.toString(),
              pointsMissing: puntosFaltantes.toString()
            };
          }

          // 3. Enviar mensaje usando send-whatsapp-notification (IGUAL QUE VIAJES)
          const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: logData.id,
              phone: message.customerPhone,
              message: message.messageContent,
              useTemplate: true,
              templateName: templateName,
              templateLanguage: templateLanguage,
              templateParameters: templateParameters,
              customerId: message.customerId
            }
          });

          if (whatsappError || (whatsappResponse && !whatsappResponse.success)) {
            const errorDetail = whatsappResponse?.error || whatsappError?.message || 'Error desconocido';
            const errorCode = whatsappResponse?.error_code || 'N/A';
            const fullError = `[${errorCode}] ${errorDetail}`;
            
            console.error(`❌ Error WhatsApp para ${message.customerName}:`, fullError);
            console.error('📋 Debug completo:', whatsappResponse);
            
            setSendingStatus(prev => prev.map(s => 
              s.customerId === message.customerId 
                ? { ...s, status: 'failed' as const, error: fullError }
                : s
            ));
            
            await supabase
              .from('bulk_fidelization_log')
              .update({ 
                status: 'failed',
                error_message: fullError
              })
              .eq('id', logData.id);
            
            failedCount++;
            continue;
          }

          // 4. Actualizar log como enviado exitosamente
          await supabase
            .from('bulk_fidelization_log')
            .update({ 
              status: 'sent',
              whatsapp_message_id: whatsappResponse?.messageId,
              sent_at: new Date().toISOString()
            })
            .eq('id', logData.id);

          setSendingStatus(prev => prev.map(s => 
            s.customerId === message.customerId 
              ? { ...s, status: 'sent' as const }
              : s
          ));

          successCount++;
          console.log(`✅ Enviado: ${message.customerName}`);

        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
          console.error(`❌ Error procesando ${message.customerName}:`, error);
          
          setSendingStatus(prev => prev.map(s => 
            s.customerId === message.customerId 
              ? { ...s, status: 'failed' as const, error: errorMsg }
              : s
          ));
          
          await supabase.from('bulk_fidelization_log').insert({
            customer_id: message.customerId,
            customer_name: message.customerName,
            customer_phone: message.customerPhone,
            message_type: message.messageType,
            message_content: message.messageContent,
            points_available: message.pointsAvailable,
            status: 'failed',
            error_message: errorMsg
          });
          
          failedCount++;
        }

        // Actualizar progreso
        setSentCount(successCount);
        setFailedCount(failedCount);

        // Pequeña pausa entre mensajes
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log('✅ Envío completado:', { successCount, failedCount });

      if (failedCount > 0) {
        toast.warning(`⚠️ Envío completado: ${successCount} exitosos, ${failedCount} fallidos`);
      } else {
        toast.success(`✅ ${successCount} mensajes enviados exitosamente`);
      }

      // Reset after delay
      setTimeout(() => {
        setIsSending(false);
        setShowPreview(false);
        setSendingProgress(0);
        setSentCount(0);
        setFailedCount(0);
        setTotalMessages(0);
        setSendingStatus([]);
      }, 3000);

    } catch (error) {
      console.error('❌ Error en envío masivo:', error);
      toast.error('Error al enviar mensajes');
      setIsSending(false);
    }
  };

  // Loading state
  if (loadingSettings || (loadingData && !fidelizationData)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envío Masivo de Mensajes de Fidelización</CardTitle>
          <CardDescription>Cargando datos...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Vista de preview
  if (showPreview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vista Previa de Mensajes</CardTitle>
          <CardDescription>
            Revisa cómo cada cliente recibirá su mensaje según su puntaje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="default" className="bg-green-600">Canjeable</Badge>
              <span className="text-muted-foreground">{redeemableCount} mensajes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="bg-amber-600">Motivacional</Badge>
              <span className="text-muted-foreground">{motivationalCount} mensajes</span>
            </div>
          </div>

          <ScrollArea className="h-[400px] w-full rounded-md border p-4">
            <div className="space-y-4">
              {messagePreviews.map((preview, index) => {
                const status = sendingStatus.find(s => s.customerId === preview.customerId);
                return (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{preview.customerName}</p>
                        <p className="text-sm text-muted-foreground">{preview.customerPhone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={preview.messageType === 'redeemable' ? 'default' : 'secondary'}
                          className={preview.messageType === 'redeemable' ? 'bg-green-600' : 'bg-amber-600'}
                        >
                          {preview.messageType === 'redeemable' ? '🎁 Canjeable' : '📈 Motivacional'}
                          <span className="ml-2">{preview.pointsAvailable} pts</span>
                        </Badge>
                        {status && (
                          <Badge 
                            variant={
                              status.status === 'sent' ? 'default' : 
                              status.status === 'failed' ? 'destructive' : 
                              status.status === 'sending' ? 'secondary' : 
                              'outline'
                            }
                          >
                            {status.status === 'sent' && '✅ Enviado'}
                            {status.status === 'failed' && '❌ Error'}
                            {status.status === 'sending' && '⏳ Enviando...'}
                            {status.status === 'pending' && '⏸️ Pendiente'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {status?.error && (
                      <div className="text-xs p-2 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded">
                        <strong>Error:</strong> {status.error}
                      </div>
                    )}
                    <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                      {preview.messageContent}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {isSending && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Progreso del envío</span>
                <span>{Math.round(sendingProgress)}%</span>
              </div>
              <Progress value={sendingProgress} className="w-full" />
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="flex flex-col items-center gap-1">
                  <Send className="h-3 w-3 text-blue-600" />
                  <span className="font-semibold">{sentCount + failedCount}/{totalMessages}</span>
                  <span className="text-muted-foreground">Procesados</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span className="font-semibold">{sentCount}</span>
                  <span className="text-muted-foreground">Exitosos</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <XCircle className="h-3 w-3 text-red-600" />
                  <span className="font-semibold">{failedCount}</span>
                  <span className="text-muted-foreground">Fallidos</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowPreview(false)}
              className="flex-1"
              disabled={isSending}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSendMessages} 
              disabled={isSending}
              className="flex-1"
            >
              <Send className="mr-2 h-4 w-4" />
              {isSending ? 'Enviando...' : `Enviar ${messagePreviews.length} Mensajes`}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista principal
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Envío Masivo de Mensajes de Fidelización</CardTitle>
            <CardDescription>
              El sistema separa automáticamente los clientes según sus puntos acumulados
            </CardDescription>
          </div>
          <Button 
            onClick={handleRefreshCustomers} 
            variant="outline"
            size="sm"
            disabled={isRefetching}
          >
            {isRefetching ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="h-3 w-3 mr-2" />
                Actualizar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg space-y-2">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            📊 Separación Automática de Clientes
          </p>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-md">
              <div className="text-xs text-green-700 dark:text-green-300 font-medium">Clientes con ≥1,000 puntos</div>
              <div className="text-xl font-bold text-green-900 dark:text-green-100">{redeemableCount}</div>
              <div className="text-xs text-green-600 dark:text-green-400">🎁 Mensaje: Ya pueden canjear</div>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-md">
              <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">Clientes con &lt;1,000 puntos</div>
              <div className="text-xl font-bold text-amber-900 dark:text-amber-100">{motivationalCount}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">📈 Mensaje: Motivacional</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Total de mensajes a enviar:</strong> {messagePreviews.length} clientes
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            El sistema seleccionará automáticamente la plantilla correcta para cada cliente
          </p>
        </div>

        <Button 
          onClick={() => setShowPreview(true)} 
          className="w-full"
          disabled={!messagePreviews.length}
        >
          <Eye className="mr-2 h-4 w-4" />
          Vista Previa de Mensajes
        </Button>
      </CardContent>
    </Card>
  );
}