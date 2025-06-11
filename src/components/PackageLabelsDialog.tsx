
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { PackageLabelDialog } from './PackageLabelDialog';
import { MultipleLabelsDialog } from './MultipleLabelsDialog';
import { PackageLabelsDialogHeader } from './package-labels-dialog/PackageLabelsDialogHeader';
import { PackageLabelsDialogTabs } from './package-labels-dialog/PackageLabelsDialogTabs';
import {
  PackageLabelsDialogProps,
  PackageLabelsDialogState,
  PackageWithRoute
} from './package-labels-dialog/PackageLabelsDialogTypes';

export function PackageLabelsDialog({ open, onOpenChange, tripDate, trips }: PackageLabelsDialogProps) {
  const [state, setState] = useState<PackageLabelsDialogState>({
    selectedPackageIds: new Set(),
    selectedPrintedPackageIds: new Set(),
    singleLabelOpen: false,
    multipleLabelOpen: false,
    selectedPackageForLabel: null,
    packagesForMultipleLabels: []
  });

  // Obtener todos los paquetes de todos los viajes
  const allPackages: PackageWithRoute[] = trips.flatMap(trip => 
    trip.packages.map(pkg => ({
      ...pkg,
      origin: trip.origin,
      destination: trip.destination,
      flight_number: trip.flight_number,
      created_at: new Date().toISOString()
    }))
  );

  console.log('PackageLabelsDialog - All packages count:', allPackages.length);
  console.log('PackageLabelsDialog - Selected package IDs:', state.selectedPackageIds.size);
  console.log('PackageLabelsDialog - Selected printed package IDs:', state.selectedPrintedPackageIds.size);

  // Actualizar la lógica de filtrado para los paquetes impresos
  const pendingPackages = allPackages.filter(pkg => 
    pkg.status === 'recibido'
  );
  
  const printedPackages = allPackages.filter(pkg => 
    pkg.status === 'procesado' || pkg.status === 'transito' || pkg.status === 'en_destino' || pkg.status === 'delivered'
  );

  const handlePrintSingleLabel = (packageData: PackageWithRoute) => {
    setState(prev => ({
      ...prev,
      selectedPackageForLabel: packageData,
      singleLabelOpen: true
    }));
  };

  const handlePackageToggle = (packageId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPackageIds);
      if (newSelected.has(packageId)) {
        newSelected.delete(packageId);
      } else {
        newSelected.add(packageId);
      }
      console.log('PackageLabelsDialog - Package toggled:', packageId, 'New selection size:', newSelected.size);
      return { ...prev, selectedPackageIds: newSelected };
    });
  };

  const handlePrintedPackageToggle = (packageId: string) => {
    setState(prev => {
      const newSelected = new Set(prev.selectedPrintedPackageIds);
      if (newSelected.has(packageId)) {
        newSelected.delete(packageId);
      } else {
        newSelected.add(packageId);
      }
      console.log('PackageLabelsDialog - Printed package toggled:', packageId, 'New selection size:', newSelected.size);
      return { ...prev, selectedPrintedPackageIds: newSelected };
    });
  };

  const handleSelectAll = (packages: PackageWithRoute[]) => {
    setState(prev => {
      const packageIds = packages.map(pkg => pkg.id);
      if (packageIds.every(id => prev.selectedPackageIds.has(id))) {
        const newSelected = new Set(prev.selectedPackageIds);
        packageIds.forEach(id => newSelected.delete(id));
        return { ...prev, selectedPackageIds: newSelected };
      } else {
        const newSelected = new Set(prev.selectedPackageIds);
        packageIds.forEach(id => newSelected.add(id));
        return { ...prev, selectedPackageIds: newSelected };
      }
    });
  };

  const handleSelectAllPrinted = (packages: PackageWithRoute[]) => {
    setState(prev => {
      const packageIds = packages.map(pkg => pkg.id);
      if (packageIds.every(id => prev.selectedPrintedPackageIds.has(id))) {
        const newSelected = new Set(prev.selectedPrintedPackageIds);
        packageIds.forEach(id => newSelected.delete(id));
        return { ...prev, selectedPrintedPackageIds: newSelected };
      } else {
        const newSelected = new Set(prev.selectedPrintedPackageIds);
        packageIds.forEach(id => newSelected.add(id));
        return { ...prev, selectedPrintedPackageIds: newSelected };
      }
    });
  };

  const handlePrintSelected = () => {
    const selectedPackages = allPackages.filter(pkg => state.selectedPackageIds.has(pkg.id));
    console.log('PackageLabelsDialog - handlePrintSelected - Selected packages count:', selectedPackages.length);
    
    if (selectedPackages.length > 0) {
      setState(prev => ({
        ...prev,
        packagesForMultipleLabels: selectedPackages,
        multipleLabelOpen: true
      }));
    }
  };

  const handleReprintSelected = () => {
    const selectedPackages = allPackages.filter(pkg => state.selectedPrintedPackageIds.has(pkg.id));
    console.log('PackageLabelsDialog - handleReprintSelected - Selected packages count:', selectedPackages.length);
    
    if (selectedPackages.length > 0) {
      setState(prev => ({
        ...prev,
        packagesForMultipleLabels: selectedPackages,
        multipleLabelOpen: true
      }));
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <PackageLabelsDialogHeader
            selectedPackageIds={state.selectedPackageIds}
            selectedPrintedPackageIds={state.selectedPrintedPackageIds}
            onPrintSelected={handlePrintSelected}
            onReprintSelected={handleReprintSelected}
          />

          <PackageLabelsDialogTabs
            pendingPackages={pendingPackages}
            printedPackages={printedPackages}
            selectedPackageIds={state.selectedPackageIds}
            selectedPrintedPackageIds={state.selectedPrintedPackageIds}
            onPackageToggle={handlePackageToggle}
            onPrintedPackageToggle={handlePrintedPackageToggle}
            onSelectAll={handleSelectAll}
            onSelectAllPrinted={handleSelectAllPrinted}
            onPrintSingleLabel={handlePrintSingleLabel}
          />
        </DialogContent>
      </Dialog>

      <PackageLabelDialog
        open={state.singleLabelOpen}
        onOpenChange={(open) => setState(prev => ({ ...prev, singleLabelOpen: open }))}
        package={state.selectedPackageForLabel}
      />

      <MultipleLabelsDialog
        open={state.multipleLabelOpen}
        onOpenChange={(open) => setState(prev => ({ ...prev, multipleLabelOpen: open }))}
        packages={state.packagesForMultipleLabels}
      />
    </>
  );
}
