
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Package, Weight, DollarSign, MessageSquare, Plane, MapPin } from 'lucide-react';
import { PackageItem } from './PackageItem';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { formatCurrency } from '@/utils/currencyFormatter';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
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
  tripDate?: Date; // Para invalidar las consultas correctas
}

export function TripPackageCard({ 
  trip, 
  onAddPackage, 
  onPackageClick,
  onOpenChat,
  previewRole,
  disableChat = false,
  tripDate
}: TripPackageCardProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  // Agrupar totales por moneda
  const totalsByCurrency = trip.packages.reduce(
    (acc, pkg) => {
      const currency = pkg.currency || 'COP';
      if (!acc[currency]) {
        acc[currency] = { weight: 0, freight: 0, amount_to_collect: 0 };
      }
      acc[currency].weight += pkg.weight || 0;
      acc[currency].freight += pkg.freight || 0;
      acc[currency].amount_to_collect += pkg.amount_to_collect || 0;
      return acc;
    },
    {} as Record<Currency, { weight: number; freight: number; amount_to_collect: number }>
  );

  const canShowChat = !disableChat && userRole?.role === 'admin' && onOpenChat;

  const handleAddPackage = (tripId: string) => {
    onAddPackage(tripId);
    
    // Invalidar las consultas relevantes después de un pequeño delay
    // para permitir que el diálogo se cierre y la encomienda se cree
    setTimeout(() => {
      // Invalidar consultas específicas del viaje
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', tripId] });
      
      // Si tenemos la fecha del viaje, invalidar también las consultas por fecha
      if (tripDate) {
        const formattedDate = format(tripDate, 'yyyy-MM-dd');
        queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
      }
      
      // Invalidar consultas generales de paquetes
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      
      // Invalidar viajes para actualizar contadores
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }, 500);
  };

  const handlePackageClick = (pkg: Package) => {
    onPackageClick(pkg);
    
    // Invalidar después de la edición de paquetes
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', trip.id] });
      if (tripDate) {
        const formattedDate = format(tripDate, 'yyyy-MM-dd');
        queryClient.invalidateQueries({ queryKey: ['packages-by-date', formattedDate] });
      }
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    }, 500);
  };

  return (
    <Card className="border border-gray-200">
      <CardHeader className={`${isMobile ? 'px-4 pb-3' : 'px-6 pb-4'}`}>
        <div className={`${isMobile ? 'space-y-3' : 'flex items-center justify-between'}`}>
          <div className="flex-1 min-w-0">
            <CardTitle className={`${isMobile ? 'text-sm' : 'text-lg'} flex items-center gap-2 mb-2`}>
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="truncate">{trip.origin} → {trip.destination}</span>
            </CardTitle>
            {trip.flight_number && (
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 flex items-center gap-2`}>
                <Plane className="h-3 w-3" />
                Vuelo: {trip.flight_number}
              </p>
            )}
          </div>
          <Button
            onClick={() => handleAddPackage(trip.id)}
            size={isMobile ? "sm" : "default"}
            className={`${isMobile ? 'w-full text-xs' : 'text-sm'} flex items-center gap-2`}
          >
            <Plus className="h-3 w-3" />
            Agregar Encomienda
          </Button>
        </div>
        
        {/* Resumen de totales */}
        <div className={`${isMobile ? 'grid grid-cols-2 gap-2 mt-3' : 'grid grid-cols-4 gap-4 mt-4'}`}>
          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-blue-50 rounded-lg`}>
            <Package className="h-4 w-4 text-blue-600" />
            <div>
              <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-blue-800`}>{trip.packages.length}</div>
              <div className="text-xs text-blue-600">Paquetes</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-purple-50 rounded-lg`}>
            <Weight className="h-4 w-4 text-purple-600" />
            <div>
              <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-purple-800`}>
                {Object.values(totalsByCurrency).reduce((acc, curr) => acc + curr.weight, 0)} kg
              </div>
              <div className="text-xs text-purple-600">Peso</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-orange-50 rounded-lg`}>
            <DollarSign className="h-4 w-4 text-orange-600" />
            <div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-orange-800`}>
                {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                  <div key={currency}>
                    {formatCurrency(totals.freight, currency as Currency)}
                  </div>
                ))}
              </div>
              <div className="text-xs text-orange-600">Flete</div>
            </div>
          </div>
          
          <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-green-50 rounded-lg`}>
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-green-800`}>
                {Object.entries(totalsByCurrency).map(([currency, totals]) => (
                  <div key={currency}>
                    {formatCurrency(totals.amount_to_collect, currency as Currency)}
                  </div>
                ))}
              </div>
              <div className="text-xs text-green-600">A Cobrar</div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'px-4 pb-3' : 'px-6 pb-4'}`}>
        {trip.packages.length === 0 ? (
          <div className={`text-center ${isMobile ? 'py-4' : 'py-6'} text-gray-500`}>
            <Package className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No hay encomiendas en este viaje</p>
          </div>
        ) : (
          <div className={`${isMobile ? 'space-y-2' : 'space-y-2'}`}>
            {trip.packages.map((pkg) => (
              <PackageItem
                key={pkg.id}
                package={pkg}
                onClick={() => handlePackageClick(pkg)}
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
