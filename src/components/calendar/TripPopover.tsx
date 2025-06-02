
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Package, ArrowLeft, Plane, Calendar } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/utils/calendarUtils';
import { usePackagesByTrip } from '@/hooks/usePackagesByTrip';

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
  onViewPackagesByDate?: (date: Date) => void;
  selectedDate: Date;
}

type ViewMode = 'trips' | 'packages';

export function TripPopover({ trips, open, onOpenChange, onAddPackage, onViewPackagesByDate, selectedDate }: TripPopoverProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('trips');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const { data: packages = [], isLoading: packagesLoading } = usePackagesByTrip(selectedTripId || '');

  const handleAddPackage = (tripId: string) => {
    onAddPackage(tripId);
    onOpenChange(false);
  };

  const handleViewPackages = (tripId: string) => {
    setSelectedTripId(tripId);
    setViewMode('packages');
  };

  const handleViewAllPackages = () => {
    if (onViewPackagesByDate) {
      onViewPackagesByDate(selectedDate);
      onOpenChange(false);
    }
  };

  const handleBackToTrips = () => {
    setViewMode('trips');
    setSelectedTripId(null);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setViewMode('trips');
      setSelectedTripId(null);
    }
    onOpenChange(open);
  };

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-2">
            {viewMode === 'packages' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToTrips}
                className="p-2 h-auto"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {viewMode === 'trips' ? 'Viajes del día' : `Encomiendas del viaje`}
            </DialogTitle>
          </div>
          {viewMode === 'packages' && selectedTrip && (
            <div className="text-sm text-gray-600 mt-2">
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                {selectedTrip.origin} → {selectedTrip.destination}
                {selectedTrip.flight_number && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {selectedTrip.flight_number}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
          {viewMode === 'trips' && (
            <>
              {/* Botón para ver todas las encomiendas del día */}
              {onViewPackagesByDate && trips.length > 0 && (
                <div className="border-b pb-3 mb-3">
                  <Button
                    variant="outline"
                    onClick={handleViewAllPackages}
                    className="w-full text-sm h-10"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Todas las Encomiendas del Día
                  </Button>
                </div>
              )}

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
                    <div className="text-gray-600 text-xs mb-3 font-medium">
                      Vuelo: {trip.flight_number}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPackages(trip.id)}
                      className="w-full text-xs h-8"
                    >
                      <Package className="h-3 w-3 mr-1" />
                      Ver Encomiendas
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleAddPackage(trip.id)}
                      className="w-full uber-button-primary text-xs h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Encomienda
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}

          {viewMode === 'packages' && (
            <>
              {packagesLoading ? (
                <div className="text-center py-4 text-gray-500">
                  Cargando encomiendas...
                </div>
              ) : packages.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 text-sm mb-4">
                    No hay encomiendas en este viaje
                  </p>
                  <Button
                    size="sm"
                    onClick={() => selectedTripId && handleAddPackage(selectedTripId)}
                    className="uber-button-primary"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Primera Encomienda
                  </Button>
                </div>
              ) : (
                <>
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-lg p-3 border shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-sm">
                          {pkg.tracking_number}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {pkg.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-1">
                        Cliente: {pkg.customers?.name || 'N/A'}
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-2">
                        {pkg.origin} → {pkg.destination}
                      </div>
                      
                      {pkg.description && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {pkg.description}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <Button
                    size="sm"
                    onClick={() => selectedTripId && handleAddPackage(selectedTripId)}
                    className="w-full uber-button-primary text-xs h-8 mt-3"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar Otra Encomienda
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
