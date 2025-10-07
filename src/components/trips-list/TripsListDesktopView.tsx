import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface TripsListDesktopViewProps {
  trips: Trip[];
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

export function TripsListDesktopView({ trips }: TripsListDesktopViewProps) {
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead>Vuelo</TableHead>
          <TableHead>Paquetes</TableHead>
          <TableHead>Peso Total</TableHead>
          <TableHead>A Cobrar</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {trips.map((trip) => {
          const stats = tripStats[trip.id] || { totalPackages: 0, totalWeight: 0, totalFreight: 0 };
          
          return (
            <TableRow key={trip.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{formatDate(trip.trip_date)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <span>{trip.origin || '-'} → {trip.destination || '-'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-indigo-500" />
                  <span className="font-mono text-sm">{trip.flight_number || '-'}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{stats.totalPackages}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-purple-500" />
                  <span>{formatWeight(stats.totalWeight)} kg</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-700">
                    {formatAmountToCollectDisplay(trip.id)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(trip.status)}>
                  {getStatusLabel(trip.status)}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
