import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CarrierTrackingListItem } from './CarrierTrackingListItem';
import { RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface TrackingGuide {
  id: string;
  customer_id: string;
  carrier: string;
  tracking_number: string;
  status: string;
  last_status: string;
  last_check_at: string;
  delivered_at: string;
  created_at: string;
  last_tracking_data: any;
  notes: string;
  customers: {
    name: string;
    phone: string;
  };
}

export function CarrierTrackingList() {
  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const { data: pendingGuides = [], isLoading: loadingPending, refetch: refetchPending } = useQuery({
    queryKey: ['carrier-tracking-guides', 'pending'],
    queryFn: async (): Promise<TrackingGuide[]> => {
      const { data, error } = await supabase
        .from('carrier_tracking_guides')
        .select(`
          *,
          customers (
            name,
            phone
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 180000, // 3 minutos para vista en tiempo real
  });

  const { data: deliveredGuides = [], isLoading: loadingDelivered, refetch: refetchDelivered } = useQuery({
    queryKey: ['carrier-tracking-guides', 'delivered'],
    queryFn: async (): Promise<TrackingGuide[]> => {
      const { data, error } = await supabase
        .from('carrier_tracking_guides')
        .select(`
          *,
          customers (
            name,
            phone
          )
        `)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const handleManualRefresh = async (guideId: string) => {
    try {
      const { error } = await supabase.functions.invoke('refresh-carrier-tracking', {
        body: { guideId }
      });

      if (error) throw error;

      toast.success('Guía actualizada exitosamente');
      refetchPending();
      refetchDelivered();
    } catch (error) {
      console.error('Error refreshing guide:', error);
      toast.error('Error al actualizar la guía');
    }
  };

  const handleRefreshAll = async () => {
    if (pendingGuides.length === 0) {
      toast.info('No hay guías pendientes para actualizar');
      return;
    }

    setIsRefreshingAll(true);
    const loadingToast = toast.loading(`Actualizando ${pendingGuides.length} guías...`);

    try {
      const { data, error } = await supabase.functions.invoke('cron-carrier-tracking');

      if (error) throw error;

      toast.success(`Actualización completada: ${data.updated} guías actualizadas`, {
        id: loadingToast,
      });

      refetchPending();
      refetchDelivered();
    } catch (error) {
      console.error('Error refreshing all guides:', error);
      toast.error('Error al actualizar las guías', {
        id: loadingToast,
      });
    } finally {
      setIsRefreshingAll(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Guías en Seguimiento</CardTitle>
            <CardDescription>
              Las guías se actualizan automáticamente cada 3 horas
            </CardDescription>
          </div>
          <Button
            onClick={handleRefreshAll}
            disabled={isRefreshingAll || pendingGuides.length === 0}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingAll ? 'animate-spin' : ''}`} />
            {isRefreshingAll ? 'Actualizando...' : 'Actualizar Todas'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              En Seguimiento ({pendingGuides.length})
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Entregadas ({deliveredGuides.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {loadingPending ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingGuides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay guías en seguimiento
              </div>
            ) : (
              pendingGuides.map((guide) => (
                <CarrierTrackingListItem
                  key={guide.id}
                  guide={guide}
                  onRefresh={() => handleManualRefresh(guide.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="delivered" className="space-y-4 mt-4">
            {loadingDelivered ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : deliveredGuides.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay guías entregadas
              </div>
            ) : (
              deliveredGuides.map((guide) => (
                <CarrierTrackingListItem
                  key={guide.id}
                  guide={guide}
                  onRefresh={() => handleManualRefresh(guide.id)}
                  isDelivered
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
