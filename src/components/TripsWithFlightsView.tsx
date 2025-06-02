
import { useTripsWithFlights } from '@/hooks/useTripsWithFlights';
import { TripWithFlightCard } from './trip/TripWithFlightCard';
import { useFlightNotifications } from '@/hooks/useFlightNotifications';

interface TripsWithFlightsViewProps {
  onAddPackage: (tripId: string) => void;
}

export function TripsWithFlightsView({ onAddPackage }: TripsWithFlightsViewProps) {
  const { data: trips = [], isLoading } = useTripsWithFlights();
  const { updateFlightStatus } = useFlightNotifications();

  if (isLoading) {
    return (
      <div className="flex justify-center py-6 sm:py-8">
        <div className="text-gray-500 text-sm sm:text-base">Cargando viajes y vuelos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {trips.map((trip) => (
        <TripWithFlightCard
          key={trip.id}
          trip={trip}
          onAddPackage={onAddPackage}
          onUpdateFlightStatus={updateFlightStatus}
        />
      ))}
    </div>
  );
}
