import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFidelizationData } from '@/hooks/useFidelizationData';
import { useBulkFidelizationSettings } from '@/hooks/useBulkFidelizationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, Eye } from 'lucide-react';
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
  const { data: fidelizationData, isLoading: loadingData } = useFidelizationData('all');
  const { data: settings, isLoading: loadingSettings } = useBulkFidelizationSettings();
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const messagePreviews = useMemo<MessagePreview[]>(() => {
    if (!fidelizationData || !settings) return [];

    return fidelizationData.map(customer => {
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
        customerPhone: customer.phone || '',
        messageType: isRedeemable ? 'redeemable' : 'motivational',
        messageContent,
        pointsAvailable: totalPoints,
      };
    });
  }, [fidelizationData, settings]);

  const redeemableCount = messagePreviews.filter(m => m.messageType === 'redeemable').length;
  const motivationalCount = messagePreviews.filter(m => m.messageType === 'motivational').length;

  const handleSendMessages = async () => {
    if (!messagePreviews.length) {
      toast.error('No hay mensajes para enviar');
      return;
    }

    setIsSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-bulk-fidelization', {
        body: { messages: messagePreviews, settings }
      });

      if (error) throw error;

      toast.success(`Mensajes enviados: ${data.successCount} exitosos, ${data.failedCount} fallidos`);
      setShowPreview(false);
    } catch (error) {
      console.error('Error sending bulk messages:', error);
      toast.error('Error al enviar los mensajes');
    } finally {
      setIsSending(false);
    }
  };

  if (loadingData || loadingSettings) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!showPreview) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envío Masivo de Mensajes de Fidelización</CardTitle>
          <CardDescription>
            Envía mensajes personalizados a todos los clientes según sus puntos acumulados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Clientes con ≥1000 puntos</div>
              <div className="text-2xl font-bold text-primary">{redeemableCount}</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Clientes con &lt;1000 puntos</div>
              <div className="text-2xl font-bold text-secondary">{motivationalCount}</div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Total de mensajes a enviar:</strong> {messagePreviews.length}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vista Previa de Mensajes</CardTitle>
        <CardDescription>
          Revisa los mensajes antes de enviarlos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {messagePreviews.map((preview, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{preview.customerName}</p>
                    <p className="text-sm text-muted-foreground">{preview.customerPhone}</p>
                  </div>
                  <Badge variant={preview.messageType === 'redeemable' ? 'default' : 'secondary'}>
                    {preview.pointsAvailable} puntos
                  </Badge>
                </div>
                <div className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">
                  {preview.messageContent}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(false)}
            className="flex-1"
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
