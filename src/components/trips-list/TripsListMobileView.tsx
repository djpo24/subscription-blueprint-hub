import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, MapPin, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Trip {
  id: string;
  trip_date: string | null;
  origin: string | null;
  destination: string | null;
  flight_number: string | null;
  status: string | null;
  departure_date: string | null;
  arrival_date: string | null;
  travelers?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TripsListMobileViewProps {
  trips: Trip[];
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'scheduled':
    case 'pending':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_transit':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string | null) => {
  switch (status) {
    case 'scheduled':
      return 'Programado';
    case 'pending':
      return 'Pendiente';
    case 'in_transit':
      return 'En Tránsito';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  try {
    return format(new Date(date), 'dd MMM yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export function TripsListMobileView({ trips }: TripsListMobileViewProps) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {trips.map((trip) => (
        <div 
          key={trip.id} 
          className="p-3 border border-gray-200 rounded-lg bg-white"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-sm">{formatDate(trip.trip_date)}</span>
            </div>
            <Badge className={`${getStatusColor(trip.status)} text-xs`}>
              {getStatusLabel(trip.status)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 text-blue-500" />
              <div className="flex items-center gap-1 text-sm">
                <span className="font-medium">{trip.origin || '-'}</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="font-medium">{trip.destination || '-'}</span>
              </div>
            </div>

            {trip.flight_number && (
              <div className="flex items-center gap-2">
                <Plane className="h-3 w-3 text-indigo-500" />
                <span className="text-sm font-mono">{trip.flight_number}</span>
              </div>
            )}

            {trip.travelers && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-purple-500" />
                <span className="text-sm">
                  {trip.travelers.first_name} {trip.travelers.last_name}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Salida</p>
                <p className="text-xs font-medium">{formatDate(trip.departure_date)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Llegada</p>
                <p className="text-xs font-medium">{formatDate(trip.arrival_date)}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
