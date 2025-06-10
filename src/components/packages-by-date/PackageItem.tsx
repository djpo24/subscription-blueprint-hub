
import { Package, User, MessageCircle, DollarSign, Weight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageStatusBadge } from '@/components/packages-table/PackageStatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { PackageItemMobile } from './PackageItemMobile';
import { PackageItemDesktop } from './PackageItemDesktop';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatWeight, formatFreight, formatAmountToCollect } from '@/utils/formatters';

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

interface PackageItemProps {
  package: Package;
  tripId: string;
  onPackageClick: (pkg: Package, tripId: string) => void;
  onOpenChat: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function PackageItem({
  package: pkg,
  tripId,
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false
}: PackageItemProps) {
  const isMobile = useIsMobile();

  const formattedPackage = {
    ...pkg,
    weight: formatWeight(pkg.weight),
    freight: formatFreight(pkg.freight),
    amount_to_collect: formatAmountToCollect(pkg.amount_to_collect)
  };

  if (isMobile) {
    return (
      <PackageItemMobile
        package={formattedPackage}
        tripId={tripId}
        onPackageClick={onPackageClick}
        onOpenChat={onOpenChat}
        previewRole={previewRole}
        disableChat={disableChat}
      />
    );
  }

  return (
    <PackageItemDesktop
      package={formattedPackage}
      tripId={tripId}
      onPackageClick={onPackageClick}
      onOpenChat={onOpenChat}
      previewRole={previewRole}
      disableChat={disableChat}
    />
  );
}
