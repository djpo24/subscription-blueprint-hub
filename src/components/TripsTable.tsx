
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Plane, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
}

interface TripsTableProps {
  trips: Trip[];
  isLoading: boolean;
  onAddPackage: (tripId: string) => void;
}

export function TripsTable({ trips, isLoading, onAddPackage }: TripsTableProps) {
  const isMobile = useIsMobile();

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Viajes Programados</CardTitle>
          <CardDescription className="text-sm">
            Gestiona los viajes y agrega encomiendas a cada uno
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex justify-center py-8">
            <div className="text-gray-500 text-sm">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista móvil con cards
  if (isMobile) {
    return (
      <Card>
        <CardHeader className="px-3 pb-3">
          <CardTitle className="text-lg">Viajes Programados</CardTitle>
          <CardDescription className="text-sm">
            Gestiona los viajes y agrega encomiendas
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-3">
            {trips.map((trip) => (
              <Card key={trip.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-sm">
                            {format(new Date(trip.trip_date), 'dd/MM/yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{trip.origin}</span>
                          <span className="text-xs text-gray-400">→</span>
                          <span className="text-sm">{trip.destination}</span>
                        </div>
                        {trip.flight_number && (
                          <div className="flex items-center gap-2 mb-2">
                            <Plane className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{trip.flight_number}</span>
                          </div>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(trip.status)} text-xs`}>
                        {getStatusLabel(trip.status)}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => onAddPackage(trip.id)}
                      className="w-full flex items-center gap-2 h-9"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar Encomienda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista desktop con tabla
  return (
    <Card>
      <CardHeader className="px-6">
        <CardTitle className="text-xl">Viajes Programados</CardTitle>
        <CardDescription>
          Gestiona los viajes y agrega encomiendas a cada uno
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Vuelo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trips.map((trip) => (
              <TableRow key={trip.id} className="hover:bg-gray-50">
                <TableCell className="font-medium">
                  {format(new Date(trip.trip_date), 'dd/MM/yyyy')}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="text-sm">{trip.origin}</span>
                    <span className="mx-2">→</span>
                    <span className="text-sm">{trip.destination}</span>
                  </div>
                </TableCell>
                <TableCell>{trip.flight_number || 'N/A'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(trip.status)}>
                    {getStatusLabel(trip.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    onClick={() => onAddPackage(trip.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    Agregar Encomienda
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
