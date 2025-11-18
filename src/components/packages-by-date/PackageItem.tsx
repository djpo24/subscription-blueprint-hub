
import { Package, User, MessageCircle, DollarSign, Weight, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PackageStatusBadge } from '@/components/packages-table/PackageStatusBadge';
import { useIsMobile } from '@/hooks/use-mobile';
import { PackageItemMobile } from './PackageItemMobile';
import { PackageItemDesktop } from './PackageItemDesktop';
import { formatWeight } from '@/utils/formatters';
import { formatNumberWithThousandsSeparator } from '@/utils/numberFormatter';

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
  discount_applied?: number | null;
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
  isFirstPackage?: boolean;
}

export function PackageItem({
  package: pkg,
  tripId,
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false,
  isFirstPackage = false
}: PackageItemProps) {
  const isMobile = useIsMobile();

  const formattedPackage = {
    ...pkg,
    weight: formatWeight(pkg.weight),
    freight: pkg.freight ? formatNumberWithThousandsSeparator(pkg.freight) : '0',
    // Cambio: mantener amount_to_collect como número para que el formato funcione correctamente
    amount_to_collect: pkg.amount_to_collect
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
        isFirstPackage={isFirstPackage}
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
      isFirstPackage={isFirstPackage}
    />
  );
}
