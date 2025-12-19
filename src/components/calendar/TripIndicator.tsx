
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

  // Para móvil, mostrar máximo 2 viajes con info de ruta
  const visibleTrips = trips.slice(0, 2);
  const remainingCount = trips.length - 2;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onShowPopover();
      }}
      className="w-full text-left"
    >
      {/* Vista móvil: rutas abreviadas verticales */}
      <div className="flex flex-col gap-1 md:hidden">
        {visibleTrips.map((trip) => (
          <div
            key={trip.id}
            className="flex items-center gap-1 text-[9px] leading-tight"
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${getIndicatorColor(trip.status)}`} />
            <span className="truncate text-gray-700 font-medium">
              {trip.origin.slice(0, 3).toUpperCase()}→{trip.destination.slice(0, 3).toUpperCase()}
            </span>
          </div>
        ))}
        {remainingCount > 0 && (
          <span className="text-[9px] text-gray-500 font-medium">
            +{remainingCount} más
          </span>
        )}
      </div>

      {/* Vista desktop: círculos más grandes */}
      <div className="hidden md:flex flex-wrap gap-1.5">
        {trips.slice(0, 6).map((trip, index) => (
          <span
            key={`${trip.id}-${index}`}
            className={`w-3.5 h-3.5 rounded-full ${getIndicatorColor(trip.status)} hover:scale-125 transition-transform`}
            title={`${trip.flight_number || 'Sin vuelo'} - ${trip.origin} → ${trip.destination} (${trip.status})`}
          />
        ))}
        {trips.length > 6 && (
          <span className="text-xs text-gray-600 font-medium">
            +{trips.length - 6}
          </span>
        )}
      </div>
    </button>
  );
}
