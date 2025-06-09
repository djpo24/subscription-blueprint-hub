
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useArrivalNotifications } from '@/hooks/useArrivalNotifications';
import { MapPin, Package, Send, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function ArrivalNotificationsPanel() {
  const {
    pendingNotifications,
    isLoading,
    processNotifications,
    isProcessing
  } = useArrivalNotifications();

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

  return (
    <div className="space-y-4">
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Package className="h-5 w-5" />
            Notificaciones de Llegada Automáticas
            {pendingNotifications.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {pendingNotifications.length} pendientes
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-blue-600">
            Sistema automático que envía notificaciones cuando los paquetes cambian a "En Destino"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingNotifications.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    Hay {pendingNotifications.length} notificaciones pendientes de envío
                  </p>
                  <Button
                    onClick={processNotifications}
                    disabled={isProcessing}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isProcessing ? 'Procesando...' : 'Enviar Todas'}
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {pendingNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="p-3 bg-white rounded border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-sm">
                              {notification.packages?.tracking_number}
                            </span>
                            <Badge variant="outline" size="sm">
                              {notification.packages?.destination}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            Cliente: {notification.customers?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {notification.customers?.whatsapp_number || notification.customers?.phone}
                          </p>
                          {notification.packages?.amount_to_collect > 0 && (
                            <p className="text-xs text-green-600 font-medium">
                              Monto a cobrar: ${notification.packages.amount_to_collect} {notification.packages.currency}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary" size="sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDistanceToNow(new Date(notification.created_at), { 
                              addSuffix: true, 
                              locale: es 
                            })}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingNotifications.length === 0 && (
              <div className="text-center py-6">
                <Package className="h-12 w-12 mx-auto text-blue-300 mb-3" />
                <p className="text-blue-600 font-medium">No hay notificaciones pendientes</p>
                <p className="text-blue-500 text-sm">
                  Las notificaciones se generan automáticamente cuando los paquetes llegan a destino
                </p>
              </div>
            )}

            <div className="p-4 bg-blue-100 rounded border border-blue-200">
              <h4 className="font-medium text-sm text-blue-800 mb-2">
                ¿Cómo funciona el sistema automático?
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Detección automática</p>
                    <p className="text-blue-600">
                      Cuando un paquete cambia a estado "En Destino", se crea automáticamente una notificación.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Direcciones incluidas</p>
                    <p className="text-blue-600">
                      El mensaje incluye la dirección específica donde pueden recoger el paquete.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Send className="h-4 w-4 mt-0.5 text-blue-600" />
                  <div>
                    <p className="font-medium">Envío por WhatsApp</p>
                    <p className="text-blue-600">
                      Las notificaciones se envían automáticamente usando plantillas de WhatsApp Business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
