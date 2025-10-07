
import { Card } from '@/components/ui/card';
import { TripPackageCardHeader } from './TripPackageCardHeader';
import { TripPackageCardContent } from './TripPackageCardContent';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

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

interface TripPackageCardProps {
  trip: Trip;
  onAddPackage: (tripId: string) => void;
  onPackageClick: (pkg: Package, tripId: string) => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
  tripDate?: Date;
  showSummary?: boolean;
  allPackages?: Package[]; // Todos los paquetes del día
}

export function TripPackageCard({ 
  trip, 
  onAddPackage, 
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false,
  tripDate,
  showSummary = true,
  allPackages = []
}: TripPackageCardProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const queryClient = useQueryClient();

  const canShowChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  const handleAddPackage = (tripId: string) => {
    onAddPackage(tripId);
    
    // Invalidar las consultas relevantes después de un pequeño delay
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', tripId] });
      
      if (tripDate) {
        const formattedDate = format(tripDate, 'yyyy-MM-dd');
        queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
      }
      
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }, 500);
  };

  const handlePackageClick = (pkg: Package, tripId: string) => {
    // Pass the trip ID along with the package
    onPackageClick(pkg, tripId);
    
    // Invalidar después de la edición de paquetes
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', trip.id] });
      if (tripDate) {
        const formattedDate = format(tripDate, 'yyyy-MM-dd');
        queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
      }
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    }, 500);
  };

  return (
    <Card className="border border-gray-200">
      <TripPackageCardHeader 
        trip={trip}
        onAddPackage={handleAddPackage}
      />
      
      <TripPackageCardContent
        packages={trip.packages}
        tripId={trip.id}
        onPackageClick={handlePackageClick}
        onOpenChat={canShowChat ? onOpenChat : undefined}
        previewRole={previewRole}
        disableChat={disableChat}
        allPackages={allPackages}
      />
    </Card>
  );
}
