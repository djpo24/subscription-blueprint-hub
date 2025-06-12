
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerData } from '@/hooks/useCustomerData';
import { useCustomerPackagesData } from '@/hooks/useCustomerPackagesData';
import { useCustomerFinancialData } from '@/hooks/useCustomerFinancialData';
import { User, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { CustomerFinancesTabs } from './CustomerFinancesTabs';

interface CustomerInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId: string;
  customerName: string;
  customerPhone: string;
}

export function CustomerInfoDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  customerPhone
}: CustomerInfoDialogProps) {
  const { customer, isLoading: customerLoading } = useCustomerData(customerId);
  const { packages, isLoading: packagesLoading } = useCustomerPackagesData(customerId);
  const { financialData, isLoading: financialLoading } = useCustomerFinancialData(customerId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_transit': 'bg-blue-100 text-blue-800',
      'en_destino': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      'pending': 'Pendiente',
      'in_transit': 'En Tránsito',
      'en_destino': 'En Destino',
      'delivered': 'Entregado',
      'cancelled': 'Cancelado'
    };

    return (
      <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const isLoading = customerLoading || packagesLoading || financialLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información de {customerName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Cargando información del cliente...</div>
          </div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info Personal</TabsTrigger>
              <TabsTrigger value="packages">Encomiendas</TabsTrigger>
              <TabsTrigger value="finances">Finanzas</TabsTrigger>
              <TabsTrigger value="special">Casos Especiales</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nombre</label>
                      <p className="text-sm">{customer?.name || customerName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Teléfono</label>
                      <p className="text-sm">{customerPhone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                      <p className="text-sm">{customer?.whatsapp_number || 'No registrado'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm">{customer?.email || 'No registrado'}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Dirección</label>
                      <p className="text-sm">{customer?.address || 'No registrada'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="packages" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Encomiendas ({packages?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {packages && packages.length > 0 ? (
                    <div className="space-y-3">
                      {packages.map((pkg) => (
                        <div key={pkg.id} className="border rounded-lg p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{pkg.tracking_number}</span>
                            {getStatusBadge(pkg.status)}
                          </div>
                          <p className="text-sm text-gray-600">{pkg.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>
                              <span className="font-medium">Origen:</span> {pkg.origin}
                            </div>
                            <div>
                              <span className="font-medium">Destino:</span> {pkg.destination}
                            </div>
                            <div>
                              <span className="font-medium">Flete:</span> {formatCurrency(pkg.freight || 0)}
                            </div>
                            <div>
                              <span className="font-medium">Por cobrar:</span> {formatCurrency(pkg.amount_to_collect || 0)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No hay encomiendas registradas</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finances" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Flete</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(financialData?.totalFreight || 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Pendiente Cobro</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatCurrency(financialData?.totalPending || 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Cobrado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(financialData?.totalCollected || 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <CustomerFinancesTabs customerId={customerId} />
            </TabsContent>

            <TabsContent value="special" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    Pedidos Fuera de Parámetros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {packages && packages.length > 0 ? (
                    <div className="space-y-3">
                      {packages
                        .filter(pkg => {
                          // Filtrar paquetes que están fuera de los parámetros normales
                          const isSpecial = pkg.status === 'cancelled' || 
                                          (pkg.amount_to_collect && pkg.amount_to_collect > 500000) ||
                                          (pkg.freight && pkg.freight > 100000) ||
                                          pkg.status === 'pending' && new Date(pkg.created_at).getTime() < Date.now() - (30 * 24 * 60 * 60 * 1000);
                          return isSpecial;
                        })
                        .map((pkg) => (
                          <div key={pkg.id} className="border border-yellow-200 rounded-lg p-4 space-y-2 bg-yellow-50">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{pkg.tracking_number}</span>
                              {getStatusBadge(pkg.status)}
                            </div>
                            <p className="text-sm text-gray-600">{pkg.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                              <div>
                                <span className="font-medium">Origen:</span> {pkg.origin}
                              </div>
                              <div>
                                <span className="font-medium">Destino:</span> {pkg.destination}
                              </div>
                              <div>
                                <span className="font-medium">Flete:</span> {formatCurrency(pkg.freight || 0)}
                              </div>
                              <div>
                                <span className="font-medium">Por cobrar:</span> {formatCurrency(pkg.amount_to_collect || 0)}
                              </div>
                            </div>
                            <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded">
                              <strong>Motivo:</strong> 
                              {pkg.status === 'cancelled' && ' Paquete cancelado'}
                              {pkg.amount_to_collect && pkg.amount_to_collect > 500000 && ' Monto elevado por cobrar'}
                              {pkg.freight && pkg.freight > 100000 && ' Flete elevado'}
                              {pkg.status === 'pending' && new Date(pkg.created_at).getTime() < Date.now() - (30 * 24 * 60 * 60 * 1000) && ' Pendiente por más de 30 días'}
                            </div>
                          </div>
                        ))}
                      {packages.filter(pkg => {
                        const isSpecial = pkg.status === 'cancelled' || 
                                        (pkg.amount_to_collect && pkg.amount_to_collect > 500000) ||
                                        (pkg.freight && pkg.freight > 100000) ||
                                        pkg.status === 'pending' && new Date(pkg.created_at).getTime() < Date.now() - (30 * 24 * 60 * 60 * 1000);
                        return isSpecial;
                      }).length === 0 && (
                        <p className="text-center text-gray-500 py-8">No hay pedidos fuera de parámetros</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">No hay encomiendas para evaluar</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
