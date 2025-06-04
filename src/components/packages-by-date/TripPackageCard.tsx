
import { Card } from '@/components/ui/card';
import { TripPackageCardHeader } from './TripPackageCardHeader';
import { TripPackageCardSummary } from './TripPackageCardSummary';
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
  onPackageClick: (pkg: Package) => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
  tripDate?: Date;
}

export function TripPackageCard({ 
  trip, 
  onAddPackage, 
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false,
  tripDate
}: TripPackageCardProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const queryClient = useQueryClient();

  // Agrupar totales por moneda
  const totalsByCurrency = trip.packages.reduce(
    (acc, pkg) => {
      const currency = pkg.currency || 'COP';
      if (!acc[currency]) {
        acc[currency] = { weight: 0, freight: 0, amount_to_collect: 0 };
      }
      acc[currency].weight += pkg.weight || 0;
      acc[currency].freight += pkg.freight || 0;
      acc[currency].amount_to_collect += pkg.amount_to_collect || 0;
      return acc;
    },
    {} as Record<Currency, { weight: number; freight: number; amount_to_collect: number }>
  );

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

  const handlePackageClick = (pkg: Package) => {
    onPackageClick(pkg);
    
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
      
      <div className="px-4 sm:px-6">
        <TripPackageCardSummary 
          packageCount={trip.packages.length}
          totalsByCurrency={totalsByCurrency}
        />
      </div>
      
      <TripPackageCardContent
        packages={trip.packages}
        onPackageClick={handlePackageClick}
        onOpenChat={canShowChat ? onOpenChat : undefined}
        previewRole={previewRole}
        disableChat={disableChat}
      />
    </Card>
  );
}
