
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { usePackagesByDate } from '@/hooks/usePackagesByDate';
import { useDispatchRelations } from '@/hooks/useDispatchRelations';
import { CreateDispatchDialog } from './CreateDispatchDialog';
import { EditPackageDialog } from './EditPackageDialog';
import { PackagesByDateHeader } from './packages-by-date/PackagesByDateHeader';
import { PackagesByDateSummary } from './packages-by-date/PackagesByDateSummary';
import { TripPackageCard } from './packages-by-date/TripPackageCard';
import { EmptyTripsState } from './packages-by-date/EmptyTripsState';

interface PackagesByDateViewProps {
  selectedDate: Date;
  onBack: () => void;
  onAddPackage: (tripId: string) => void;
}

export function PackagesByDateView({ selectedDate, onBack, onAddPackage }: PackagesByDateViewProps) {
  const [showCreateDispatch, setShowCreateDispatch] = useState(false);
  const [editPackageDialogOpen, setEditPackageDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const { data: packagesByTrip = [], isLoading, refetch } = usePackagesByDate(selectedDate);
  const { data: dispatches = [] } = useDispatchRelations(selectedDate);

  const handlePackageClick = (pkg: any) => {
    // Ensure the package has the correct structure for the EditPackageDialog
    const packageWithCorrectStructure = {
      id: pkg.id,
      tracking_number: pkg.tracking_number,
      customer_id: pkg.customer_id,
      trip_id: pkg.trip_id,
      description: pkg.description,
      weight: pkg.weight,
      freight: pkg.freight,
      amount_to_collect: pkg.amount_to_collect,
      status: pkg.status
    };
    
    console.log('Package structure for edit dialog:', packageWithCorrectStructure);
    setSelectedPackage(packageWithCorrectStructure);
    setEditPackageDialogOpen(true);
  };

  const handleEditPackageSuccess = () => {
    setEditPackageDialogOpen(false);
    setSelectedPackage(null);
    refetch();
  };

  const handleCreateDispatchSuccess = () => {
    setShowCreateDispatch(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <PackagesByDateHeader
            selectedDate={selectedDate}
            totalPackages={0}
            totalTrips={0}
            dispatchCount={0}
            onBack={onBack}
            onCreateDispatch={() => {}}
          />
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Cargando encomiendas del día...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPackages = packagesByTrip.reduce((total, trip) => total + trip.packages.length, 0);
  const allPackages = packagesByTrip.flatMap(trip => trip.packages);

  // Calcular totales generales
  const grandTotals = allPackages.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  return (
    <>
      <Card>
        <CardHeader>
          <PackagesByDateHeader
            selectedDate={selectedDate}
            totalPackages={totalPackages}
            totalTrips={packagesByTrip.length}
            dispatchCount={dispatches.length}
            onBack={onBack}
            onCreateDispatch={() => setShowCreateDispatch(true)}
          />

          <PackagesByDateSummary
            totalPackages={totalPackages}
            totalWeight={grandTotals.weight}
            totalFreight={grandTotals.freight}
            totalAmountToCollect={grandTotals.amount_to_collect}
          />
        </CardHeader>
        <CardContent className="space-y-6">
          {packagesByTrip.length === 0 ? (
            <EmptyTripsState selectedDate={selectedDate} />
          ) : (
            packagesByTrip.map((trip) => (
              <TripPackageCard
                key={trip.id}
                trip={trip}
                onAddPackage={onAddPackage}
                onPackageClick={handlePackageClick}
              />
            ))
          )}
        </CardContent>
      </Card>

      <CreateDispatchDialog
        open={showCreateDispatch}
        onOpenChange={setShowCreateDispatch}
        tripDate={selectedDate}
        packages={allPackages}
        onSuccess={handleCreateDispatchSuccess}
      />

      <EditPackageDialog
        open={editPackageDialogOpen}
        onOpenChange={setEditPackageDialogOpen}
        package={selectedPackage}
        onSuccess={handleEditPackageSuccess}
      />
    </>
  );
}
