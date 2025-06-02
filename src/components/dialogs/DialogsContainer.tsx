
import { PackageDialog } from '@/components/PackageDialog';
import { TripDialog } from '@/components/TripDialog';

interface DialogsContainerProps {
  packageDialogOpen: boolean;
  setPackageDialogOpen: (open: boolean) => void;
  onPackageSuccess: () => void;
  selectedTripId?: string;
  tripDialogOpen: boolean;
  onTripDialogChange: (open: boolean) => void;
  onTripSuccess: () => void;
  selectedDate?: Date;
}

export function DialogsContainer({
  packageDialogOpen,
  setPackageDialogOpen,
  onPackageSuccess,
  selectedTripId,
  tripDialogOpen,
  onTripDialogChange,
  onTripSuccess,
  selectedDate,
}: DialogsContainerProps) {
  return (
    <>
      <PackageDialog
        open={packageDialogOpen}
        onOpenChange={setPackageDialogOpen}
        onSuccess={onPackageSuccess}
        tripId={selectedTripId}
      />

      <TripDialog
        open={tripDialogOpen}
        onOpenChange={onTripDialogChange}
        onSuccess={onTripSuccess}
        initialDate={selectedDate}
      />
    </>
  );
}
