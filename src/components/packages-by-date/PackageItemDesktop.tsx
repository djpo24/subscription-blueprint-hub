
import { Package, User, MessageCircle, DollarSign, Weight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageStatusBadge } from '@/components/packages-table/PackageStatusBadge';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatNumberWithThousandsSeparator } from '@/utils/numberFormatter';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: string;
  freight: string;
  amount_to_collect: string;
  currency: Currency;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageItemDesktopProps {
  package: Package;
  tripId: string;
  onPackageClick: (pkg: any, tripId: string) => void;
  onOpenChat: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function PackageItemDesktop({
  package: pkg,
  tripId,
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false
}: PackageItemDesktopProps) {
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
      className="grid grid-cols-12 gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 bg-white items-center"
      onClick={handleClick}
    >
      <div className="col-span-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          <span className="font-mono text-sm font-medium">{pkg.tracking_number}</span>
        </div>
      </div>

      <div className="col-span-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700 truncate">
            {pkg.customers?.name || 'Cliente no encontrado'}
          </span>
        </div>
      </div>

      <div className="col-span-2">
        <p className="text-sm text-gray-600 line-clamp-1">{pkg.description}</p>
      </div>

      <div className="col-span-1 text-center">
        <div className="flex items-center justify-center gap-1">
          <Weight className="h-3 w-3 text-purple-600" />
          <span className="text-sm">{formatNumberWithThousandsSeparator(pkg.weight)} kg</span>
        </div>
      </div>

      <div className="col-span-1 text-center">
        <div className="flex items-center justify-center gap-1">
          <Truck className="h-3 w-3 text-orange-600" />
          <span className="text-sm">${formatNumberWithThousandsSeparator(pkg.freight)}</span>
        </div>
      </div>

      <div className="col-span-1 text-center">
        <div className="flex items-center justify-center gap-1">
          <DollarSign className="h-3 w-3 text-green-600" />
          <span className="text-sm">{formatCurrency(parseFloat(pkg.amount_to_collect), pkg.currency)}</span>
        </div>
      </div>

      <div className="col-span-1">
        <PackageStatusBadge status={pkg.status} />
      </div>

      <div className="col-span-1">
        {canChat && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleChatClick}
            className="h-8 w-full"
          >
            <MessageCircle className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
