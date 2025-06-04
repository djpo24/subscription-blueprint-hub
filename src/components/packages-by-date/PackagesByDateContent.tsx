import { PackagesByDateHeader } from './PackagesByDateHeader';
import { EmptyTripsState } from './EmptyTripsState';
import { TripPackageCard } from './TripPackageCard';
import { TripPackageCardSummary } from './TripPackageCardSummary';
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
          {trips.map((trip) => {
            // Calcular totales para este viaje específico
            const totalWeight = trip.packages.reduce((acc, pkg) => acc + (pkg.weight || 0), 0);
            const totalFreight = trip.packages.reduce((acc, pkg) => acc + (pkg.freight || 0), 0);
            
            // Agrupar solo los montos a cobrar por moneda
            const amountToCollectByCurrency = trip.packages.reduce(
              (acc, pkg) => {
                if (pkg.amount_to_collect && pkg.amount_to_collect > 0) {
                  const currency = pkg.currency || 'COP';
                  if (!acc[currency]) {
                    acc[currency] = 0;
                  }
                  acc[currency] += pkg.amount_to_collect;
                }
                return acc;
              },
              {} as Record<Currency, number>
            );

            return (
              <div key={trip.id} className="space-y-4">
                {/* Cajas de resumen fuera del contenedor del viaje */}
                <TripPackageCardSummary 
                  packageCount={trip.packages.length}
                  totalWeight={totalWeight}
                  totalFreight={totalFreight}
                  amountToCollectByCurrency={amountToCollectByCurrency}
                />
                
                {/* Contenedor del viaje */}
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
              </div>
            );
          })}
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
