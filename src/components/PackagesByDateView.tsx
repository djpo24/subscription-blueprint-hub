
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Plus, Calendar, Weight, DollarSign, Truck } from 'lucide-react';
import { usePackagesByDate } from '@/hooks/usePackagesByDate';

interface PackagesByDateViewProps {
  selectedDate: Date;
  onBack: () => void;
  onAddPackage: (tripId: string) => void;
}

export function PackagesByDateView({ selectedDate, onBack, onAddPackage }: PackagesByDateViewProps) {
  const { data: packagesByTrip = [], isLoading } = usePackagesByDate(selectedDate);

  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>Cargando encomiendas...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Cargando encomiendas del día...
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPackages = packagesByTrip.reduce((total, trip) => total + trip.packages.length, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Encomiendas del {formatDate(selectedDate)}
          </CardTitle>
        </div>
        <div className="text-sm text-gray-600">
          {totalPackages} encomienda{totalPackages !== 1 ? 's' : ''} en {packagesByTrip.length} viaje{packagesByTrip.length !== 1 ? 's' : ''}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {packagesByTrip.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay viajes programados
            </h3>
            <p className="text-gray-500">
              No se encontraron viajes para el {formatDate(selectedDate)}
            </p>
          </div>
        ) : (
          packagesByTrip.map((trip) => (
            <Card key={trip.id} className="border-l-4 border-l-blue-500">
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
                    {trip.packages.map((pkg) => {
                      // Contar items en la descripción
                      const itemCount = pkg.description 
                        ? pkg.description.split(',').filter(item => item.trim()).length 
                        : 0;

                      return (
                        <div
                          key={pkg.id}
                          className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm">
                              {pkg.tracking_number}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                pkg.status === 'delivered' ? 'bg-green-50 text-green-700' :
                                pkg.status === 'in_transit' ? 'bg-blue-50 text-blue-700' :
                                pkg.status === 'arrived' ? 'bg-orange-50 text-orange-700' :
                                'bg-gray-50 text-gray-700'
                              }`}
                            >
                              {pkg.status}
                            </Badge>
                          </div>
                          
                          {/* Cliente y conteo de items en la misma línea */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-base font-bold text-blue-700">
                              {pkg.customers?.name || 'Cliente no especificado'}
                            </div>
                            
                            {itemCount > 0 && (
                              <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                <span className="font-medium">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                              </div>
                            )}
                          </div>

                          {/* Información de peso - solo mostramos peso ya que existe en la BD */}
                          <div className="flex justify-center">
                            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                              <Weight className="h-4 w-4 text-gray-500" />
                              <div className="text-sm">
                                <div className="text-gray-500">Peso</div>
                                <div className="font-medium">
                                  {pkg.weight || '0'} kg
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </CardContent>
    </Card>
  );
}
