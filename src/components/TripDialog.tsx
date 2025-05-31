
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
}

export function TripDialog({ open, onOpenChange, onSuccess }: TripDialogProps) {
  const {
    formData,
    updateFormData,
    date,
    setDate,
    today,
    isLoading,
    handleSubmit
  } = useTripForm(onSuccess);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] uber-dialog">
        <DialogHeader className="space-y-3 pb-6">
          <DialogTitle className="text-2xl font-bold text-black">Nuevo Viaje</DialogTitle>
          <DialogDescription className="text-gray-600">
            Crea un nuevo viaje para agrupar encomiendas.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
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

          <DialogFooter className="gap-3 pt-6">
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
