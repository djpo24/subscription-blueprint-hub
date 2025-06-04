
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePackagesByDateView } from '@/hooks/usePackagesByDateView';
import { PackagesByDateContent } from './packages-by-date/PackagesByDateContent';
import { PackagesByDateDialogs } from './packages-by-date/PackagesByDateDialogs';

// Define a local Package type that matches what TripPackageCard expects
interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: 'COP' | 'AWG';
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

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
    totalPackages,
    totalWeight,
    totalFreight,
    totalAmountToCollect,
    handlePackageClick,
    handleOpenChat,
    handlePackageEditSuccess,
    handleCreateDispatch
  } = usePackagesByDateView(selectedDate);

  if (isLoading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al Calendario
          </Button>
        </div>
        <div className="flex justify-center py-8">
          <div className="text-gray-500">Cargando encomiendas...</div>
        </div>
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
        totalAmountToCollect={totalAmountToCollect}
        onBack={onBack}
        onAddPackage={onAddPackage}
        onPackageClick={handlePackageClick}
        onOpenChat={handleOpenChat}
        onCreateDispatch={handleCreateDispatch}
        previewRole={previewRole}
        disableChat={disableChat}
      />

      <PackagesByDateDialogs
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        selectedPackage={selectedPackage}
        selectedTripId={selectedTripId}
        onPackageEditSuccess={handlePackageEditSuccess}
        chatDialogOpen={chatDialogOpen}
        setChatDialogOpen={setChatDialogOpen}
        selectedCustomerId={selectedCustomerId}
        selectedCustomerName={selectedCustomerName}
      />
    </>
  );
}
