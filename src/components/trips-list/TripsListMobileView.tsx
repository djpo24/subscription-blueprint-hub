import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Calendar, MapPin, Package, Weight, DollarSign } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useTripPackageStats } from '@/hooks/useTripPackageStats';
import { formatAmountToCollectWithCurrency, parseCurrencyString } from '@/utils/currencyFormatter';
import { formatWeight } from './tripListUtils';
import { formatNumberWithThousandsSeparator } from '@/utils/numberFormatter';

interface Trip {
  id: string;
  trip_date: string | null;
  origin: string | null;
  destination: string | null;
  flight_number: string | null;
  status: string | null;
  travelers?: {
    first_name: string;
    last_name: string;
  } | null;
}

interface TripsListMobileViewProps {
  trips: Trip[];
  onViewTrip: (date: Date) => void;
}

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'scheduled':
    case 'pending':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'in_transit':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: string | null) => {
  switch (status) {
    case 'scheduled':
      return 'Programado';
    case 'pending':
      return 'Pendiente';
    case 'in_transit':
      return 'En Tránsito';
    case 'completed':
      return 'Completado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Desconocido';
  }
};

const formatDate = (date: string | null) => {
  if (!date) return '-';
  try {
    return format(parseISO(date), 'dd MMM yyyy', { locale: es });
  } catch {
    return '-';
  }
};

export function TripsListMobileView({ trips, onViewTrip }: TripsListMobileViewProps) {
  const { data: tripStats = {} } = useTripPackageStats();

  const formatAmountToCollectDisplay = (tripId: string) => {
    const stats = tripStats[tripId];
    if (!stats || !stats.amountsByCurrency || Object.keys(stats.amountsByCurrency).length === 0) {
      return '---';
    }

    const currencies = Object.keys(stats.amountsByCurrency);
    if (currencies.length === 1) {
      const currency = currencies[0];
      const amount = stats.amountsByCurrency[currency];
      const parsedCurrency = parseCurrencyString(currency);
      return formatAmountToCollectWithCurrency(amount, parsedCurrency);
    }

    const primaryCurrency = currencies[0];
    const amount = stats.amountsByCurrency[primaryCurrency];
    const parsedCurrency = parseCurrencyString(primaryCurrency);
    const formattedAmount = formatAmountToCollectWithCurrency(amount, parsedCurrency);
    
    return currencies.length > 1 ? `${formattedAmount} (+${currencies.length - 1} más)` : formattedAmount;
  };

  return (
    <div className="space-y-3">
      {trips.map((trip) => {
        const stats = tripStats[trip.id] || { totalPackages: 0, totalWeight: 0, totalFreight: 0 };
        
        return (
          <Card 
            key={trip.id} 
            className="border border-gray-200 cursor-pointer hover:bg-gray-50 active:bg-gray-100"
            onClick={() => {
              if (trip.trip_date) {
                onViewTrip(parseISO(trip.trip_date));
              }
            }}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-sm">
                        {formatDate(trip.trip_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-3 w-3 text-blue-500" />
                      <span className="text-sm">
                        {trip.origin || '-'} → {trip.destination || '-'}
                      </span>
                    </div>
                    {trip.flight_number && (
                      <div className="flex items-center gap-2">
                        <Plane className="h-3 w-3 text-indigo-500" />
                        <span className="text-xs font-mono">{trip.flight_number}</span>
                      </div>
                    )}
                  </div>
                  <Badge className={`${getStatusColor(trip.status)} text-xs`}>
                    {getStatusLabel(trip.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3 text-blue-500" />
                    <span>{stats.totalPackages} paquetes</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Weight className="h-3 w-3 text-purple-500" />
                    <span>{formatWeight(stats.totalWeight)} kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">A Cobrar:</span>
                    <span className="text-sm font-medium text-green-600">
                      {formatAmountToCollectDisplay(trip.id)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
