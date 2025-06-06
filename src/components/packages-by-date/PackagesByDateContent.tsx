import { PackagesByDateHeader } from './PackagesByDateHeader';
import { EmptyTripsState } from './EmptyTripsState';
import { TripPackageCard } from './TripPackageCard';
import { TripPackageCardSummary } from './TripPackageCardSummary';
import { usePackagePaymentsByTrip } from '@/hooks/usePackagePaymentsByTrip';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  onPackageClick: (pkg: Package, tripId: string) => void;
  onOpenChat: (customerId: string, customerName?: string) => void;
  onCreateDispatch: () => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

// Componente para mostrar el resumen de un viaje individual
function TripSummaryContainer({ trip, children }: { trip: Trip; children: React.ReactNode }) {
  const { data: paymentData, error: paymentError, isLoading } = usePackagePaymentsByTrip(trip.id);

  // Calcular totales para este viaje específico
  const totalWeight = trip.packages.reduce((acc, pkg) => acc + (pkg.weight || 0), 0);
  const totalFreight = trip.packages.reduce((acc, pkg) => acc + (pkg.freight || 0), 0);
  
  // Usar los datos de pagos del hook para separar pendientes y cobrados
  const pendingAmountByCurrency = paymentData?.pending || {};
  const collectedAmountByCurrency = paymentData?.collected || {};

  console.log('🔍 TripSummaryContainer data:', {
    tripId: trip.id,
    paymentData,
    paymentError,
    isLoading,
    pendingAmountByCurrency,
    collectedAmountByCurrency
  });

  if (paymentError) {
    console.error('❌ Error loading payment data for trip:', trip.id, paymentError);
  }

  return (
    <div className="space-y-4">
      {/* Mostrar error si hay problemas con los pagos */}
      {paymentError && (
        <Alert variant="destructive">
          <AlertDescription>
            Error cargando datos de pagos: {paymentError.message}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Cajas de resumen fuera del contenedor del viaje */}
      <TripPackageCardSummary 
        packageCount={trip.packages.length}
        totalWeight={totalWeight}
        totalFreight={totalFreight}
        pendingAmountByCurrency={pendingAmountByCurrency as Record<Currency, number>}
        collectedAmountByCurrency={collectedAmountByCurrency as Record<Currency, number>}
      />
      
      {/* Contenedor del viaje */}
      {children}
    </div>
  );
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
      queryClient.invalidateQueries({ queryKey: ['package-payments-by-trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }, 500);
  };

  // Recopilar todos los paquetes de todos los viajes para el diálogo de despacho
  const allPackages = trips.flatMap(trip => 
    trip.packages.map(pkg => ({
      id: pkg.id,
      tracking_number: pkg.tracking_number,
      origin: trip.origin,
      destination: trip.destination,
      status: pkg.status,
      description: pkg.description,
      weight: pkg.weight,
      freight: pkg.freight,
      amount_to_collect: pkg.amount_to_collect,
      customers: pkg.customers
    }))
  );

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
        <div className="space-y-4 sm:space-y-6">
          {trips.map((trip) => (
            <TripSummaryContainer key={trip.id} trip={trip}>
              <TripPackageCard
                trip={trip}
                onAddPackage={handleAddPackageWithRefresh}
                onPackageClick={onPackageClick}
                onOpenChat={onOpenChat}
                previewRole={previewRole}
                disableChat={disableChat}
                tripDate={selectedDate}
                showSummary={false}
              />
            </TripSummaryContainer>
          ))}
        </div>
      )}
    </div>
  );
}

// Exportar la función para obtener todos los paquetes
export function getAllPackagesFromTrips(trips: Trip[]) {
  return trips.flatMap(trip => 
    trip.packages.map(pkg => ({
      id: pkg.id,
      tracking_number: pkg.tracking_number,
      origin: trip.origin,
      destination: trip.destination,
      status: pkg.status,
      description: pkg.description,
      weight: pkg.weight,
      freight: pkg.freight,
      amount_to_collect: pkg.amount_to_collect,
      customers: pkg.customers
    }))
  );
}
