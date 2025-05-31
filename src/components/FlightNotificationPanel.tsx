
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { useFlightMonitor } from '@/hooks/useFlightMonitor';
import { Bell, Plane, Send, Play, RefreshCw, Clock, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function FlightNotificationPanel() {
  const { 
    pendingFlights, 
    isLoading, 
    processNotifications, 
    updateFlightStatus,
    sendTestNotification,
    isProcessing,
    isSendingTest
  } = useFlightNotifications();

  const {
    startMonitoring,
    isMonitoring
  } = useFlightMonitor();

  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hola! Esta es una notificación de prueba del sistema de Envíos Ojitos.');

  const getStatusColor = (hasLanded: boolean, notificationSent: boolean) => {
    if (notificationSent) {
      return "bg-green-100 text-green-800";
    } else if (hasLanded) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  const getStatusLabel = (hasLanded: boolean, notificationSent: boolean) => {
    if (notificationSent) {
      return "Notificado";
    } else if (hasLanded) {
      return "Pendiente Notificación";
    }
    return "En Vuelo";
  };

  const getStatusIcon = (hasLanded: boolean, notificationSent: boolean) => {
    if (notificationSent) {
      return "✅";
    } else if (hasLanded) {
      return "🛬";
    }
    return "✈️";
  };

  const handleTestNotification = () => {
    if (!testPhone.trim()) {
      return;
    }
    sendTestNotification({ phone: testPhone, message: testMessage });
  };

  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'No programado';
    try {
      return format(new Date(dateTime), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getDelayStatus = (scheduled: string | null, actual: string | null) => {
    if (!scheduled || !actual) return null;
    
    const scheduledTime = new Date(scheduled);
    const actualTime = new Date(actual);
    const diffMinutes = Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
    
    if (diffMinutes > 30) {
      return { status: 'delayed', minutes: diffMinutes, color: 'text-red-600' };
    } else if (diffMinutes < -15) {
      return { status: 'early', minutes: Math.abs(diffMinutes), color: 'text-green-600' };
    }
    return { status: 'on-time', minutes: diffMinutes, color: 'text-blue-600' };
  };

  return (
    <div className="space-y-6">
      {/* Flight Monitoring Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Monitoreo Automático de Vuelos
              </CardTitle>
              <CardDescription>
                Sistema automático de seguimiento del estado de vuelos en tiempo real
              </CardDescription>
            </div>
            <Button 
              onClick={() => startMonitoring()}
              disabled={isMonitoring}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Play className="h-4 w-4" />
              {isMonitoring ? 'Monitoreando...' : 'Iniciar Monitoreo'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">¿Cómo funciona el monitoreo?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• El sistema verifica automáticamente el estado de todos los vuelos activos</li>
              <li>• Cuando un vuelo aterriza, se actualiza el estado automáticamente</li>
              <li>• Se crean notificaciones pendientes para los clientes</li>
              <li>• Las notificaciones se envían automáticamente por WhatsApp</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Test Notification Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Prueba de Notificación WhatsApp
          </CardTitle>
          <CardDescription>
            Envía una notificación de prueba para verificar la configuración
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Número de teléfono (incluye código de país)
              </label>
              <Input
                placeholder="+57 300 123 4567"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Mensaje de prueba
              </label>
              <Input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
          <Button 
            onClick={handleTestNotification}
            disabled={isSendingTest || !testPhone.trim()}
            className="w-full md:w-auto"
          >
            {isSendingTest ? 'Enviando...' : 'Enviar Notificación de Prueba'}
          </Button>
        </CardContent>
      </Card>

      {/* Flight Information and Notifications Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Información Detallada de Vuelos
              </CardTitle>
              <CardDescription>
                Estado completo de vuelos monitoreados y notificaciones WhatsApp
              </CardDescription>
            </div>
            <Button 
              onClick={() => processNotifications()}
              disabled={isProcessing || pendingFlights.length === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isProcessing ? 'Procesando...' : 'Procesar Notificaciones'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Cargando información de vuelos...</div>
            </div>
          ) : pendingFlights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay vuelos pendientes de notificación</p>
              <p className="text-sm mt-2">Los vuelos aparecerán aquí cuando se detecten aterrizajes</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingFlights.map((flight) => {
                const delayInfo = getDelayStatus(flight.scheduled_arrival, flight.actual_arrival);
                
                return (
                  <Card key={flight.id} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">
                            {getStatusIcon(flight.has_landed, flight.notification_sent)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">
                              {flight.airline} {flight.flight_number}
                            </h3>
                            <Badge className={getStatusColor(flight.has_landed, flight.notification_sent)}>
                              {getStatusLabel(flight.has_landed, flight.notification_sent)}
                            </Badge>
                          </div>
                        </div>
                        {!flight.has_landed && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateFlightStatus({ flightId: flight.id, hasLanded: true })}
                          >
                            Marcar Aterrizado
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Ruta */}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Ruta</div>
                            <div className="font-medium">
                              {flight.departure_airport} → {flight.arrival_airport}
                            </div>
                          </div>
                        </div>

                        {/* Salida Programada */}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Salida Programada</div>
                            <div className="font-medium">
                              {formatDateTime(flight.scheduled_departure)}
                            </div>
                          </div>
                        </div>

                        {/* Llegada Programada */}
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Llegada Programada</div>
                            <div className="font-medium">
                              {formatDateTime(flight.scheduled_arrival)}
                            </div>
                          </div>
                        </div>

                        {/* Salida Real */}
                        {flight.actual_departure && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-green-500" />
                            <div>
                              <div className="text-sm text-gray-500">Salida Real</div>
                              <div className="font-medium text-green-600">
                                {formatDateTime(flight.actual_departure)}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Llegada Real */}
                        {flight.actual_arrival && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-green-500" />
                            <div>
                              <div className="text-sm text-gray-500">Llegada Real</div>
                              <div className="font-medium text-green-600">
                                {formatDateTime(flight.actual_arrival)}
                              </div>
                              {delayInfo && (
                                <div className={`text-xs ${delayInfo.color}`}>
                                  {delayInfo.status === 'delayed' && `+${delayInfo.minutes} min retraso`}
                                  {delayInfo.status === 'early' && `-${delayInfo.minutes} min adelanto`}
                                  {delayInfo.status === 'on-time' && 'A tiempo'}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Estado del Vuelo */}
                        <div className="flex items-center gap-2">
                          <Plane className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-gray-500">Estado</div>
                            <div className="font-medium capitalize">
                              {flight.status === 'scheduled' && 'Programado'}
                              {flight.status === 'in_flight' && 'En Vuelo'}
                              {flight.status === 'arrived' && 'Llegado'}
                              {flight.status === 'delayed' && 'Retrasado'}
                              {flight.status === 'cancelled' && 'Cancelado'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Información adicional */}
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Última actualización:</span>
                            <div className="font-medium">
                              {formatDateTime(flight.last_updated)}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Notificación enviada:</span>
                            <div className="font-medium">
                              {flight.notification_sent ? 'Sí' : 'No'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
