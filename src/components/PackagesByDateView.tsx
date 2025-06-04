
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { usePackagesByDate } from '@/hooks/usePackagesByDate';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TripPackageCard } from './packages-by-date/TripPackageCard';
import { PackagesByDateHeader } from './packages-by-date/PackagesByDateHeader';
import { PackagesByDateSummary } from './packages-by-date/PackagesByDateSummary';
import { EmptyTripsState } from './packages-by-date/EmptyTripsState';
import { useState } from 'react';
import { EditPackageDialog } from './EditPackageDialog';
import { ChatDialog } from './chat/ChatDialog';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatchRelations } from '@/hooks/useDispatchRelations';

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

interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: Package[];
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
  const { data: tripsData = [], isLoading } = usePackagesByDate(selectedDate);
  const { data: dispatches = [] } = useDispatchRelations(selectedDate);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const queryClient = useQueryClient();

  // Transform the data to match the expected Trip interface
  const trips: Trip[] = tripsData.map(trip => ({
    id: trip.id,
    origin: trip.origin,
    destination: trip.destination,
    flight_number: trip.flight_number,
    packages: trip.packages.map(pkg => ({
      id: pkg.id,
      tracking_number: pkg.tracking_number,
      customer_id: pkg.customer_id,
      description: pkg.description,
      weight: pkg.weight,
      freight: pkg.freight,
      amount_to_collect: pkg.amount_to_collect,
      currency: pkg.currency,
      status: pkg.status,
      customers: pkg.customers || undefined
    }))
  }));

  const handlePackageClick = (pkg: any) => {
    setSelectedPackage(pkg);
    setEditDialogOpen(true);
  };

  const handleOpenChat = (customerId: string, customerName?: string) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName || 'Cliente');
    setChatDialogOpen(true);
  };

  const handlePackageEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedPackage(null);
    
    // Invalidar las consultas para actualizar la vista
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['trips'] });
  };

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

  const handleCreateDispatch = () => {
    // TODO: Implement dispatch creation functionality
    console.log('Create dispatch for date:', selectedDate);
  };

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

  const totalPackages = trips.reduce((acc, trip) => acc + trip.packages.length, 0);
  const totalWeight = trips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.weight || 0), 0), 0
  );
  const totalFreight = trips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.freight || 0), 0), 0
  );
  const totalAmountToCollect = trips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.amount_to_collect || 0), 0), 0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      <PackagesByDateHeader 
        selectedDate={selectedDate}
        totalPackages={totalPackages}
        totalTrips={trips.length}
        dispatchCount={dispatches.length}
        onBack={onBack}
        onCreateDispatch={handleCreateDispatch}
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
                onPackageClick={handlePackageClick}
                onOpenChat={handleOpenChat}
                previewRole={previewRole}
                disableChat={disableChat}
                tripDate={selectedDate}
              />
            ))}
          </div>
        </>
      )}

      <EditPackageDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        package={selectedPackage}
        onSuccess={handlePackageEditSuccess}
      />

      <ChatDialog
        open={chatDialogOpen}
        onOpenChange={setChatDialogOpen}
        customerId={selectedCustomerId}
        customerName={selectedCustomerName}
      />
    </div>
  );
}
