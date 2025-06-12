
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Package, ArrowLeft, Plane, Calendar, Trash2 } from 'lucide-react';
import { getStatusColor, getStatusLabel } from '@/utils/calendarUtils';
import { usePackagesByTrip } from '@/hooks/usePackagesByTrip';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { useDeleteTrip } from '@/hooks/useDeleteTrip';

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
  previewRole?: 'admin' | 'employee' | 'traveler';
}

type ViewMode = 'trips' | 'packages';

export function TripPopover({
  trips,
  open,
  onOpenChange,
  onAddPackage,
  onViewPackagesByDate,
  selectedDate,
  previewRole
}: TripPopoverProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('trips');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  
  const {
    data: packages = [],
    isLoading: packagesLoading
  } = usePackagesByTrip(selectedTripId || '');

  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const deleteTrip = useDeleteTrip();

  const isAdmin = userRole?.role === 'admin';

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
      setDeleteDialogOpen(false);
      setTripToDelete(null);
    }
    onOpenChange(open);
  };

  const handleDeleteClick = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    setTripToDelete(trip);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (tripToDelete) {
      deleteTrip.mutate(tripToDelete.id, {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setTripToDelete(null);
          // Si solo había un viaje y se eliminó, cerrar el popover
          if (trips.length === 1) {
            onOpenChange(false);
          }
        }
      });
    }
  };

  const selectedTrip = trips.find(trip => trip.id === selectedTripId);

  return (
    <>
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

                {trips.map(trip => (
                  <div key={trip.id} className="bg-gray-50 rounded-xl p-3 border">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={`${getStatusColor(trip.status)} text-xs px-2 py-1 font-medium border rounded-full`}>
                        {getStatusLabel(trip.status)}
                      </Badge>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteClick(trip, e)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Eliminar viaje"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
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
                    {packages.map(pkg => (
                      <div key={pkg.id} className="bg-white rounded-lg p-3 border shadow-sm">
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

      {/* Dialog de confirmación para eliminar viaje */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar viaje?</AlertDialogTitle>
            <AlertDialogDescription>
              {tripToDelete && (
                <>
                  Estás a punto de eliminar el viaje <strong>{tripToDelete.origin} → {tripToDelete.destination}</strong>
                  {tripToDelete.flight_number && ` (Vuelo: ${tripToDelete.flight_number})`}.
                  <br /><br />
                  Esta acción no se puede deshacer. Solo se pueden eliminar viajes que no tengan encomiendas asociadas.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteTrip.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteTrip.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
