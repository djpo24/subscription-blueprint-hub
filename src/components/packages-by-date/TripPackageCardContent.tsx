
import { CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { PackageItem } from './PackageItem';
import { useIsMobile } from '@/hooks/use-mobile';
import { isFirstPackageForCustomer } from '@/utils/customerPackageUtils';

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

interface TripPackageCardContentProps {
  packages: Package[];
  tripId: string;
  onPackageClick: (pkg: Package, tripId: string) => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
  allPackages?: Package[]; // Todos los paquetes del día para calcular primer envío
}

export function TripPackageCardContent({ 
  packages, 
  tripId,
  onPackageClick, 
  onOpenChat,
  previewRole,
  disableChat = false,
  allPackages = []
}: TripPackageCardContentProps) {
  const isMobile = useIsMobile();

  return (
    <CardContent className={`${isMobile ? 'px-3 pb-3' : 'px-6 pb-4'}`}>
      {packages.length === 0 ? (
        <div className={`text-center ${isMobile ? 'py-4' : 'py-6'} text-gray-500`}>
          <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No hay encomiendas en este viaje</p>
        </div>
      ) : (
        <div className={`${isMobile ? 'grid grid-cols-1 gap-3' : 'space-y-2'}`}>
          {packages.map((pkg) => {
            const isFirstPackage = isFirstPackageForCustomer(
              pkg.customer_id, 
              allPackages.length > 0 ? allPackages : packages
            );
            
            return (
              <PackageItem
                key={pkg.id}
                package={pkg}
                tripId={tripId}
                onPackageClick={onPackageClick}
                onOpenChat={onOpenChat}
                previewRole={previewRole}
                disableChat={disableChat}
                isFirstPackage={isFirstPackage}
              />
            );
          })}
        </div>
      )}
    </CardContent>
  );
}
