
import { EditPackageDialog } from '@/components/EditPackageDialog';
import { ChatDialog } from '@/components/chat/ChatDialog';

interface PackagesByDateDialogsProps {
  editDialogOpen: boolean;
  setEditDialogOpen: (open: boolean) => void;
  selectedPackage: any;
  selectedTripId: string;
  selectedDate: Date; // Agregar la fecha seleccionada
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
  selectedDate, // Recibir la fecha seleccionada
  onPackageEditSuccess,
  chatDialogOpen,
  setChatDialogOpen,
  selectedCustomerId,
  selectedCustomerName
}: PackagesByDateDialogsProps) {
  console.log('🔍 [PackagesByDateDialogs] Rendering with trip data:', {
    selectedTripId,
    selectedDate: selectedDate.toISOString(),
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
        tripDate={selectedDate} // Pasar la fecha del viaje
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
