
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { DeliverPackageForm } from './DeliverPackageForm';
import { useIsMobile } from '@/hooks/use-mobile';
import type { PackageInDispatch } from '@/types/dispatch';

interface DeliverPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageInDispatch | null;
}

export function DeliverPackageDialog({ 
  open, 
  onOpenChange, 
  package: pkg 
}: DeliverPackageDialogProps) {
  const isMobile = useIsMobile();

  if (!pkg) return null;

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[95vh]' : 'max-w-4xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Entregar Paquete - {pkg.tracking_number}
          </DialogTitle>
        </DialogHeader>

        <DeliverPackageForm
          package={pkg}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
