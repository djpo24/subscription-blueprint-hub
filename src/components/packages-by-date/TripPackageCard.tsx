
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Boxes } from 'lucide-react';
import { PackageItem } from './PackageItem';

interface PackageData {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  batch_id?: string | null;
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
  onCreateBatch?: (tripId: string) => void;
}

export function TripPackageCard({ trip, onAddPackage, onPackageClick, onCreateBatch }: TripPackageCardProps) {
  // Group packages by batch status
  const packagesWithBatch = trip.packages.filter(pkg => pkg.batch_id);
  const packagesWithoutBatch = trip.packages.filter(pkg => !pkg.batch_id);

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
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => onAddPackage(trip.id)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Agregar Encomienda
            </Button>
            {onCreateBatch && packagesWithoutBatch.length > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCreateBatch(trip.id)}
                className="flex items-center gap-1"
              >
                <Boxes className="h-3 w-3" />
                Crear Bulto
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{trip.packages.length} encomienda{trip.packages.length !== 1 ? 's' : ''}</span>
          {packagesWithBatch.length > 0 && (
            <span className="text-green-600">
              {packagesWithBatch.length} en bultos
            </span>
          )}
          {packagesWithoutBatch.length > 0 && (
            <span className="text-orange-600">
              {packagesWithoutBatch.length} sin asignar
            </span>
          )}
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
          <div className="space-y-4">
            {/* Packages without batch */}
            {packagesWithoutBatch.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-sm text-orange-700">
                    Encomiendas sin asignar a bulto ({packagesWithoutBatch.length})
                  </h4>
                </div>
                <div className="grid gap-3">
                  {packagesWithoutBatch.map((pkg) => (
                    <PackageItem
                      key={pkg.id}
                      package={pkg}
                      onClick={onPackageClick}
                      showBatchStatus={true}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Packages with batch */}
            {packagesWithBatch.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-sm text-green-700">
                    Encomiendas en bultos ({packagesWithBatch.length})
                  </h4>
                </div>
                <div className="grid gap-3">
                  {packagesWithBatch.map((pkg) => (
                    <PackageItem
                      key={pkg.id}
                      package={pkg}
                      onClick={onPackageClick}
                      showBatchStatus={true}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
