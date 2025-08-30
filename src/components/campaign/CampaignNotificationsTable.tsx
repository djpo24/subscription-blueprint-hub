
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCampaignNotifications } from '@/hooks/useCampaignNotifications';
import { formatDateDisplay } from '@/utils/dateUtils';
import { Send, Eye, Calendar } from 'lucide-react';

interface CampaignNotification {
  id: string;
  campaign_name: string;
  status: 'draft' | 'sent';
  total_customers_sent?: number;
  success_count?: number;
  failed_count?: number;
  created_at: string;
  sent_at?: string | null;
}

interface CampaignNotificationsTableProps {
  notifications: CampaignNotification[];
  isLoading: boolean;
}

export function CampaignNotificationsTable({ 
  notifications, 
  isLoading 
}: CampaignNotificationsTableProps) {
  const { sendNotification, isSending } = useCampaignNotifications();

  if (isLoading) {
    return <div className="text-center py-4">Cargando campañas...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay campañas creadas</p>
        <p className="text-sm">Crea tu primera campaña de próximos viajes</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campaña</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Mensajes</TableHead>
          <TableHead>Éxito</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {notifications.map((notification) => (
          <TableRow key={notification.id}>
            <TableCell className="font-medium">
              {notification.campaign_name}
            </TableCell>
            <TableCell>
              <Badge 
                variant={notification.status === 'sent' ? 'default' : 'secondary'}
              >
                {notification.status === 'draft' ? 'Borrador' : 'Enviada'}
              </Badge>
            </TableCell>
            <TableCell>
              {notification.total_customers_sent || 0}
            </TableCell>
            <TableCell>
              <span className="text-green-600">
                {notification.success_count || 0}
              </span>
              {notification.failed_count && notification.failed_count > 0 && (
                <span className="text-red-600 ml-1">
                  / {notification.failed_count} fallos
                </span>
              )}
            </TableCell>
            <TableCell>
              <div className="text-sm">
                <div>Creada: {formatDateDisplay(notification.created_at, 'dd/MM/yyyy')}</div>
                {notification.sent_at && (
                  <div className="text-gray-500">
                    Enviada: {formatDateDisplay(notification.sent_at, 'dd/MM/yyyy')}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {notification.status === 'draft' && (
                  <Button
                    size="sm"
                    onClick={() => sendNotification(notification.id)}
                    disabled={isSending}
                    className="flex items-center gap-1"
                  >
                    <Send className="h-3 w-3" />
                    {isSending ? 'Enviando...' : 'Enviar'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  Ver
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
