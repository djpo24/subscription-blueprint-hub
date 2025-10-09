
import type { PackageInDispatch } from '@/types/dispatch';
import { DeliverPackageDialog } from './DeliverPackageDialog';
import { PackageInfoDialog } from './PackageInfoDialog';
import { DispatchPackagesMobile } from './DispatchPackagesMobile';
import { DispatchPackagesTableEmpty } from './DispatchPackagesTableEmpty';
import { DispatchPackagesTableDesktop } from './DispatchPackagesTableDesktop';
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
  } = useDispatchPackagesTableLogic(packages);

  if (packages.length === 0) {
    return <DispatchPackagesTableEmpty />;
  }

  // Show mobile view on mobile devices
  if (isMobile) {
    return (
      <>
        <DispatchPackagesMobile 
          packages={packages} 
          onDeliverPackage={handleDeliverPackage}
          onPackageClick={handlePackageClick}
          hasAnyActions={hasAnyActions}
        />
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
      <DispatchPackagesTableDesktop
        packages={packages}
        hasAnyActions={hasAnyActions}
        onDeliverPackage={handleDeliverPackage}
        onPackageClick={handlePackageClick}
      />

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
