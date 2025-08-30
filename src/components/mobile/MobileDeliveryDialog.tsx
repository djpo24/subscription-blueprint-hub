
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface MobileDeliveryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDeliveryDialog({ isOpen, onClose }: MobileDeliveryDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Entrega Móvil</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Funcionalidad de entrega móvil en desarrollo...</p>
          <Button onClick={onClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
