
import { Badge } from '@/components/ui/badge';
import { Package2 } from 'lucide-react';

interface PackageDispatchBadgeProps {
  dispatchNumber?: number;
  totalDispatches?: number;
}

export function PackageDispatchBadge({ dispatchNumber, totalDispatches }: PackageDispatchBadgeProps) {
  if (!dispatchNumber || !totalDispatches) {
    return null;
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 border-purple-200 font-medium">
      <Package2 className="h-3 w-3" />
      Despacho {dispatchNumber}/{totalDispatches}
    </Badge>
  );
}
