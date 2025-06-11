
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Package, 
  User, 
  MapPin, 
  FileText, 
  Weight, 
  DollarSign, 
  Coins, 
  Calendar,
  Truck,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  AlertCircle,
  Route
} from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';
import { formatAmountToCollectWithCurrency, parseCurrencyString } from '@/utils/currencyFormatter';
import { formatDateTime } from '@/utils/dateUtils';
import { PhoneWithFlag } from '@/components/PhoneWithFlag';

interface PackageInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: PackageInDispatch | null;
}

export function PackageInfoDialog({ open, onOpenChange, package: pkg }: PackageInfoDialogProps) {
  if (!pkg) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'en_destino':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'procesado':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'in_transit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'arrived':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'en_destino':
        return 'En Destino';
      case 'procesado':
        return 'Procesado';
      case 'in_transit':
        return 'En Tránsito';
      case 'arrived':
        return 'Arribado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'en_destino':
        return <MapPin className="h-4 w-4" />;
      case 'procesado':
        return <Package className="h-4 w-4" />;
      case 'in_transit':
        return <Truck className="h-4 w-4" />;
      case 'arrived':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const formatAmountToCollectDisplay = (amount: number | null | undefined, currencyStr: string | null | undefined) => {
    if (!amount || amount === 0) return 'Sin monto a cobrar';
    
    const currency = parseCurrencyString(currencyStr);
    return formatAmountToCollectWithCurrency(amount, currency);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="font-bold text-gray-900">Encomienda {pkg.tracking_number}</div>
              <div className="text-sm text-gray-500 font-normal">Información completa del paquete</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y información básica */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">Estado Actual</span>
                <Badge className={`${getStatusColor(pkg.status)} flex items-center gap-2`}>
                  {getStatusIcon(pkg.status)}
                  {getStatusLabel(pkg.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Route className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Ruta</div>
                    <div className="font-medium">{pkg.origin} → {pkg.destination}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Número de seguimiento</div>
                    <div className="font-medium font-mono text-blue-600">{pkg.tracking_number}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del cliente */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                Información del Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Nombre</div>
                    <div className="font-medium">{pkg.customers?.name || 'No especificado'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">{pkg.customers?.email || 'No especificado'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Teléfono</div>
                    <div className="font-medium">
                      {pkg.customers?.phone ? (
                        <PhoneWithFlag phone={pkg.customers.phone} />
                      ) : (
                        'No especificado'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descripción del paquete */}
          {pkg.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Descripción del Contenido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <p className="text-gray-700 leading-relaxed">{pkg.description}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información financiera */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Weight className="h-4 w-4 text-orange-600" />
                  Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-700">
                  {pkg.weight ? `${pkg.weight} kg` : 'No especificado'}
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Flete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {formatCurrency(pkg.freight)}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  A Cobrar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700">
                  {formatAmountToCollectDisplay(pkg.amount_to_collect, pkg.currency)}
                </div>
                {pkg.currency && pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                    <Coins className="h-3 w-3" />
                    Moneda: {pkg.currency}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Información de entrega (si está entregado) */}
          {pkg.status === 'delivered' && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Información de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pkg.delivered_at && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm text-green-600">Fecha de entrega</div>
                        <div className="font-medium text-green-800">
                          {formatDateTime(pkg.delivered_at)}
                        </div>
                      </div>
                    </div>
                  )}
                  {pkg.delivered_by && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="text-sm text-green-600">Entregado por</div>
                        <div className="font-medium text-green-800">{pkg.delivered_by}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
