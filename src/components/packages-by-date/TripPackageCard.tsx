
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Package, Weight, DollarSign, MessageSquare } from 'lucide-react';
import { PackageItem } from './PackageItem';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  status: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: Package[];
}

interface TripPackageCardProps {
  trip: Trip;
  onAddPackage: (tripId: string) => void;
  onPackageClick: (pkg: Package) => void;
  onOpenChat?: (customerId: string, customerName?: string) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
  disableChat?: boolean;
}

export function TripPackageCard({ 
  trip, 
  onAddPackage, 
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false
}: TripPackageCardProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);

  const totals = trip.packages.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  const canShowChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">
              {trip.origin} → {trip.destination}
            </CardTitle>
            {trip.flight_number && (
              <p className="text-sm text-gray-600 mt-1">
                Vuelo: {trip.flight_number}
              </p>
            )}
          </div>
          <Button
            onClick={() => onAddPackage(trip.id)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Agregar Encomienda
          </Button>
        </div>
        
        {/* Resumen de totales */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Package className="h-4 w-4 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-blue-800">{trip.packages.length}</div>
              <div className="text-xs text-blue-600">Paquetes</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
            <Weight className="h-4 w-4 text-purple-600" />
            <div>
              <div className="text-lg font-bold text-purple-800">{totals.weight} kg</div>
              <div className="text-xs text-purple-600">Peso Total</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-orange-600" />
            <div>
              <div className="text-lg font-bold text-orange-800">{formatCurrency(totals.freight)}</div>
              <div className="text-xs text-orange-600">Flete Total</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <div className="text-lg font-bold text-green-800">{formatCurrency(totals.amount_to_collect)}</div>
              <div className="text-xs text-green-600">A Cobrar</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {trip.packages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No hay encomiendas en este viaje
          </div>
        ) : (
          <div className="space-y-2">
            {trip.packages.map((pkg) => (
              <PackageItem
                key={pkg.id}
                package={pkg}
                onClick={() => onPackageClick(pkg)}
                onOpenChat={canShowChat ? onOpenChat : undefined}
                previewRole={previewRole}
                disableChat={disableChat}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
