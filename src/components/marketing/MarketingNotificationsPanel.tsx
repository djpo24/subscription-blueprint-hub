
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useMarketingNotifications } from '@/hooks/useMarketingNotifications';
import { useCreateMarketingNotifications } from '@/hooks/useCreateMarketingNotifications';
import { MapPin, Package, Send, Clock, AlertCircle, CheckCircle, Eye, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';

export function MarketingNotificationsPanel() {
  const {
    pendingNotifications,
    preparedNotifications,
    failedNotifications,
    isLoading,
    prepareNotifications,
    executeNotifications,
    clearPreparedNotifications,
    clearPendingNotifications,
    isPreparing,
    isExecuting,
    isClearing,
    isClearingPending
  } = useMarketingNotifications();

  const {
    createNotifications,
    isCreating
  } = useCreateMarketingNotifications();

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Notificaciones de Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Cargando notificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  const totalNotifications = pendingNotifications.length + preparedNotifications.length + failedNotifications.length;

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

  return (
    <div className="space-y-4">
      {/* Panel Principal */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package className="h-5 w-5" />
            Sistema de Notificaciones de Marketing
            {totalNotifications > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalNotifications} total
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-blue-600">
            Sistema de revisión manual con plantillas personalizadas para cada cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Configuración de Campaña */}
          <div className="mb-6 p-4 bg-orange-50 rounded border border-orange-200">
            <div className="space-y-4">
              <h4 className="font-medium text-orange-800 mb-3">
                Configurar Nueva Campaña de Marketing
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="campaignName">Nombre de Campaña</Label>
                  <Input
                    id="campaignName"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ej: Viajes Septiembre 2025"
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
                onClick={() => createNotifications({
                  campaign_name: campaignName,
                  trip_start_date: startDate,
                  trip_end_date: endDate,
                  message_template: messageTemplate
                })}
                disabled={isCreating || !campaignName || !startDate || !endDate || !messageTemplate}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Cargando Clientes...' : 'Cargar Clientes para Campaña'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel de Notificaciones Pendientes (para preparar) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Pendientes de Preparar
                  {pendingNotifications.length > 0 && (
                    <Badge variant="outline" className="text-orange-600 border-orange-300">
                      {pendingNotifications.length}
                    </Badge>
                  )}
                </h4>
                <div className="flex gap-2">
                  {pendingNotifications.length > 0 && (
                    <>
                      <Button
                        onClick={() => clearPendingNotifications()}
                        disabled={isClearingPending}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isClearingPending ? 'Limpiando...' : 'Limpiar'}
                      </Button>
                      <Button
                        onClick={handlePrepareNotifications}
                        disabled={isPreparing}
                        size="sm"
                        variant="outline"
                        className="text-orange-600 border-orange-300 hover:bg-orange-50"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {isPreparing ? 'Preparando...' : 'Preparar para Revisión'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {pendingNotifications.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {pendingNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-orange-50 rounded border border-orange-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-sm">
                              {notification.customer_name}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {notification.customer_phone}
                          </p>
                          <p className="text-xs text-gray-600">
                            Campaña: {notification.campaign_name}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-orange-600">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones pendientes de preparar</p>
                </div>
              )}
            </div>

            {/* Panel de Notificaciones Preparadas (para enviar) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-green-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Preparadas para Envío
                  {preparedNotifications.length > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-300">
                      {preparedNotifications.length}
                    </Badge>
                  )}
                </h4>
                <div className="flex gap-2">
                  {preparedNotifications.length > 0 && (
                    <>
                      <Button
                        onClick={() => clearPreparedNotifications()}
                        disabled={isClearing}
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isClearing ? 'Limpiando...' : 'Limpiar'}
                      </Button>
                      <Button
                        onClick={() => executeNotifications()}
                        disabled={isExecuting}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isExecuting ? 'Enviando...' : 'Ejecutar Envío'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {preparedNotifications.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {preparedNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-green-50 rounded border border-green-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">
                              {notification.customer_name}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {notification.customer_phone}
                          </p>
                          <p className="text-xs text-gray-600">
                            Campaña: {notification.campaign_name}
                          </p>
                          {notification.message_content && (
                            <div className="mt-2 p-2 bg-white rounded text-xs border">
                              <strong>Vista Previa:</strong>
                              <div className="mt-1 text-gray-700 whitespace-pre-line max-h-20 overflow-y-auto">
                                {notification.message_content}
                              </div>
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Listo
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-green-600">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay notificaciones preparadas para envío</p>
                </div>
              )}
            </div>
          </div>

          {/* Panel de Notificaciones Fallidas */}
          {failedNotifications.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
              <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Notificaciones Fallidas ({failedNotifications.length})
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {failedNotifications.map((notification) => (
                  <div key={notification.id} className="p-2 bg-white rounded border text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{notification.customer_name}</span>
                      <span className="text-red-600">{notification.customer_phone}</span>
                    </div>
                    {notification.error_message && (
                      <p className="text-xs text-red-600 mt-1">{notification.error_message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Información del Sistema */}
          <div className="mt-6 p-4 bg-blue-100 rounded border border-blue-200">
            <h4 className="font-medium text-sm text-blue-800 mb-2">
              Sistema de Marketing Personalizado
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <Plus className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">1. Cargar clientes para campaña</p>
                  <p className="text-blue-600">
                    Crea notificaciones pendientes para todos los clientes activos del sistema.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">2. Preparación para revisión</p>
                  <p className="text-blue-600">
                    Genera mensajes personalizados con detalles de viajes y tarifas para cada cliente.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">3. Envío masivo</p>
                  <p className="text-blue-600">
                    Los mensajes se envían por WhatsApp usando la información actualizada de cada cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
