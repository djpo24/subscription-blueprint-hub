
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
  const { data: trips = [], isLoading } = usePackagesByDate(selectedDate);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedCustomerName, setSelectedCustomerName] = useState<string>('');
  const queryClient = useQueryClient();

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <PackagesByDateHeader 
        selectedDate={selectedDate}
        onBack={onBack}
      />

      {trips.length === 0 ? (
        <EmptyTripsState selectedDate={selectedDate} />
      ) : (
        <>
          <PackagesByDateSummary 
            totalTrips={trips.length}
            totalPackages={totalPackages}
            selectedDate={selectedDate}
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
