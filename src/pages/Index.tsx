
import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsGrid } from '@/components/StatsGrid';
import { PackagesTable } from '@/components/PackagesTable';
import { CalendarView } from '@/components/CalendarView';
import { QuickActions } from '@/components/QuickActions';
import { PackageDialog } from '@/components/PackageDialog';
import { TripDialog } from '@/components/TripDialog';
import { CustomerDialog } from '@/components/CustomerDialog';
import { usePackages } from '@/hooks/usePackages';
import { useTrips } from '@/hooks/useTrips';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { usePackageStats } from '@/hooks/usePackageStats';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isTripDialogOpen, setIsTripDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();

  // Fetch data using custom hooks
  const { data: packages = [], isLoading: packagesLoading, refetch: refetchPackages } = usePackages();
  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { data: customersCount = 0 } = useCustomersCount();
  const { data: packageStats } = usePackageStats();

  const filteredPackages = packages.filter(pkg =>
    pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPackageToTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setIsPackageDialogOpen(true);
  };

  const handleCreateTrip = () => {
    setIsTripDialogOpen(true);
  };

  const handleCreatePackage = () => {
    setSelectedTripId(undefined);
    setIsPackageDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewPackageClick={handleCreatePackage}
      />

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <StatsGrid 
          packageStats={packageStats}
          customersCount={customersCount}
        />

        <div className="mt-8">
          <CalendarView 
            trips={trips}
            isLoading={tripsLoading}
            onAddPackage={handleAddPackageToTrip}
          />
        </div>

        <div className="mt-8">
          <PackagesTable 
            packages={packages}
            filteredPackages={filteredPackages}
            isLoading={packagesLoading}
          />
        </div>

        <QuickActions 
          onPackageClick={handleCreatePackage}
          onCustomerClick={() => setIsCustomerDialogOpen(true)}
          onTripClick={handleCreateTrip}
        />
      </main>

      {/* Dialogs */}
      <TripDialog 
        open={isTripDialogOpen} 
        onOpenChange={setIsTripDialogOpen}
        onSuccess={() => {
          refetchTrips();
          setIsTripDialogOpen(false);
        }}
      />
      <PackageDialog 
        open={isPackageDialogOpen} 
        onOpenChange={setIsPackageDialogOpen}
        tripId={selectedTripId}
        onSuccess={() => {
          refetchPackages();
          setIsPackageDialogOpen(false);
          setSelectedTripId(undefined);
        }}
      />
      <CustomerDialog 
        open={isCustomerDialogOpen} 
        onOpenChange={setIsCustomerDialogOpen}
      />
    </div>
  );
};

export default Index;
