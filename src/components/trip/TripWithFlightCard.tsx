
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Plane, MapPin, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { FlightCard } from '../flight/FlightCard';
import { FlightData } from '@/types/flight';
import { useTripActions } from '@/hooks/useTripActions';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
  const { 
    markTripAsArrived, 
    isMarkingAsArrived 
  } = useTripActions();

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

  const handleMarkAsArrived = () => {
    markTripAsArrived(trip.id);
  };

  // Solo mostrar el botón de "Marcar como Llegado" si el viaje está en progreso o el vuelo ha aterrizado
  const canMarkAsArrived = trip.status === 'in_progress' || 
    (trip.flight_data?.has_landed && trip.status !== 'completed');

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className={`${isMobile ? 'px-3 pb-3' : 'px-6 pb-4'}`}>
        <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
          <div className="flex-1 min-w-0">
            <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} leading-tight`}>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{formatTripDate(trip.trip_date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-normal">{trip.origin} → {trip.destination}</span>
              </div>
            </CardTitle>
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'items-center gap-2'} mt-2`}>
              <Badge className={`${getStatusColor(trip.status)} ${isMobile ? 'self-start' : ''} text-xs`}>
                {getStatusLabel(trip.status)}
              </Badge>
              {trip.flight_number && (
                <Badge variant="outline" className={`${isMobile ? 'self-start' : ''} text-xs`}>
                  <Plane className="h-3 w-3 mr-1" />
                  {trip.flight_number}
                </Badge>
              )}
            </div>
          </div>
          
          <div className={`${isMobile ? 'flex flex-col gap-2' : 'flex gap-2'}`}>
            {canMarkAsArrived && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handleMarkAsArrived}
                disabled={isMarkingAsArrived}
                className={`${isMobile ? 'w-full' : ''} flex items-center gap-1 text-xs`}
              >
                <MapPin className="h-3 w-3" />
                {isMarkingAsArrived ? 'Marcando...' : 'Marcar como Llegado'}
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => onAddPackage(trip.id)}
              className={`${isMobile ? 'w-full' : ''} flex items-center gap-1 text-xs`}
            >
              <Plus className="h-3 w-3" />
              Agregar Encomienda
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'px-3 pb-3' : 'px-6 pb-4'}`}>
        {trip.flight_data ? (
          <div className="mt-4">
            <h4 className={`font-medium ${isMobile ? 'mb-2 text-sm' : 'mb-3'} flex items-center gap-2`}>
              <Plane className="h-4 w-4" />
              Información del Vuelo
            </h4>
            <FlightCard 
              flight={trip.flight_data} 
              onUpdateFlightStatus={onUpdateFlightStatus || (() => {})}
            />
          </div>
        ) : trip.flight_number ? (
          <div className={`mt-4 p-3 bg-gray-50 rounded-lg`}>
            <p className="text-sm text-gray-600">
              Información de vuelo no disponible para {trip.flight_number}
            </p>
          </div>
        ) : (
          <div className={`mt-4 p-3 bg-gray-50 rounded-lg`}>
            <p className="text-sm text-gray-600">
              No se ha asignado número de vuelo a este viaje
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
