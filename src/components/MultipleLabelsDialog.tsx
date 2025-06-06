
import { useState, useEffect } from 'react';
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

  console.log('MultipleLabelsDialog - Total packages received:', packages.length);
  console.log('MultipleLabelsDialog - Selected packages:', selectedPackages.length);
  console.log('MultipleLabelsDialog - Show labels:', showLabels);

  // Si ya hay paquetes pre-seleccionados, ir directamente a las etiquetas
  useEffect(() => {
    if (open && packages.length > 0) {
      console.log('MultipleLabelsDialog - Auto-selecting pre-selected packages:', packages.length);
      setSelectedPackages(packages);
      setShowLabels(true);
    }
  }, [open, packages]);

  const handlePrintSelected = (packages: Package[]) => {
    console.log('MultipleLabelsDialog - handlePrintSelected called with packages:', packages.length);
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
            {/* Solo mostrar el botón de volver si no hay paquetes pre-seleccionados */}
            {packages.length === 0 && (
              <button
                onClick={handleBackToSelection}
                className="mb-4 text-blue-600 hover:text-blue-800 underline"
              >
                ← Volver a la selección
              </button>
            )}
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
