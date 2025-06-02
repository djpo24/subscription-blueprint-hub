
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package } from 'lucide-react';
import { PackageItem } from './PackageItem';

interface PackageData {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface TripData {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: PackageData[];
}

interface TripPackageCardProps {
  trip: TripData;
  onAddPackage: (tripId: string) => void;
  onPackageClick: (pkg: PackageData) => void;
}

export function TripPackageCard({ trip, onAddPackage, onPackageClick }: TripPackageCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-lg">
              {trip.origin} → {trip.destination}
            </h3>
            {trip.flight_number && (
              <Badge variant="outline" className="text-xs">
                {trip.flight_number}
              </Badge>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => onAddPackage(trip.id)}
            className="flex items-center gap-1"
          >
            <Plus className="h-3 w-3" />
            Agregar Encomienda
          </Button>
        </div>
        <div className="text-sm text-gray-600">
          {trip.packages.length} encomienda{trip.packages.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      <CardContent>
        {trip.packages.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <Package className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">
              No hay encomiendas en este viaje
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {trip.packages.map((pkg) => (
              <PackageItem
                key={pkg.id}
                package={pkg}
                onClick={onPackageClick}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
