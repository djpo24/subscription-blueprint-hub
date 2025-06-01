
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useTripForm } from '@/hooks/useTripForm';
import { TripDatePicker } from '@/components/trip/TripDatePicker';
import { TripRouteSelector } from '@/components/trip/TripRouteSelector';
import { TripFlightInput } from '@/components/trip/TripFlightInput';

interface TripDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  initialDate?: Date;
}

export function TripDialog({ open, onOpenChange, onSuccess, initialDate }: TripDialogProps) {
  const {
    formData,
    updateFormData,
    date,
    setDate,
    today,
    isLoading,
    handleSubmit
  } = useTripForm(onSuccess, initialDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] uber-dialog flex flex-col">
        <DialogHeader className="space-y-3 pb-6 flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-black">Nuevo Viaje</DialogTitle>
          <DialogDescription className="text-gray-600">
            Crea un nuevo viaje para agrupar encomiendas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4">
            <TripDatePicker
              date={date}
              onDateChange={setDate}
              today={today}
            />

            <TripRouteSelector
              value={formData.route}
              onValueChange={(value) => updateFormData({ route: value })}
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
  );
}
