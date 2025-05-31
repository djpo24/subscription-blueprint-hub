
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plane } from 'lucide-react';
import { FlightCard } from './FlightCard';
import { useUpcomingFlights } from '@/hooks/useUpcomingFlights';

export function UpcomingFlightsCard() {
  const { data: upcomingFlights = [], isLoading } = useUpcomingFlights();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Próximos Vuelos
        </CardTitle>
        <CardDescription>
          Los próximos 2 vuelos programados desde hoy
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando vuelos próximos...</div>
          </div>
        ) : upcomingFlights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay vuelos programados próximamente</p>
          </div>
        ) : (
          <div className="space-y-6">
            {upcomingFlights.map((flight) => (
              <FlightCard 
                key={flight.id} 
                flight={flight} 
                onUpdateFlightStatus={() => {}} // Read-only for upcoming flights
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
