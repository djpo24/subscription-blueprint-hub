
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
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

interface TripPopoverProps {
  trips: Trip[];
  onClose: () => void;
  onAddPackage: (tripId: string) => void;
}

export function TripPopover({ trips, onClose, onAddPackage }: TripPopoverProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg">Viajes del día</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-gray-50 rounded-xl p-3 border"
            >
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
                onClick={() => {
                  onAddPackage(trip.id);
                  onClose();
                }}
                className="w-full uber-button-primary text-xs h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar Encomienda
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
