import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
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

interface TripsListDesktopViewProps {
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
    return format(parseISO(date), 'dd MMM yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export function TripsListDesktopView({ trips }: TripsListDesktopViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead>Vuelo</TableHead>
          <TableHead>Viajero</TableHead>
          <TableHead>Salida</TableHead>
          <TableHead>Llegada</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trips.map((trip) => (
          <TableRow key={trip.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{formatDate(trip.trip_date)}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                <span>{trip.origin || '-'} → {trip.destination || '-'}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-indigo-500" />
                <span className="font-mono text-sm">{trip.flight_number || '-'}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-purple-500" />
                <span>
                  {trip.travelers 
                    ? `${trip.travelers.first_name} ${trip.travelers.last_name}`
                    : '-'
                  }
                </span>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">{formatDate(trip.departure_date)}</span>
            </TableCell>
            <TableCell>
              <span className="text-sm text-gray-600">{formatDate(trip.arrival_date)}</span>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(trip.status)}>
                {getStatusLabel(trip.status)}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
