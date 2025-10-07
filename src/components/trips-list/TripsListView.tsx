import { Card, CardContent } from '@/components/ui/card';
import { useTrips } from '@/hooks/useTrips';
import { useIsMobile } from '@/hooks/use-mobile';
import { TripsListHeader } from './TripsListHeader';
import { TripsListDesktopView } from './TripsListDesktopView';
import { TripsListMobileView } from './TripsListMobileView';
import { TripsListEmptyState } from './TripsListEmptyState';
import { Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TripsListViewProps {
  onViewTrip: (date: Date) => void;
}

type RouteFilter = 'all' | 'baq-cur' | 'cur-baq';

export function TripsListView({ onViewTrip }: TripsListViewProps) {
  const { data: trips = [], isLoading } = useTrips();
  const isMobile = useIsMobile();
  const [routeFilter, setRouteFilter] = useState<RouteFilter>('all');

  // Filtrar viajes por ruta
  const filteredTrips = useMemo(() => {
    if (routeFilter === 'all') return trips;
    
    return trips.filter(trip => {
      const origin = trip.origin?.toLowerCase() || '';
      const destination = trip.destination?.toLowerCase() || '';
      
      if (routeFilter === 'baq-cur') {
        return origin.includes('barranquilla') && destination.includes('curazao');
      } else if (routeFilter === 'cur-baq') {
        return origin.includes('curazao') && destination.includes('barranquilla');
      }
      
      return true;
    });
  }, [trips, routeFilter]);

  return (
    <Card>
      <TripsListHeader tripCount={filteredTrips.length} isMobile={isMobile} />
      
      <CardContent className={isMobile ? 'px-3 pb-4' : 'px-6 pb-6'}>
        {/* Filtro de ruta */}
        <div className="mb-4">
          <Select value={routeFilter} onValueChange={(value) => setRouteFilter(value as RouteFilter)}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Filtrar por ruta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las rutas</SelectItem>
              <SelectItem value="baq-cur">Barranquilla → Curazao</SelectItem>
              <SelectItem value="cur-baq">Curazao → Barranquilla</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTrips.length === 0 ? (
          <TripsListEmptyState isMobile={isMobile} />
        ) : isMobile ? (
          <TripsListMobileView trips={filteredTrips} onViewTrip={onViewTrip} />
        ) : (
          <TripsListDesktopView trips={filteredTrips} onViewTrip={onViewTrip} />
        )}
      </CardContent>
    </Card>
  );
}
