
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTripNotificationDetails } from '@/hooks/useTripNotificationDetails';
import { Package, Send, Clock, AlertCircle, CheckCircle, Eye, Plus, Trash2, Plane } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TripNotification } from '@/hooks/useTripNotifications';

interface TripNotificationPanelProps {
  notification: TripNotification;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripNotificationPanel({ notification, isOpen, onOpenChange }: TripNotificationPanelProps) {
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
  } = useTripNotificationDetails(notification.id, isOpen);

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              Notificación de Viaje
            </DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <p className="text-gray-500">Cargando detalles de la notificación...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const totalNotifications = pendingNotifications.length + preparedNotifications.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            Notificación de Viaje - {notification.outbound_trip?.origin} ↔ {notification.return_trip?.origin}
          </DialogTitle>
          <DialogDescription>
            Sistema de envío controlado para notificaciones de viajes de ida y vuelta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información de la Notificación */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Plane className="h-5 w-5" />
                Detalles del Viaje
                {totalNotifications > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {totalNotifications} clientes
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Viaje de Ida</h4>
                  <p className="text-sm">
                    <strong>Fecha:</strong> {new Date(notification.outbound_trip?.trip_date || '').toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm">
                    <strong>Ruta:</strong> {notification.outbound_trip?.origin} → {notification.outbound_trip?.destination}
                  </p>
                  {notification.outbound_trip?.flight_number && (
                    <p className="text-sm">
                      <strong>Vuelo:</strong> {notification.outbound_trip.flight_number}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-800">Viaje de Retorno</h4>
                  <p className="text-sm">
                    <strong>Fecha:</strong> {new Date(notification.return_trip?.trip_date || '').toLocaleDateString('es-ES')}
                  </p>
                  <p className="text-sm">
                    <strong>Ruta:</strong> {notification.return_trip?.origin} → {notification.return_trip?.destination}
                  </p>
                  {notification.return_trip?.flight_number && (
                    <p className="text-sm">
                      <strong>Vuelo:</strong> {notification.return_trip.flight_number}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                <p className="text-sm">
                  <strong>Fecha límite de entrega:</strong> {new Date(notification.deadline_date).toLocaleDateString('es-ES')} a las {notification.deadline_time}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botón para cargar clientes */}
          <div className="p-4 bg-orange-50 rounded border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-orange-800 mb-1">
                  Cargar Clientes para Notificación
                </h4>
                <p className="text-sm text-orange-600">
                  Crear notificaciones personalizadas para todos los clientes usando números actualizados
                </p>
              </div>
              <Button
                onClick={() => prepareNotifications()}
                disabled={isPreparing || totalNotifications > 0}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isPreparing ? 'Cargando...' : 'Cargar Clientes'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Panel de Notificaciones Pendientes */}
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
                  {pendingNotifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-orange-50 rounded border border-orange-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-orange-600" />
                            <span className="font-medium text-sm">
                              {item.customer_name}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {item.customer_phone}
                          </p>
                        </div>
                        <Badge variant="secondary" className="text-orange-600">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(item.created_at), { 
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

            {/* Panel de Notificaciones Preparadas */}
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
                  {preparedNotifications.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-green-50 rounded border border-green-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-sm">
                              {item.customer_name}
                            </span>
                          </div>
                          <p className="text-xs text-green-600 font-medium">
                            📱 {item.customer_phone}
                          </p>
                          {item.personalized_message && (
                            <div className="mt-2 p-2 bg-white rounded text-xs border">
                              <strong>Mensaje:</strong>
                              <div className="mt-1 text-gray-700 whitespace-pre-line">
                                {item.personalized_message}
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
          <div className="p-4 bg-blue-100 rounded border border-blue-200">
            <h4 className="font-medium text-sm text-blue-800 mb-2">
              Sistema de Envío Controlado de Notificaciones de Viaje
            </h4>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <Plus className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">1. Cargar clientes</p>
                  <p className="text-blue-600">
                    Genera notificaciones personalizadas para todos los clientes usando sus números actualizados.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">2. Preparación para revisión</p>
                  <p className="text-blue-600">
                    Genera mensajes personalizados con fechas de viaje y verifica números de teléfono.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Send className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium">3. Envío controlado</p>
                  <p className="text-blue-600">
                    Los mensajes se envían de forma controlada al número actualizado de cada cliente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
