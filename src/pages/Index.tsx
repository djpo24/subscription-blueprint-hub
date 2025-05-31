
import { useState } from 'react';
import { Header } from '@/components/Header';
import { StatsGrid } from '@/components/StatsGrid';
import { PackagesTable } from '@/components/PackagesTable';
import { QuickActions } from '@/components/QuickActions';
import { PackageDialog } from '@/components/PackageDialog';
import { CustomerDialog } from '@/components/CustomerDialog';
import { usePackages } from '@/hooks/usePackages';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { usePackageStats } from '@/hooks/usePackageStats';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);

  // Fetch data using custom hooks
  const { data: packages = [], isLoading: packagesLoading, refetch: refetchPackages } = usePackages();
  const { data: customersCount = 0 } = useCustomersCount();
  const { data: packageStats } = usePackageStats();

  const filteredPackages = packages.filter(pkg =>
    pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customers?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewPackageClick={() => setIsPackageDialogOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StatsGrid 
          packageStats={packageStats}
          customersCount={customersCount}
        />

        <PackagesTable 
          packages={packages}
          filteredPackages={filteredPackages}
          isLoading={packagesLoading}
        />

        <QuickActions 
          onPackageClick={() => setIsPackageDialogOpen(true)}
          onCustomerClick={() => setIsCustomerDialogOpen(true)}
        />
      </main>

      {/* Dialogs */}
      <PackageDialog 
        open={isPackageDialogOpen} 
        onOpenChange={setIsPackageDialogOpen}
        onSuccess={() => {
          refetchPackages();
          setIsPackageDialogOpen(false);
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
