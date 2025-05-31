
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { Bell, Plane, Send } from 'lucide-react';
import { format } from 'date-fns';

export function FlightNotificationPanel() {
  const { 
    pendingFlights, 
    isLoading, 
    processNotifications, 
    updateFlightStatus,
    isProcessing 
  } = useFlightNotifications();

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Sistema de Notificaciones Automáticas
              </CardTitle>
              <CardDescription>
                Monitoreo de vuelos y notificaciones de llegada
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
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vuelo</TableHead>
                  <TableHead>Ruta</TableHead>
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
