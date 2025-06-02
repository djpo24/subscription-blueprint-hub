
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function MessageDeliveryStatus() {
  const { data: deliveryStatuses = [], isLoading } = useQuery({
    queryKey: ['message-delivery-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_delivery_status')
        .select(`
          *,
          notification_log (
            message,
            customers (
              name,
              phone
            )
          )
        `)
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'read':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return "bg-green-100 text-green-800";
      case 'read':
        return "bg-blue-100 text-blue-800";
      case 'sent':
        return "bg-yellow-100 text-yellow-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'read':
        return 'Leído';
      case 'sent':
        return 'Enviado';
      case 'failed':
        return 'Falló';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Estados de Entrega WhatsApp
        </CardTitle>
        <CardDescription>
          Estados en tiempo real de los mensajes enviados vía WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando estados...</div>
          </div>
        ) : deliveryStatuses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay estados de entrega registrados</p>
            <p className="text-sm mt-2">Los estados aparecerán aquí cuando se configuren los webhooks</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveryStatuses.map((status) => (
                <TableRow key={status.id}>
                  <TableCell>
                    <div className="font-medium">
                      {status.notification_log?.customers?.name || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {status.recipient_phone}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={status.notification_log?.message}>
                      {status.notification_log?.message || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(status.status)} variant="secondary">
                      <div className="flex items-center gap-1">
                        {getStatusIcon(status.status)}
                        {getStatusLabel(status.status)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(status.timestamp), 'dd/MM/yyyy HH:mm')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
