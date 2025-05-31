
import { getStatusColor } from '@/utils/calendarUtils';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
}

interface TripIndicatorProps {
  trips: Trip[];
  onShowPopover: () => void;
}

export function TripIndicator({ trips, onShowPopover }: TripIndicatorProps) {
  console.log('TripIndicator rendering with trips:', trips);

  // Agrupar viajes por estado para mostrar círculos de diferentes colores
  const tripsByStatus = trips.reduce((acc, trip) => {
    if (!acc[trip.status]) acc[trip.status] = [];
    acc[trip.status].push(trip);
    return acc;
  }, {} as Record<string, Trip[]>);

  const getIndicatorColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "scheduled":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-1">
        {Object.entries(tripsByStatus).map(([status, statusTrips]) => 
          statusTrips.map((trip, index) => (
            <button
              key={`${status}-${trip.id}-${index}`}
              onClick={onShowPopover}
              className={`w-3 h-3 rounded-full ${getIndicatorColor(status)} hover:scale-110 transition-transform cursor-pointer`}
              title={`${trip.flight_number || 'Sin vuelo'} - ${trip.origin} → ${trip.destination} (${status})`}
            />
          ))
        )}
      </div>
      
      {trips.length > 6 && (
        <button
          onClick={onShowPopover}
          className="text-xs text-gray-600 hover:text-black transition-colors"
        >
          +{trips.length - 6} más
        </button>
      )}
    </div>
  );
}
