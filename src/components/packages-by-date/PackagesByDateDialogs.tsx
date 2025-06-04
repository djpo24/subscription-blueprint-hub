
import { EditPackageDialog } from '@/components/EditPackageDialog';
import { ChatDialog } from '@/components/chat/ChatDialog';

interface PackagesByDateDialogsProps {
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  selectedPackage: any;
  selectedTripId: string;
  onPackageEditSuccess: () => void;
  chatDialogOpen: boolean;
  setChatDialogOpen: (open: boolean) => void;
  selectedCustomerId: string;
  selectedCustomerName: string;
}

export function PackagesByDateDialogs({
  editDialogOpen,
  setEditDialogOpen,
  selectedPackage,
  selectedTripId,
  onPackageEditSuccess,
  chatDialogOpen,
  setChatDialogOpen,
  selectedCustomerId,
  selectedCustomerName
}: PackagesByDateDialogsProps) {
  console.log('🔍 [PackagesByDateDialogs] Rendering with trip ID:', {
    selectedTripId,
    hasPackage: !!selectedPackage,
    packageTripId: selectedPackage?.trip_id
  });

  return (
    <>
      <EditPackageDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        package={selectedPackage}
        tripId={selectedTripId}
        onSuccess={onPackageEditSuccess}
      />

      <ChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
      />
    </>
  );
}
