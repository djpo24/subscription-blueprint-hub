
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Plane } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FlightCard } from '../flight/FlightCard';
import { FlightData } from '@/types/flight';

interface TripWithFlightCardProps {
  trip: {
    id: string;
    trip_date: string;
    origin: string;
    destination: string;
    flight_number: string | null;
    status: string;
    flight_data?: FlightData | null;
  };
  onAddPackage: (tripId: string) => void;
  onUpdateFlightStatus?: (params: { flightId: string; hasLanded: boolean }) => void;
}

export function TripWithFlightCard({ trip, onAddPackage, onUpdateFlightStatus }: TripWithFlightCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En Progreso";
      case "scheduled":
        return "Programado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  // Formatear la fecha correctamente para evitar problemas de zona horaria
  const formatTripDate = (dateString: string) => {
    // Si la fecha es solo YYYY-MM-DD, agregar T00:00:00 para evitar problemas de UTC
    const normalizedDate = dateString.includes('T') ? dateString : `${dateString}T00:00:00`;
    return format(parseISO(normalizedDate), 'dd/MM/yyyy');
  };

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {formatTripDate(trip.trip_date)} - {trip.origin} → {trip.destination}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(trip.status)}>
                {getStatusLabel(trip.status)}
              </Badge>
              {trip.flight_number && (
                <Badge variant="outline">
                  Vuelo: {trip.flight_number}
                </Badge>
              )}
            </div>
          </div>
          <Button 
            size="sm" 
            onClick={() => onAddPackage(trip.id)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Agregar Encomienda
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {trip.flight_data ? (
          <div className="mt-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Información del Vuelo
            </h4>
            <FlightCard 
              flight={trip.flight_data} 
              onUpdateFlightStatus={onUpdateFlightStatus || (() => {})}
            />
          </div>
        ) : trip.flight_number ? (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Información de vuelo no disponible para {trip.flight_number}
            </p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              No se ha asignado número de vuelo a este viaje
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
