
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Calendar, Plane } from 'lucide-react';
import { format } from 'date-fns';

interface FlightData {
  id: string;
  flight_number: string;
  status: string;
  actual_arrival: string | null;
  has_landed: boolean;
  notification_sent: boolean;
  departure_airport: string;
  arrival_airport: string;
  scheduled_departure: string | null;
  scheduled_arrival: string | null;
  actual_departure: string | null;
  airline: string;
  last_updated: string;
  created_at: string;
}

interface FlightCardProps {
  flight: FlightData;
  onUpdateFlightStatus: (params: { flightId: string; hasLanded: boolean }) => void;
}

export function FlightCard({ flight, onUpdateFlightStatus }: FlightCardProps) {
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

  const delayInfo = getDelayStatus(flight.scheduled_arrival, flight.actual_arrival);

  return (
    <Card className="border-l-4 border-l-blue-500">
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
              onClick={() => onUpdateFlightStatus({ flightId: flight.id, hasLanded: true })}
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
}
