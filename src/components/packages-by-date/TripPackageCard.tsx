
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Package, Plane, MapPin } from 'lucide-react';
import { PackageItem } from './PackageItem';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { useIsMobile } from '@/hooks/use-mobile';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
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
}

export function TripPackageCard({ 
  trip, 
  onAddPackage, 
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false
}: TripPackageCardProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const isMobile = useIsMobile();

  const canShowChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  return (
    <Card className="border border-gray-200">
      <CardHeader className={`${isMobile ? 'px-4 pb-3' : 'px-6 pb-4'}`}>
        <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
          <div className="flex-1 min-w-0">
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2 mb-2`}>
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="truncate">{trip.origin} → {trip.destination}</span>
            </CardTitle>
            {trip.flight_number && (
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 flex items-center gap-2`}>
                <Plane className="h-3 w-3" />
                Vuelo: {trip.flight_number}
              </p>
            )}
          </div>
          <Button
            onClick={() => onAddPackage(trip.id)}
            size={isMobile ? "sm" : "default"}
            className={`${isMobile ? 'w-full text-xs' : 'text-sm'} flex items-center gap-2`}
          >
            <Plus className="h-3 w-3" />
            Agregar Encomienda
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'px-4 pb-3' : 'px-6 pb-4'}`}>
        {trip.packages.length === 0 ? (
          <div className={`text-center ${isMobile ? 'py-4' : 'py-6'} text-gray-500`}>
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay encomiendas en este viaje</p>
          </div>
        ) : (
          <div className={`${isMobile ? 'space-y-2' : 'space-y-2'}`}>
            {trip.packages.map((pkg) => (
              <PackageItem
                key={pkg.id}
                package={pkg}
                onClick={() => onPackageClick(pkg)}
                onOpenChat={canShowChat ? onOpenChat : undefined}
                previewRole={previewRole}
                disableChat={disableChat}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
