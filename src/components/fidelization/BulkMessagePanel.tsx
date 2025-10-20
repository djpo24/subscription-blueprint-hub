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
  const { data: fidelizationData, isLoading: loadingData, refetch, isRefetching } = useFidelizationData('all');
  const { data: settings, isLoading: loadingSettings } = useBulkFidelizationSettings();
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoadCustomers = async () => {
    console.log('🔄 Cargando clientes para envío masivo...');
    try {
      const result = await refetch();
      console.log('📦 Datos recibidos:', result.data);
      
      if (result.data) {
        const customersWithPhone = result.data.filter(c => c.phone && c.phone.trim().length > 0);
        const redeemable = customersWithPhone.filter(c => c.totalPoints >= 1000).length;
        const motivational = customersWithPhone.filter(c => c.totalPoints < 1000).length;
        
        setIsLoaded(true);
        
        toast.success(`${result.data.length} clientes cargados: ${redeemable} canjeables, ${motivational} motivacionales`);
        console.log(`📊 Clientes totales: ${result.data.length}`);
        console.log(`📱 Con teléfono: ${customersWithPhone.length}`);
        console.log(`✅ Segmentación: ${redeemable} con ≥1000pts, ${motivational} con <1000pts`);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Error al cargar clientes');
    }
  };

  const messagePreviews = useMemo<MessagePreview[]>(() => {
    if (!fidelizationData || !settings) return [];
    if (!isLoaded) return [];

    console.log('📝 Generando previews de mensajes...', {
      totalCustomers: fidelizationData.length,
      hasSettings: !!settings,
      isLoaded
    });

    const previews = fidelizationData
      .filter(customer => {
        const hasPhone = !!customer.phone && customer.phone.trim().length > 0;
        if (!hasPhone) {
          console.log(`⚠️ Cliente sin teléfono: ${customer.name}`);
        }
        return hasPhone;
      })
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
          customerPhone: customer.phone,
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
  }, [fidelizationData, settings, isLoaded]);

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

  if (loadingSettings) {
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

  // Mostrar botón de cargar si no se han cargado los datos aún
  if (!isLoaded && !loadingData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Envío Masivo de Mensajes de Fidelización</CardTitle>
          <CardDescription>
            Carga los clientes para ver la segmentación automática y enviar mensajes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-8 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">
              Presiona el botón para cargar todos los clientes y ver la segmentación automática
            </p>
            <Button 
              onClick={handleLoadCustomers} 
              size="lg"
              disabled={loadingData || isRefetching}
            >
              {loadingData || isRefetching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Cargando...
                </>
              ) : (
                'Cargar Clientes'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showPreview) {
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
              onClick={handleLoadCustomers} 
              variant="outline"
              size="sm"
              disabled={loadingData || isRefetching}
            >
              {loadingData || isRefetching ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
                  Recargando...
                </>
              ) : (
                'Recargar Clientes'
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
            {messagePreviews.map((preview, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{preview.customerName}</p>
                    <p className="text-sm text-muted-foreground">{preview.customerPhone}</p>
                  </div>
                  <Badge 
                    variant={preview.messageType === 'redeemable' ? 'default' : 'secondary'}
                    className={preview.messageType === 'redeemable' ? 'bg-green-600' : 'bg-amber-600'}
                  >
                    {preview.messageType === 'redeemable' ? '🎁 Canjeable' : '📈 Motivacional'}
                    <span className="ml-2">{preview.pointsAvailable} pts</span>
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
