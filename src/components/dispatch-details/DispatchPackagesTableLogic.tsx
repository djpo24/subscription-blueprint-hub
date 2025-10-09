
import { useState } from 'react';
import type { PackageInDispatch } from '@/types/dispatch';
import { canDeliverPackage } from './DispatchPackagesTableUtils';

export function useDispatchPackagesTableLogic(packages: PackageInDispatch[]) {
  const [selectedPackage, setSelectedPackage] = useState<PackageInDispatch | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  // Verificar si algún paquete tiene acciones disponibles
  const hasAnyActions = packages.some(pkg => canDeliverPackage(pkg.status));

  const handleDeliverPackage = (pkg: PackageInDispatch) => {
    setSelectedPackage(pkg);
    setShowDeliveryDialog(true);
  };

  const handlePackageClick = (pkg: PackageInDispatch) => {
    setSelectedPackage(pkg);
    setShowInfoDialog(true);
  };

  return {
    selectedPackage,
    showDeliveryDialog,
    setShowDeliveryDialog,
    showInfoDialog,
    setShowInfoDialog,
    hasAnyActions,
    handleDeliverPackage,
    handlePackageClick,
  };
}
