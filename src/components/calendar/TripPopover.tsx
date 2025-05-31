
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface TripPopoverProps {
  trips: Trip[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPackage: (tripId: string) => void;
}

export function TripPopover({ trips, open, onOpenChange, onAddPackage }: TripPopoverProps) {
  const handleAddPackage = (tripId: string) => {
    onAddPackage(tripId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Viajes del día</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
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
                onClick={() => handleAddPackage(trip.id)}
                className="w-full uber-button-primary text-xs h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar Encomienda
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
