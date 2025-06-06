
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PackageLabel } from './PackageLabel';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageLabelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package | null;
}

export function PackageLabelDialog({ open, onOpenChange, package: pkg }: PackageLabelDialogProps) {
  if (!pkg) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Etiqueta de Encomienda</DialogTitle>
          <DialogDescription>
            Etiqueta para imprimir de la encomienda {pkg.tracking_number}
          </DialogDescription>
        </DialogHeader>
        
        <PackageLabel package={pkg} />
      </DialogContent>
    </Dialog>
  );
}
