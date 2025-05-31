
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/utils/calendarUtils';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
}

interface TripCardProps {
  trip: Trip;
  onAddPackage: (tripId: string) => void;
}

export function TripCard({ trip, onAddPackage }: TripCardProps) {
  return (
    <div className="bg-gray-100 rounded-xl p-3 border shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <Badge className={`${getStatusColor(trip.status)} text-xs px-2 py-1 font-medium border rounded-full`}>
          {getStatusLabel(trip.status)}
        </Badge>
      </div>
      
      <div className="font-bold text-black text-sm mb-2">
        {trip.origin} → {trip.destination}
      </div>
      
      {trip.flight_number && (
        <div className="text-gray-600 text-xs mb-2 font-medium">
          Vuelo: {trip.flight_number}
        </div>
      )}
      
      <Button
        size="sm"
        onClick={() => onAddPackage(trip.id)}
        className="w-full uber-button-primary text-xs h-8"
      >
        <Plus className="h-3 w-3 mr-1" />
        Agregar Encomienda
      </Button>
    </div>
  );
}
