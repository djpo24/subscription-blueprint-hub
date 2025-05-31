
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MultiplePackageSelector } from './MultiplePackageSelector';
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
  customers?: {
    name: string;
    email: string;
  };
}

interface MultipleLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packages: Package[];
}

export function MultipleLabelsDialog({ open, onOpenChange, packages }: MultipleLabelsDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<Package[]>([]);
  const [showLabels, setShowLabels] = useState(false);

  const handlePrintSelected = (packages: Package[]) => {
    setSelectedPackages(packages);
    setShowLabels(true);
  };

  const handleBackToSelection = () => {
    setShowLabels(false);
    setSelectedPackages([]);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setShowLabels(false);
      setSelectedPackages([]);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {showLabels ? 'Etiquetas para Imprimir' : 'Seleccionar Etiquetas'}
          </DialogTitle>
          <DialogDescription>
            {showLabels 
              ? `Vista previa de ${selectedPackages.length} etiqueta${selectedPackages.length !== 1 ? 's' : ''} seleccionada${selectedPackages.length !== 1 ? 's' : ''}`
              : 'Selecciona las encomiendas para las que deseas imprimir etiquetas'
            }
          </DialogDescription>
        </DialogHeader>
        
        {showLabels ? (
          <div>
            <button
              onClick={handleBackToSelection}
              className="mb-4 text-blue-600 hover:text-blue-800 underline"
            >
              ← Volver a la selección
            </button>
            <MultiplePackageLabels packages={selectedPackages} />
          </div>
        ) : (
          <MultiplePackageSelector 
            packages={packages}
            onPrintSelected={handlePrintSelected}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
