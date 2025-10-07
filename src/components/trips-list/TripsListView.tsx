import { Card, CardContent } from '@/components/ui/card';
import { useTrips } from '@/hooks/useTrips';
import { useIsMobile } from '@/hooks/use-mobile';
import { TripsListHeader } from './TripsListHeader';
import { TripsListDesktopView } from './TripsListDesktopView';
import { TripsListMobileView } from './TripsListMobileView';
import { TripsListEmptyState } from './TripsListEmptyState';
import { Loader2 } from 'lucide-react';

interface TripsListViewProps {
  onViewTrip: (date: Date) => void;
}

export function TripsListView({ onViewTrip }: TripsListViewProps) {
  const { data: trips = [], isLoading } = useTrips();
  const isMobile = useIsMobile();

  return (
    <Card>
      <TripsListHeader tripCount={trips.length} isMobile={isMobile} />
      
      <CardContent className={isMobile ? 'px-3 pb-4' : 'px-6 pb-6'}>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : trips.length === 0 ? (
          <TripsListEmptyState isMobile={isMobile} />
        ) : isMobile ? (
          <TripsListMobileView trips={trips} onViewTrip={onViewTrip} />
        ) : (
          <TripsListDesktopView trips={trips} onViewTrip={onViewTrip} />
        )}
      </CardContent>
    </Card>
  );
}
