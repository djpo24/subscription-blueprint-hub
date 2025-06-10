
import { PackagesByDateContent } from './packages-by-date/PackagesByDateContent';
import { CreateDispatchDialog } from './CreateDispatchDialog';
import { PackageLabelsDialog } from './PackageLabelsDialog';
import { PackagesByDateDialogs } from './packages-by-date/PackagesByDateDialogs';
import { usePackagesByDateView } from '@/hooks/usePackagesByDateView';

interface PackagesByDateViewProps {
  selectedDate: Date;
  onBack: () => void;
  onAddPackage: (tripId: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function PackagesByDateView({ 
  selectedDate, 
  onBack, 
  onAddPackage,
  previewRole,
  disableChat = false
}: PackagesByDateViewProps) {
  const {
    trips,
    dispatches,
    isLoading,
    selectedPackage,
    selectedTripId,
    editDialogOpen,
    setEditDialogOpen,
    chatDialogOpen,
    setChatDialogOpen,
    selectedCustomerId,
    selectedCustomerName,
    createDispatchDialogOpen,
    setCreateDispatchDialogOpen,
    labelsDialogOpen,
    setLabelsDialogOpen,
    totalPackages,
    totalWeight,
    totalFreight,
    amountsByCurrency,
    handlePackageClick,
    handleOpenChat,
    handlePackageEditSuccess,
    handleCreateDispatch,
    handleOpenLabelsDialog,
    handleCreateDispatchSuccess
  } = usePackagesByDateView(selectedDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      <PackagesByDateContent
        selectedDate={selectedDate}
        trips={trips}
        dispatches={dispatches}
        totalPackages={totalPackages}
        totalWeight={totalWeight}
        totalFreight={totalFreight}
        amountsByCurrency={amountsByCurrency}
        onBack={onBack}
        onAddPackage={onAddPackage}
        onPackageClick={handlePackageClick}
        onOpenChat={handleOpenChat}
        onCreateDispatch={handleCreateDispatch}
        onOpenLabelsDialog={handleOpenLabelsDialog}
        previewRole={previewRole}
        disableChat={disableChat}
      />

      <PackagesByDateDialogs
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        selectedPackage={selectedPackage}
        selectedTripId={selectedTripId}
        selectedDate={selectedDate}
        onPackageEditSuccess={handlePackageEditSuccess}
        chatDialogOpen={chatDialogOpen}
        setChatDialogOpen={setChatDialogOpen}
        selectedCustomerId={selectedCustomerId}
        selectedCustomerName={selectedCustomerName}
      />

      <CreateDispatchDialog
        open={createDispatchDialogOpen}
        onOpenChange={setCreateDispatchDialogOpen}
        tripDate={selectedDate}
        trips={trips}
        onSuccess={handleCreateDispatchSuccess}
      />

      <PackageLabelsDialog
        open={labelsDialogOpen}
        onOpenChange={setLabelsDialogOpen}
        selectedDate={selectedDate}
        trips={trips}
      />
    </>
  );
}
