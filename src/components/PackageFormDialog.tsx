
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PackageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PackageFormDialog({ open, onOpenChange }: PackageFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Encomienda</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <p>Formulario de nueva encomienda</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
