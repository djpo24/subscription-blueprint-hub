
import { EditPackageDialog } from '@/components/EditPackageDialog';
import { ChatDialog } from '@/components/chat/ChatDialog';

interface PackagesByDateDialogsProps {
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  selectedPackage: any;
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
  onPackageEditSuccess,
  chatDialogOpen,
  setChatDialogOpen,
  selectedCustomerId,
  selectedCustomerName
}: PackagesByDateDialogsProps) {
  return (
    <>
      <EditPackageDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        package={selectedPackage}
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
