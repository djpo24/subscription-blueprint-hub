
import { useState } from 'react';
import { ArrowLeft, Plus, FileText, Tags, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PackagesByDateHeader } from './PackagesByDateHeader';
import { TripPackageCard } from './TripPackageCard';
import { PackagesByDateSummary } from './PackagesByDateSummary';
import { EmptyTripsState } from './EmptyTripsState';
import { PackageSearchBar } from '@/components/common/PackageSearchBar';
import { filterPackagesBySearchTerm } from '@/utils/packageSearchUtils';
import { Trip, Package } from './types';
import { useCustomerPackageCounts } from '@/hooks/useCustomerPackageCounts';
import { useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { TripBultosView } from './TripBultosView';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  total_packages: number;
  total_weight: number;
  total_freight: number;
  total_amount_to_collect: number;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface PackagesByDateContentProps {
  selectedDate: Date;
  trips: Trip[];
  dispatches: DispatchRelation[];
  totalPackages: number;
  totalWeight: number;
  totalFreight: number;
  amountsByCurrency: Record<string, number>; // Cambiado para soportar múltiples monedas
  onBack: () => void;
  onAddPackage: (tripId: string) => void;
  onPackageClick: (pkg: Package, tripId: string) => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  onCreateDispatch: () => void;
  onOpenLabelsDialog: () => void;
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
  amountsByCurrency,
  onBack,
  onAddPackage,
  onPackageClick,
  onOpenChat,
  onCreateDispatch,
  onOpenLabelsDialog,
  previewRole,
  disableChat = false
}: PackagesByDateContentProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const isMobile = useIsMobile();

  // Obtener todos los IDs de clientes únicos de todos los paquetes
  const uniqueCustomerIds = useMemo(() => {
    const customerIds = new Set<string>();
    trips.forEach(trip => {
      trip.packages.forEach(pkg => {
        if (pkg.customer_id) {
          customerIds.add(pkg.customer_id);
        }
      });
    });
    return Array.from(customerIds);
  }, [trips]);

  // Obtener conteos de paquetes para todos los clientes
  const { data: customerPackageCounts = {} } = useCustomerPackageCounts(uniqueCustomerIds);

  // Filtrar trips basado en el término de búsqueda
  const filteredTrips = trips.map(trip => ({
    ...trip,
    packages: filterPackagesBySearchTerm(trip.packages, searchTerm)
  })).filter(trip => trip.packages.length > 0 || !searchTerm.trim());

  // Calcular totales de los trips filtrados
  const filteredTotalPackages = filteredTrips.reduce((acc, trip) => acc + trip.packages.length, 0);
  const filteredTotalWeight = filteredTrips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.weight || 0), 0), 0
  );
  const filteredTotalFreight = filteredTrips.reduce((acc, trip) => 
    acc + trip.packages.reduce((packAcc, pkg) => packAcc + (pkg.freight || 0), 0), 0
  );
  
  // Recopilar todos los paquetes del día para calcular primer envío
  const allPackagesOfDay = trips.flatMap(trip => trip.packages);
  
  // Calcular montos filtrados por moneda
  const filteredAmountsByCurrency = filteredTrips.reduce((acc, trip) => {
    trip.packages.forEach(pkg => {
      const currency = pkg.currency || 'COP';
      const amount = pkg.amount_to_collect || 0;
      
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += amount;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4 sm:space-y-6 relative pb-20 sm:pb-0">
      <PackagesByDateHeader
        selectedDate={selectedDate}
        onBack={onBack}
        onCreateDispatch={onCreateDispatch}
        onOpenLabelsDialog={onOpenLabelsDialog}
        dispatches={dispatches}
      />

      {/* Botón flotante para móvil */}
      {isMobile && (
        <Button
          onClick={onBack}
          size="lg"
          className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg h-14 w-14 p-0 bg-primary hover:bg-primary/90"
          aria-label="Volver al calendario"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
      )}

      {/* Tabs for Paquetes and Bultos */}
      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="packages">Paquetes</TabsTrigger>
          <TabsTrigger value="bultos">Bultos</TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-4 sm:space-y-6">
          {/* Resumen de totales - movido arriba del buscador */}
          <PackagesByDateSummary
            totalPackages={searchTerm.trim() ? filteredTotalPackages : totalPackages}
            totalWeight={searchTerm.trim() ? filteredTotalWeight : totalWeight}
            totalFreight={searchTerm.trim() ? filteredTotalFreight : totalFreight}
            amountsByCurrency={searchTerm.trim() ? filteredAmountsByCurrency : amountsByCurrency}
          />

          {/* Buscador */}
          <PackageSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            className="max-w-md"
          />

          {/* Mostrar mensaje si hay búsqueda activa */}
          {searchTerm.trim() && (
            <div className="text-sm text-gray-600">
              Mostrando {filteredTotalPackages} de {totalPackages} encomiendas
            </div>
          )}

          {filteredTrips.length === 0 ? (
            searchTerm.trim() ? (
              <div className="text-center py-8">
                <div className="text-gray-500">No se encontraron encomiendas que coincidan con la búsqueda</div>
              </div>
            ) : (
              <EmptyTripsState 
                selectedDate={selectedDate}
              />
            )
          ) : (
            <div className="grid gap-4 sm:gap-6">
              {filteredTrips.map((trip) => (
                <TripPackageCard
                  key={trip.id}
                  trip={trip}
                  onAddPackage={onAddPackage}
                  onPackageClick={onPackageClick}
                  onOpenChat={onOpenChat}
                  previewRole={previewRole}
                  disableChat={disableChat}
                  tripDate={selectedDate}
                  showSummary={true}
                  customerPackageCounts={customerPackageCounts}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bultos" className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6">
            {trips.map((trip) => (
              <TripBultosView
                key={trip.id}
                tripId={trip.id}
                tripDate={selectedDate}
                origin={trip.origin}
                destination={trip.destination}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
