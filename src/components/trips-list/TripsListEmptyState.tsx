import { Plane } from 'lucide-react';

interface TripsListEmptyStateProps {
  isMobile: boolean;
}

export function TripsListEmptyState({ isMobile }: TripsListEmptyStateProps) {
  return (
    <div className={`text-center ${isMobile ? 'py-8' : 'py-12'} text-muted-foreground`}>
      <Plane className={`${isMobile ? 'h-12 w-12' : 'h-16 w-16'} mx-auto mb-4 text-muted`} />
      <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>
        No hay viajes registrados
      </p>
      <p className={`${isMobile ? 'text-xs' : 'text-sm'} mt-2`}>
        Los viajes aparecerán aquí una vez creados
      </p>
    </div>
  );
}
