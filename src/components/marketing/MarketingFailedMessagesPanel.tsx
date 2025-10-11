import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRetryFailedMessages } from '@/hooks/useRetryFailedMessages';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export function MarketingFailedMessagesPanel() {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const { mutate: retryMessages, isPending: isRetrying } = useRetryFailedMessages();

  // Query para obtener mensajes fallidos de marketing
  const { data: failedMessages = [], isLoading, refetch } = useQuery({
    queryKey: ['marketing-failed-messages-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_message_log')
        .select(`
          *,
          marketing_campaigns!campaign_id(campaign_name, sent_at)
        `)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching failed marketing messages:', error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 10000,
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMessages(failedMessages.map(m => m.id));
    } else {
      setSelectedMessages([]);
    }
  };

  const handleSelectMessage = (messageId: string, checked: boolean) => {
    if (checked) {
      setSelectedMessages([...selectedMessages, messageId]);
    } else {
      setSelectedMessages(selectedMessages.filter(id => id !== messageId));
    }
  };

  const handleRetry = () => {
    if (selectedMessages.length === 0) return;

    // Agrupar mensajes por campaña
    const messagesByCampaign = new Map<string, string[]>();
    
    failedMessages
      .filter(m => selectedMessages.includes(m.id))
      .forEach(message => {
        if (message.campaign_id) {
          const existing = messagesByCampaign.get(message.campaign_id) || [];
          messagesByCampaign.set(message.campaign_id, [...existing, message.id]);
        }
      });

    // Reintentar por campaña
    messagesByCampaign.forEach((messageIds, campaignId) => {
      retryMessages(
        { campaignId, messageIds },
        {
          onSuccess: () => {
            setSelectedMessages([]);
            refetch();
          }
        }
      );
    });
  };

  // Agrupar mensajes por campaña para estadísticas
  const campaignStats = failedMessages.reduce((acc, msg) => {
    const campaignName = msg.marketing_campaigns?.campaign_name || 'Sin campaña';
    if (!acc[campaignName]) {
      acc[campaignName] = 0;
    }
    acc[campaignName]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Mensajes Fallidos de Campañas
            </CardTitle>
            <CardDescription>
              Recupera y reintenta los mensajes de campañas que no pudieron ser enviados
            </CardDescription>
          </div>
          {Object.keys(campaignStats).length > 0 && (
            <div className="flex flex-col gap-1">
              {Object.entries(campaignStats).map(([campaign, count]) => (
                <Badge key={campaign} variant="destructive" className="text-sm">
                  {campaign}: {count} fallidos
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : failedMessages.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No hay mensajes fallidos en campañas</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedMessages.length === failedMessages.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedMessages.length} de {failedMessages.length} seleccionados
                  </span>
                </div>
                <Badge variant="destructive" className="text-lg">
                  Total: {failedMessages.length} Fallidos
                </Badge>
              </div>
              <Button
                onClick={handleRetry}
                disabled={selectedMessages.length === 0 || isRetrying}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                {isRetrying ? 'Reenviando...' : 'Reintentar Seleccionados'}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Mensaje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedMessages.includes(message.id)}
                        onCheckedChange={(checked) => 
                          handleSelectMessage(message.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {message.marketing_campaigns?.campaign_name || 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium">
                      {message.customer_name || 'N/A'}
                    </TableCell>
                    <TableCell>{message.customer_phone}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600 truncate" title={message.error_message || ''}>
                          {message.error_message || 'Error desconocido'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="text-sm text-gray-600 truncate" title={message.message_content}>
                        {message.message_content}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
