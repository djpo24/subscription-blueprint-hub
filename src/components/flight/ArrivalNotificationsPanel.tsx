import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useArrivalNotifications } from '@/hooks/useArrivalNotifications';
import { useCreateArrivalNotifications } from '@/hooks/useCreateArrivalNotifications';
import { MapPin, Package, Send, Clock, AlertCircle, CheckCircle, Eye, Plus, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function ArrivalNotificationsPanel() {
  const {
    pendingNotifications,
    preparedNotifications,
    isLoading,
    prepareNotifications,
    executeNotifications,
    clearPreparedNotifications,
    isPreparing,
    isExecuting,
    isClearing
  } = useArrivalNotifications();

  const {
    createNotifications,
    isCreating
  } = useCreateArrivalNotifications();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Notificaciones de Llegada
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
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package className="h-5 w-5" />
            Sistema de Notificaciones de Llegada
            {totalNotifications > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {totalNotifications} total
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-blue-600">
            Sistema de revisión manual con números de teléfono sincronizados del perfil del cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Botón para cargar paquetes en destino */}
          <div className="mb-6 p-4 bg-orange-50 rounded border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-orange-800 mb-1">
                  Cargar Paquetes en Destino
                </h4>
                <p className="text-sm text-orange-600">
                  Crear notificaciones para todos los paquetes con estado "En Destino" usando números actualizados
                </p>
              </div>
              <Button
                onClick={() => createNotifications()}
                disabled={isCreating}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isCreating ? 'Cargando...' : 'Cargar Paquetes'}
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
                {pendingNotifications.length > 0 && (
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
                )}
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
                              {notification.packages?.tracking_number || 'N/A'}
                            </span>
                            <Badge variant="outline" className="text-orange-600">
                              {notification.packages?.destination || 'N/A'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            Cliente: {notification.customers?.name}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {notification.customers?.whatsapp_number || notification.customers?.phone}
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
                              {notification.packages?.tracking_number || 'N/A'}
                            </span>
                            <Badge variant="outline" className="text-green-600">
                              {notification.packages?.destination || 'N/A'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            Cliente: {notification.customers?.name}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {notification.customers?.whatsapp_number || notification.customers?.phone}
                          </p>
                          {notification.packages?.amount_to_collect && notification.packages.amount_to_collect > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              💰 {notification.packages.currency === 'AWG' ? 'ƒ' : '$'}{notification.packages.amount_to_collect} {notification.packages.currency}
                            </p>
                          )}
                          {notification.message && (
                            <div className="mt-2 p-2 bg-white rounded text-xs border">
                              <strong>Mensaje:</strong>
                              <div className="mt-1 text-gray-700 whitespace-pre-line">
                                {notification.message}
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
          <div className="mt-6 p-4 bg-blue-100 rounded border border-blue-200">
            <h4 className="font-medium text-sm text-blue-800 mb-2">
              Sistema Sincronizado de Números de Teléfono
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                <div>
                  <p className="font-medium">Números Sincronizados</p>
                  <p className="text-blue-600">
                    El sistema ahora usa automáticamente el número de teléfono más actualizado del perfil del cliente.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Plus className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">1. Cargar paquetes en destino</p>
                  <p className="text-blue-600">
                    Crea notificaciones para todos los paquetes "En Destino" con números actualizados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">2. Preparación para revisión</p>
                  <p className="text-blue-600">
                    Genera mensajes y verifica direcciones con los números de teléfono actuales.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">3. Envío con número actualizado</p>
                  <p className="text-blue-600">
                    Los mensajes se envían al número de teléfono que aparece en el perfil del cliente.
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
