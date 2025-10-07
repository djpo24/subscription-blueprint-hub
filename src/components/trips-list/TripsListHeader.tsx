import { CardHeader, CardTitle } from '@/components/ui/card';
import { Plane } from 'lucide-react';

interface TripsListHeaderProps {
  tripCount: number;
  isMobile: boolean;
}

export function TripsListHeader({ tripCount, isMobile }: TripsListHeaderProps) {
  if (isMobile) {
    return (
      <CardHeader className="px-3 py-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Plane className="h-4 w-4 text-primary" />
          <span>Todos los Viajes</span>
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            ({tripCount})
          </span>
        </CardTitle>
      </CardHeader>
    );
  }

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Plane className="h-5 w-5 text-primary" />
        <span>Todos los Viajes</span>
        <span className="ml-auto text-base font-normal text-muted-foreground">
          Total: {tripCount} viajes
        </span>
      </CardTitle>
    </CardHeader>
  );
}
