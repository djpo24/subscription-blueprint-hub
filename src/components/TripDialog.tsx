
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTripForm } from '@/hooks/useTripForm';
import { TripDatePicker } from '@/components/trip/TripDatePicker';
import { TripRouteSelector } from '@/components/trip/TripRouteSelector';
import { TripFlightInput } from '@/components/trip/TripFlightInput';
import { TravelerSelector } from '@/components/TravelerSelector';
import { TravelerDialog } from '@/components/TravelerDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialDate?: Date;
}

export function TripDialog({ open, onOpenChange, onSuccess, initialDate }: TripDialogProps) {
  const [travelerDialogOpen, setTravelerDialogOpen] = useState(false);
  
  const {
    formData,
    updateFormData,
    date,
    setDate,
    today,
    isLoading,
    handleSubmit
  } = useTripForm(onSuccess, initialDate);

  const isDatePreselected = !!initialDate;
  const displayDate = isDatePreselected ? initialDate : date;

  const handleNewTravelerSuccess = (travelerId: string) => {
    updateFormData({ traveler_id: travelerId });
    setTravelerDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] uber-dialog flex flex-col">
          <DialogHeader className="space-y-3 pb-6 flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-black">Nuevo Viaje</DialogTitle>
            <DialogDescription className="text-gray-600">
              {isDatePreselected && displayDate
                ? `Crea un nuevo viaje para el ${format(displayDate, 'dd/MM/yyyy', { locale: es })}`
                : "Crea un nuevo viaje para agrupar encomiendas."
              }
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4">
              {isDatePreselected ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">
                    Fecha del Viaje
                  </label>
                  <div className="w-full h-12 px-3 py-2 bg-gray-100 border rounded-lg flex items-center text-gray-700">
                    {displayDate ? format(displayDate, 'dd/MM/yyyy', { locale: es }) : 'Fecha no válida'}
                  </div>
                </div>
              ) : (
                <TripDatePicker
                  date={date}
                  onDateChange={setDate}
                  today={today}
                />
              )}

              <TripRouteSelector
                value={formData.route}
                onValueChange={(value) => updateFormData({ route: value })}
              />

              <TravelerSelector
                selectedTravelerId={formData.traveler_id}
                onTravelerChange={(value) => updateFormData({ traveler_id: value })}
                onAddNewTraveler={() => setTravelerDialogOpen(true)}
              />

              <TripFlightInput
                value={formData.flight_number}
                onValueChange={(value) => updateFormData({ flight_number: value })}
              />
            </div>

            <DialogFooter className="gap-3 pt-6 flex-shrink-0">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 uber-button-primary"
              >
                {isLoading ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <TravelerDialog
        open={travelerDialogOpen}
        onOpenChange={setTravelerDialogOpen}
        onSuccess={handleNewTravelerSuccess}
      />
    </>
  );
}
