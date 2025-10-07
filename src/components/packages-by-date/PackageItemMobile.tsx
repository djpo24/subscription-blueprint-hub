
import { Package, User, MessageCircle, DollarSign, Weight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageStatusBadge } from '@/components/packages-table/PackageStatusBadge';
import { formatAmountToCollectWithCurrency } from '@/utils/currencyFormatter';
import { FirstPackageBadge } from '@/components/badges/FirstPackageBadge';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: string;
  freight: string;
  amount_to_collect: number | null; // Cambio: mantener como número
  currency: Currency;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageItemMobileProps {
  package: Package;
  tripId: string;
  onPackageClick: (pkg: any, tripId: string) => void;
  onOpenChat: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
  isFirstPackage?: boolean;
}

export function PackageItemMobile({
  package: pkg,
  tripId,
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false,
  isFirstPackage = false
}: PackageItemMobileProps) {
  const handleClick = () => {
    onPackageClick(pkg, tripId);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenChat(pkg.customer_id, pkg.customers?.name);
  };

  const canChat = !disableChat && previewRole !== 'traveler';

  return (
    <div 
      className="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-white"
      onClick={handleClick}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          <span className="font-mono text-sm font-medium">{pkg.tracking_number}</span>
        </div>
        <PackageStatusBadge status={pkg.status} />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3 text-gray-500" />
          <span className="text-sm text-gray-700">
            {pkg.customers?.name || 'Cliente no encontrado'}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Weight className="h-3 w-3 text-purple-600" />
            <span>{pkg.weight} kg</span>
          </div>
          <div className="flex items-center gap-1">
            <Truck className="h-3 w-3 text-orange-600" />
            <span>${pkg.freight}</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-green-600" />
            <span>{formatAmountToCollectWithCurrency(pkg.amount_to_collect, pkg.currency)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div>
            {isFirstPackage && <FirstPackageBadge />}
          </div>
          {canChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleChatClick}
              className="h-8 px-3"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Chat
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
