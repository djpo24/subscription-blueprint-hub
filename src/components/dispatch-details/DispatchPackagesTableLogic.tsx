
import { useState, useMemo } from 'react';
import type { PackageInDispatch } from '@/types/dispatch';
import { canDeliverPackage } from './DispatchPackagesTableUtils';

const ITEMS_PER_PAGE = 50;

export function useDispatchPackagesTableLogic(packages: PackageInDispatch[]) {
  const [selectedPackage, setSelectedPackage] = useState<PackageInDispatch | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Calcular paginación
  const totalPages = Math.ceil(packages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  const paginatedPackages = useMemo(() => {
    return packages.slice(startIndex, endIndex);
  }, [packages, startIndex, endIndex]);

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

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
    paginatedPackages,
    currentPage,
    totalPages,
    totalItems: packages.length,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    startIndex: startIndex + 1,
    endIndex: Math.min(endIndex, packages.length),
  };
}
