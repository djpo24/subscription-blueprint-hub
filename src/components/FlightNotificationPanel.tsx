
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { useFlightMonitor } from '@/hooks/useFlightMonitor';
import { Bell, Plane, Send, Play, RefreshCw } from 'lucide-react';
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

  const handleTestNotification = () => {
    if (!testPhone.trim()) {
      return;
    }
    sendTestNotification({ phone: testPhone, message: testMessage });
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

      {/* Flight Notifications Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Estado de Vuelos y Notificaciones
              </CardTitle>
              <CardDescription>
                Vuelos monitoreados y notificaciones WhatsApp pendientes
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
              <div className="text-gray-500">Cargando vuelos...</div>
            </div>
          ) : pendingFlights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay vuelos pendientes de notificación</p>
              <p className="text-sm mt-2">Los vuelos aparecerán aquí cuando se detecten aterrizajes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vuelo</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Salida Programada</TableHead>
                  <TableHead>Llegada Real</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingFlights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">{flight.flight_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="text-sm">{flight.departure_airport}</span>
                        <span className="mx-2">→</span>
                        <span className="text-sm">{flight.arrival_airport}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {flight.scheduled_departure 
                        ? format(new Date(flight.scheduled_departure), 'dd/MM/yyyy HH:mm')
                        : 'No programada'
                      }
                    </TableCell>
                    <TableCell>
                      {flight.actual_arrival 
                        ? format(new Date(flight.actual_arrival), 'dd/MM/yyyy HH:mm')
                        : 'Pendiente'
                      }
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(flight.has_landed, flight.notification_sent)}>
                        {getStatusLabel(flight.has_landed, flight.notification_sent)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!flight.has_landed && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateFlightStatus({ flightId: flight.id, hasLanded: true })}
                        >
                          Marcar Aterrizado
                        </Button>
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
