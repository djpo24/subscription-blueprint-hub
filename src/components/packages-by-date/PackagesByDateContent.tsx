
import { PackagesByDateHeader } from './PackagesByDateHeader';
import { PackagesByDateSummary } from './PackagesByDateSummary';
import { EmptyTripsState } from './EmptyTripsState';
import { TripPackageCard } from './TripPackageCard';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: Package[];
}

interface PackagesByDateContentProps {
  selectedDate: Date;
  trips: Trip[];
  dispatches: any[];
  totalPackages: number;
  totalWeight: number;
  totalFreight: number;
  totalAmountToCollect: number;
  onBack: () => void;
  onAddPackage: (tripId: string) => void;
  onPackageClick: (pkg: Package) => void;
  onOpenChat: (customerId: string, customerName?: string) => void;
  onCreateDispatch: () => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function PackagesByDateContent({
  selectedDate,
  trips,
  dispatches,
  totalPackages,
  totalWeight,
  totalFreight,
  totalAmountToCollect,
  onBack,
  onAddPackage,
  onPackageClick,
  onOpenChat,
  onCreateDispatch,
  previewRole,
  disableChat = false
}: PackagesByDateContentProps) {
  const queryClient = useQueryClient();

  const handleAddPackageWithRefresh = (tripId: string) => {
    onAddPackage(tripId);
    
    // Después de crear la encomienda, invalidar las consultas
    setTimeout(() => {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }, 500);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <PackagesByDateHeader 
        selectedDate={selectedDate}
        totalPackages={totalPackages}
        totalTrips={trips.length}
        dispatchCount={dispatches.length}
        onBack={onBack}
        onCreateDispatch={onCreateDispatch}
      />

      {trips.length === 0 ? (
        <EmptyTripsState selectedDate={selectedDate} />
      ) : (
        <>
          <PackagesByDateSummary 
            totalPackages={totalPackages}
            totalWeight={totalWeight}
            totalFreight={totalFreight}
            totalAmountToCollect={totalAmountToCollect}
          />

          <div className="space-y-4 sm:space-y-6">
            {trips.map((trip) => (
              <TripPackageCard
                key={trip.id}
                trip={trip}
                onAddPackage={handleAddPackageWithRefresh}
                onPackageClick={onPackageClick}
                onOpenChat={onOpenChat}
                previewRole={previewRole}
                disableChat={disableChat}
                tripDate={selectedDate}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
