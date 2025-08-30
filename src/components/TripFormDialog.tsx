
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TripFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TripFormDialog({ open, onOpenChange }: TripFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Viaje</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Formulario de nuevo viaje</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
