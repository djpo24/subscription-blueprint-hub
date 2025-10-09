
import type { PackageInDispatch } from '@/types/dispatch';
import { DeliverPackageDialog } from './DeliverPackageDialog';
import { PackageInfoDialog } from './PackageInfoDialog';
import { DispatchPackagesMobile } from './DispatchPackagesMobile';
import { DispatchPackagesTableEmpty } from './DispatchPackagesTableEmpty';
import { DispatchPackagesTableDesktop } from './DispatchPackagesTableDesktop';
import { DispatchPackagesTablePagination } from './DispatchPackagesTablePagination';
import { useDispatchPackagesTableLogic } from './DispatchPackagesTableLogic';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchPackagesTableProps {
  packages: PackageInDispatch[];
}

export function DispatchPackagesTable({ packages }: DispatchPackagesTableProps) {
  const isMobile = useIsMobile();
  const {
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
    totalItems,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    startIndex,
    endIndex,
  } = useDispatchPackagesTableLogic(packages);

  if (packages.length === 0) {
    return <DispatchPackagesTableEmpty />;
  }

  // Show mobile view on mobile devices
  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          <DispatchPackagesMobile 
            packages={paginatedPackages} 
            onDeliverPackage={handleDeliverPackage}
            onPackageClick={handlePackageClick}
            hasAnyActions={hasAnyActions}
          />
          <DispatchPackagesTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={goToPage}
            onNextPage={goToNextPage}
            onPreviousPage={goToPreviousPage}
          />
        </div>
        <DeliverPackageDialog
          open={showDeliveryDialog}
          onOpenChange={setShowDeliveryDialog}
          package={selectedPackage}
        />
        <PackageInfoDialog
          open={showInfoDialog}
          onOpenChange={setShowInfoDialog}
          package={selectedPackage}
        />
      </>
    );
  }

  // Desktop table view
  return (
    <>
      <div className="space-y-4">
        <DispatchPackagesTableDesktop
          packages={paginatedPackages}
          hasAnyActions={hasAnyActions}
          onDeliverPackage={handleDeliverPackage}
          onPackageClick={handlePackageClick}
        />
        <DispatchPackagesTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={goToPage}
          onNextPage={goToNextPage}
          onPreviousPage={goToPreviousPage}
        />
      </div>

      <DeliverPackageDialog
        open={showDeliveryDialog}
        onOpenChange={setShowDeliveryDialog}
        package={selectedPackage}
      />

      <PackageInfoDialog
        open={showInfoDialog}
        onOpenChange={setShowInfoDialog}
        package={selectedPackage}
      />
    </>
  );
}
