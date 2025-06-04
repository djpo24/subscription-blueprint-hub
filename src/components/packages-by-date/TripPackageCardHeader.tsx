
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Plane, MapPin } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TripPackageCardHeaderProps {
  trip: {
    id: string;
    origin: string;
    destination: string;
    flight_number: string | null;
  };
  onAddPackage: (tripId: string) => void;
}

export function TripPackageCardHeader({ trip, onAddPackage }: TripPackageCardHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <CardHeader className={`${isMobile ? 'px-4 pb-3' : 'px-6 pb-4'}`}>
      <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
        <div className="flex-1 min-w-0">
          <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2 mb-2`}>
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="truncate">{trip.origin} → {trip.destination}</span>
          </CardTitle>
          {trip.flight_number && (
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 flex items-center gap-2`}>
              <Plane className="h-3 w-3" />
              Vuelo: {trip.flight_number}
            </p>
          )}
        </div>
        <Button
          onClick={() => onAddPackage(trip.id)}
          size={isMobile ? "sm" : "default"}
          className={`${isMobile ? 'w-full text-xs' : 'text-sm'} flex items-center gap-2`}
        >
          <Plus className="h-3 w-3" />
          Agregar Encomienda
        </Button>
      </div>
    </CardHeader>
  );
}
