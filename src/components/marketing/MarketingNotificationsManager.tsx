
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMarketingNotifications } from '@/hooks/useMarketingNotifications';
import { Play, Trash2, RotateCcw, Users, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';

export function MarketingNotificationsManager() {
  const {
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
  } = useMarketingNotifications();

  const [campaignName, setCampaignName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [messageTemplate, setMessageTemplate] = useState(`¡Hola {customer_name}! 👋

🛫 *Próximos viajes programados*

{trip_details}

💼 ¡Aprovecha estos viajes para enviar tus paquetes!

📞 Contáctanos para reservar tu espacio
🚚 Servicio de puerta a puerta disponible

¡Te esperamos! ✈️`);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'prepared':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'prepared':
        return 'Preparado';
      case 'pending':
        return 'Pendiente';
      case 'failed':
        return 'Fallido';
      default:
        return status;
    }
  };

  const handlePrepareNotifications = () => {
    if (!campaignName || !startDate || !endDate || !messageTemplate) {
      return;
    }

    prepareNotifications({
      campaign_name: campaignName,
      trip_start_date: startDate,
      trip_end_date: endDate,
      message_template: messageTemplate
    });
  };

  const totalNotifications = pendingNotifications.length + preparedNotifications.length + failedNotifications.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notificaciones de Marketing</h2>
          <p className="text-gray-500">
            Sistema de notificaciones de próximos viajes - Funciona igual que las notificaciones de llegada
          </p>
        </div>
      </div>

      {/* Configuración de Campaña */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Configurar Nueva Campaña
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="campaignName">Nombre de Campaña</Label>
              <Input
                id="campaignName"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="Ej: Viajes Agosto 2025"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="messageTemplate">Plantilla de Mensaje</Label>
            <Textarea
              id="messageTemplate"
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={8}
              placeholder="Plantilla del mensaje..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Variables disponibles: {'{customer_name}'}, {'{trip_details}'}
            </p>
          </div>

          <Button 
            onClick={handlePrepareNotifications}
            disabled={isPreparing || !campaignName || !startDate || !endDate || !messageTemplate}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            {isPreparing ? 'Preparando...' : 'Preparar Notificaciones'}
          </Button>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preparadas</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{preparedNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fallidas</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedNotifications.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNotifications}</div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {preparedNotifications.length > 0 && (
          <Button 
            onClick={executeNotifications}
            disabled={isExecuting || isLoading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4" />
            {isExecuting ? 'Enviando...' : 'Ejecutar Envío'}
          </Button>
        )}

        {failedNotifications.length > 0 && (
          <Button 
            onClick={retryFailedNotifications}
            disabled={isRetrying || isLoading}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            {isRetrying ? 'Reintentando...' : 'Reintentar Fallidas'}
          </Button>
        )}

        {preparedNotifications.length > 0 && (
          <Button 
            onClick={clearPreparedNotifications}
            disabled={isClearing || isLoading}
            variant="outline"
            className="flex items-center gap-2 text-orange-600 hover:text-orange-700"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Limpiando...' : 'Limpiar Preparadas'}
          </Button>
        )}

        {pendingNotifications.length > 0 && (
          <Button 
            onClick={clearPendingNotifications}
            disabled={isClearingPending || isLoading}
            variant="outline"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            {isClearingPending ? 'Limpiando...' : 'Limpiar Pendientes'}
          </Button>
        )}
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones Individuales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Cargando notificaciones...</div>
            </div>
          ) : totalNotifications === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones para mostrar</p>
              <p className="text-sm mt-2">Configura una campaña y haz clic en "Preparar Notificaciones" para comenzar</p>
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
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...pendingNotifications, ...preparedNotifications, ...failedNotifications].map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell className="font-medium">
                      {notification.customer_name}
                    </TableCell>
                    <TableCell>{notification.customer_phone}</TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={notification.message_content}>
                        {notification.message_content}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(notification.status)}>
                        {getStatusLabel(notification.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {notification.sent_at 
                        ? new Date(notification.sent_at).toLocaleString()
                        : new Date(notification.created_at).toLocaleString()
                      }
                    </TableCell>
                    <TableCell>
                      {notification.error_message && (
                        <span className="text-red-600 text-xs" title={notification.error_message}>
                          {notification.error_message.substring(0, 50)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
