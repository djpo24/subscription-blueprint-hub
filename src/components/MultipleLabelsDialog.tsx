
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MultiplePackageLabels } from './MultiplePackageLabels';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  amount_to_collect?: number | null;
  currency?: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface MultipleLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: Package[];
  isReprint?: boolean;
}

export function MultipleLabelsDialog({ 
  open, 
  onOpenChange, 
  packages,
  isReprint = false
}: MultipleLabelsDialogProps) {
  useEffect(() => {
    if (open && packages.length > 0) {
      console.log('🏷️ MultipleLabelsDialog abierto con:', packages.length, 'paquetes');
      console.log('🔄 Es reimpresión:', isReprint);
      packages.forEach(pkg => {
        console.log(`   - ${pkg.tracking_number}: ${pkg.status}`);
      });
    }
  }, [open, packages, isReprint]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {isReprint ? 'Reimprimir' : 'Imprimir'} Etiquetas Múltiples ({packages.length} paquetes)
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          <MultiplePackageLabels 
            packages={packages} 
            isReprint={isReprint}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
