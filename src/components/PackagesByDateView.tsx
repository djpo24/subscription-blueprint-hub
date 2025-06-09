
import { PackagesByDateContent } from './packages-by-date/PackagesByDateContent';
import { PackagesByDateDialogs } from './packages-by-date/PackagesByDateDialogs';
import { CreateDispatchDialog } from './CreateDispatchDialog';
import { PackageLabelsDialog } from './PackageLabelsDialog';
import { usePackagesByDateView } from '@/hooks/usePackagesByDateView';
import { getAllPackagesFromTrips } from './packages-by-date/PackagesByDateContent';

interface PackagesByDateViewProps {
  selectedDate: Date;
  onBack: () => void;
  onAddPackage: (tripId: string) => void;
  disableChat?: boolean;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function PackagesByDateView({ 
  selectedDate, 
  onBack, 
  onAddPackage, 
  disableChat = false,
  previewRole 
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
    totalAmountToCollect,
    handlePackageClick,
    handleOpenChat,
    handlePackageEditSuccess,
    handleCreateDispatch,
    handleOpenLabelsDialog,
    handleCreateDispatchSuccess,
  } = usePackagesByDateView(selectedDate);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Cargando encomiendas...</div>
      </div>
    );
  }

  const allPackages = getAllPackagesFromTrips(trips);

  return (
    <>
      <PackagesByDateContent
        selectedDate={selectedDate}
        trips={trips}
        dispatches={dispatches}
        totalPackages={totalPackages}
        totalWeight={totalWeight}
        totalFreight={totalFreight}
        totalAmountToCollect={totalAmountToCollect}
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
        selectedDate={selectedDate} // Pasar la fecha seleccionada
        onPackageEditSuccess={handlePackageEditSuccess}
        chatDialogOpen={chatDialogOpen}
        setChatDialogOpen={setChatDialogOpen}
        selectedCustomerId={selectedCustomerId}
        selectedCustomerName={selectedCustomerName}
      />

      <CreateDispatchDialog
        open={createDispatchDialogOpen}
        onOpenChange={setCreateDispatchDialogOpen}
        selectedDate={selectedDate}
        packages={allPackages}
        onSuccess={handleCreateDispatchSuccess}
      />

      <PackageLabelsDialog
        open={labelsDialogOpen}
        onOpenChange={setLabelsDialogOpen}
        packages={allPackages}
      />
    </>
  );
}
