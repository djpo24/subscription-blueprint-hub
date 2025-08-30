
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCampaignNotifications } from '@/hooks/useCampaignNotifications';
import { useCreateCampaignNotifications } from '@/hooks/useCreateCampaignNotifications';
import { MapPin, Package, Send, Clock, AlertCircle, CheckCircle, Eye, Plus, Trash2, Megaphone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function CampaignNotificationsPanel() {
  const {
    pendingNotifications,
    preparedNotifications,
    isLoading,
    prepareNotifications,
    executeNotifications,
    clearPreparedNotifications,
    clearPendingNotifications,
    isPreparing,
    isExecuting,
    isClearing,
    isClearingPending
  } = useCampaignNotifications();

  const {
    createNotifications,
    isCreating
  } = useCreateCampaignNotifications();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Notificaciones de Campaña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Cargando notificaciones...</p>
        </CardContent>
      </Card>
    );
  }

  const totalNotifications = pendingNotifications.length + preparedNotifications.length;

  return (
    <div className="space-y-4">
      {/* Panel Principal */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Megaphone className="h-5 w-5" />
            Sistema de Notificaciones de Campaña - Próximos Viajes
            {totalNotifications > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalNotifications} total
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-purple-600">
            Sistema de revisión manual para notificaciones de próximos viajes con plantilla "proximos_viajes"
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botón para cargar clientes */}
          <div className="mb-6 p-4 bg-orange-50 rounded border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-orange-800 mb-1">
                  Cargar Todos los Clientes
                </h4>
                <p className="text-sm text-orange-600">
                  Crear notificaciones de próximos viajes para todos los clientes usando la plantilla "proximos_viajes"
                </p>
              </div>
              <Button
                onClick={() => createNotifications()}
                disabled={isCreating}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Cargando...' : 'Cargar Clientes'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel de Notificaciones Pendientes (para preparar) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-800 flex items-center gap-2">
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
                        onClick={() => prepareNotifications()}
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
                            <Megaphone className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-sm">
                              Campaña Próximos Viajes
                            </span>
                            <Badge variant="outline" className="text-orange-600">
                              Plantilla: proximos_viajes
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            Cliente: {notification.customer_name}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {notification.customer_phone}
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
                  <Megaphone className="h-8 w-8 mx-auto mb-2 opacity-50" />
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
                            <Megaphone className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">
                              Campaña Próximos Viajes
                            </span>
                            <Badge variant="outline" className="text-green-600">
                              Plantilla: proximos_viajes
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            Cliente: {notification.customer_name}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {notification.customer_phone}
                          </p>
                          {notification.message_content && (
                            <div className="mt-2 p-2 bg-white rounded text-xs border">
                              <strong>Mensaje:</strong>
                              <div className="mt-1 text-gray-700 whitespace-pre-line">
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

          {/* Información del Sistema */}
          <div className="mt-6 p-4 bg-purple-100 rounded border border-purple-200">
            <h4 className="font-medium text-sm text-purple-800 mb-2">
              Sistema de Campaña - Próximos Viajes
            </h4>
            <div className="space-y-2 text-sm text-purple-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <div>
                  <p className="font-medium">Plantilla: "proximos_viajes"</p>
                  <p className="text-purple-600">
                    Notifica a todos los clientes sobre próximos viajes programados con fechas personalizadas.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Plus className="h-4 w-4 mt-0.5 text-purple-600" />
                <div>
                  <p className="font-medium">1. Cargar todos los clientes</p>
                  <p className="text-purple-600">
                    Crea notificaciones para todos los clientes del sistema con la plantilla de próximos viajes.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-purple-600" />
                <div>
                  <p className="font-medium">2. Preparación para revisión</p>
                  <p className="text-purple-600">
                    Genera mensajes personalizados con fechas de viajes disponibles y fechas límite.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 mt-0.5 text-purple-600" />
                <div>
                  <p className="font-medium">3. Envío masivo</p>
                  <p className="text-purple-600">
                    Los mensajes se envían a todos los clientes con información personalizada de próximos viajes.
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
